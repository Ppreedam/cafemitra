"""
Fetch pending Google Places leads from the local API, scrape full details for
each one via Selenium, save the scraped details back to the API, then flip
the original record's extracted_status to false so it isn't picked up again.
"""

import time

import requests

from google_maps_scraper_selenium import GoogleMapsScraper

BASE_URL = "http://127.0.0.1:8000"
PLACES_URL = f"{BASE_URL}/api/google-places"
PLACE_DETAILS_URL = f"{BASE_URL}/api/google-place-details"

MAX_PLACES_PER_RUN = 3  # stop after scraping this many places in one run


def fetch_pending_places():
    resp = requests.get(PLACES_URL, params={"extracted_status": "false"}, timeout=15)
    resp.raise_for_status()

    data = resp.json()
    places = data.get("places", [])

    print(f"Fetched {len(places)} place(s) pending extraction")

    return places


def save_place_details(payload):
    resp = requests.post(PLACE_DETAILS_URL, json=payload, timeout=15)

    if resp.status_code not in (200, 201):
        print(f"  ⚠️ Failed to save details: {resp.status_code} - {resp.text}")
        return False

    return True


def mark_as_extracted(place_id):
    url = f"{PLACES_URL}/{place_id}"
    resp = requests.patch(url, json={"extracted_status": False}, timeout=15)

    if resp.status_code not in (200, 204):
        print(f"  ⚠️ Failed to update extracted_status for id {place_id}: {resp.status_code} - {resp.text}")
        return False

    return True


def build_details_payload(scraped, fallback_name=None):
    return {
        "address": scraped.get("address"),
        "image": scraped.get("image"),
        "latitude": scraped.get("latitude"),
        "longitude": scraped.get("longitude"),
        "maps_url": scraped.get("maps_url"),
        "name": scraped.get("name") or fallback_name,
        "phone": scraped.get("phone"),
        "rating": scraped.get("rating"),
        "reviews": scraped.get("reviews"),
        "website": scraped.get("website"),
    }


def main():
    places = fetch_pending_places()

    if not places:
        print("Nothing to extract. Exiting.")
        return

    if len(places) > MAX_PLACES_PER_RUN:
        print(f"Limiting this run to the first {MAX_PLACES_PER_RUN} place(s)")
        places = places[:MAX_PLACES_PER_RUN]

    scraper = GoogleMapsScraper(headless=True)

    try:
        for place in places:
            place_id = place.get("id")
            link = place.get("link")
            name = place.get("name")

            print(f"\n[{place_id}] Scraping: {name}")

            if not link:
                print("  ⚠️ No link found, skipping.")
                continue

            try:
                scraped = scraper.scrape(link)
            except Exception as e:
                print(f"  ❌ Scrape failed: {e}")
                continue

            payload = build_details_payload(scraped, fallback_name=name)

            if save_place_details(payload):
                print(f"  ✅ Details saved for: {payload['name']}")

                if mark_as_extracted(place_id):
                    print(f"  ✅ extracted_status set to false for id {place_id}")

            time.sleep(1)  # polite delay between places

    finally:
        scraper.close()

    print("\nDone.")


if __name__ == "__main__":
    main()
