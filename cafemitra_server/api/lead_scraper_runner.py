"""Runs the fetch -> scrape -> save -> mark-extracted loop that
google_maps_scraper_selenium/fetch_save_data.py runs as a standalone script -
same feature set (pending queue -> Selenium scrape -> save full lead ->
flip extracted_status), but called from the admin dashboard's "Run
Extractor" button instead of a manually-run script, and talking to the DB
directly through the ORM instead of looping back through its own HTTP API.

Runs on a background thread (see admin_views.admin_leads_scrape_run) so the
POST that starts it returns immediately - Selenium+Chrome is far too slow
to run inside a request/response cycle.
"""

import time
import traceback

from django.utils import timezone

from .gmaps_scraper import GoogleMapsScraper
from .models import GooglePlace, GooglePlaceDetail, ScrapeRun
from .views import decimal_or_none, int_or_none

POLITE_DELAY_SECONDS = 1


def _append_log(run, line):
    stamp = timezone.now().strftime("%H:%M:%S")
    run.log = f"{run.log}[{stamp}] {line}\n"
    run.save(update_fields=["log"])


def _clean_reviews(value):
    if value is None:
        return None
    return int_or_none(str(value).replace(",", ""))


def run_scrape_job(run_id):
    run = ScrapeRun.objects.get(id=run_id)

    pending = list(GooglePlace.objects.filter(extracted_status=False).order_by("created_at")[: run.max_places])
    if not pending:
        _append_log(run, "Nothing pending - exiting.")
        run.status = ScrapeRun.STATUS_COMPLETED
        run.completed_at = timezone.now()
        run.save(update_fields=["status", "completed_at"])
        return

    _append_log(run, f"Found {len(pending)} pending place(s). Starting Chrome...")

    try:
        scraper = GoogleMapsScraper(headless=True)
    except Exception as exc:
        run.status = ScrapeRun.STATUS_FAILED
        run.error_message = f"Could not start Chrome/Selenium: {exc}"
        run.completed_at = timezone.now()
        run.save(update_fields=["status", "error_message", "completed_at"])
        _append_log(run, f"Failed to start Chrome: {exc}")
        return

    started_by_label = run.started_by.email if run.started_by else "auto-scraper"

    try:
        for place in pending:
            if not place.link:
                _append_log(run, f"[{place.id}] {place.name}: no link, skipping.")
                run.failed_count += 1
                run.processed_count += 1
                run.save(update_fields=["failed_count", "processed_count"])
                continue

            _append_log(run, f"[{place.id}] Scraping: {place.name}")
            try:
                scraped = scraper.scrape(place.link)
            except Exception as exc:
                _append_log(run, f"[{place.id}] Scrape failed: {exc}")
                run.failed_count += 1
                run.processed_count += 1
                run.save(update_fields=["failed_count", "processed_count"])
                continue

            maps_url = scraped.get("maps_url") or place.link
            name = scraped.get("name") or place.name

            try:
                detail, created = GooglePlaceDetail.objects.get_or_create(
                    maps_url=maps_url,
                    defaults={
                        "name": name,
                        "address": scraped.get("address") or "",
                        "image": scraped.get("image") or "",
                        "latitude": decimal_or_none(scraped.get("latitude")),
                        "longitude": decimal_or_none(scraped.get("longitude")),
                        "phone": scraped.get("phone") or "",
                        "rating": decimal_or_none(scraped.get("rating")),
                        "reviews": _clean_reviews(scraped.get("reviews")),
                        "website": scraped.get("website") or "",
                    },
                )
                # A duplicate maps_url isn't a scrape failure - the lead
                # already exists (e.g. someone added it manually in the
                # meantime) - still clear it out of the pending queue below
                # rather than leaving it to be retried forever.
                note = "created new lead" if created else "lead already existed, linked"
                place.extracted_status = True
                place.extractedby = f"Selenium extractor ({started_by_label})"
                place.save(update_fields=["extracted_status", "extractedby", "updated_at"])

                _append_log(run, f"[{place.id}] Saved: {detail.name} ({note}).")
                run.success_count += 1
            except Exception as exc:
                _append_log(run, f"[{place.id}] Save failed: {exc}")
                run.failed_count += 1

            run.processed_count += 1
            run.save(update_fields=["processed_count", "success_count", "failed_count"])
            time.sleep(POLITE_DELAY_SECONDS)
    except Exception:
        run.status = ScrapeRun.STATUS_FAILED
        run.error_message = traceback.format_exc()
        _append_log(run, "Run crashed - see error_message.")
    else:
        run.status = ScrapeRun.STATUS_COMPLETED
    finally:
        try:
            scraper.close()
        except Exception:
            pass
        run.completed_at = timezone.now()
        run.save(update_fields=["status", "error_message", "completed_at"])
        _append_log(run, f"Done. {run.success_count} succeeded, {run.failed_count} failed.")
