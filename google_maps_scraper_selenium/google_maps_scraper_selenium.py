import re
import time
from urllib.parse import unquote

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


class GoogleMapsScraper:

    def __init__(self, headless=True):

        options = Options()

        if headless:
            options.add_argument("--headless=new")

        options.add_argument("--window-size=1600,1200")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--lang=en")

        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )

        self.wait = WebDriverWait(self.driver, 25)

    def safe_text(self, by, value):

        try:
            return self.driver.find_element(by, value).text.strip()
        except:
            return None

    def safe_attr(self, by, value, attr):

        try:
            return self.driver.find_element(by, value).get_attribute(attr)
        except:
            return None

    def safe_aria_field(self, by, value, label_prefix):

        # These info-panel buttons render a leading icon glyph (a private-use-area
        # unicode char) inside .text, e.g. '\nSHIV MANDIR, ...'. The
        # aria-label carries the same info without the icon, e.g.
        # 'Address: SHIV MANDIR, ...', so prefer that over .text.

        try:
            el = self.driver.find_element(by, value)
        except:
            return None

        aria = el.get_attribute("aria-label") or ""
        m = re.search(rf'{label_prefix}:\s*(.+)', aria)

        if m:
            return m.group(1).strip()

        # Fallback: strip the leading icon glyph (private-use-area unicode char)
        # from the visible text, then rejoin the remaining lines.
        text = el.text or ""
        cleaned = re.sub(r'[-]', '', text)
        lines = [line.strip() for line in cleaned.splitlines() if line.strip()]

        return " ".join(lines) or None

    def get_coordinates(self, url):

        m = re.search(r'!3d([-0-9.]+)!4d([-0-9.]+)', url)

        if m:
            return m.group(1), m.group(2)

        m = re.search(r'@([-0-9.]+),([-0-9.]+)', url)

        if m:
            return m.group(1), m.group(2)

        return None, None

    def scrape(self, url):

        self.driver.get(url)

        self.wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )

        time.sleep(2)

        data = {}

        # -------------------------
        # Name
        # -------------------------

        data["name"] = self.safe_text(By.TAG_NAME, "h1")

        # -------------------------
        # Address
        # -------------------------

        data["address"] = self.safe_aria_field(
            By.CSS_SELECTOR,
            'button[data-item-id="address"]',
            "Address"
        )

        # -------------------------
        # Phone
        # -------------------------

        data["phone"] = self.safe_aria_field(
            By.CSS_SELECTOR,
            'button[data-item-id^="phone"]',
            "Phone"
        )

        # -------------------------
        # Website
        # -------------------------

        try:
            website = self.driver.find_element(
                By.CSS_SELECTOR,
                'a[data-item-id="authority"]'
            )

            data["website"] = website.get_attribute("href")

        except:
            data["website"] = None

        # -------------------------
        # Image
        # -------------------------

        try:

            img = self.driver.find_element(
                By.CSS_SELECTOR,
                'button[aria-label^="Photo"] img'
            )

            data["image"] = img.get_attribute("src")

        except:

            try:

                img = self.driver.find_element(
                    By.CSS_SELECTOR,
                    "img[src*='googleusercontent']"
                )

                data["image"] = img.get_attribute("src")

            except:
                data["image"] = None

        # -------------------------
        # Rating & Reviews
        # (both live inside the div.F7nice widget as span[role="img"] elements;
        # the review-count span is marked jslog "mutable:true" and can render a
        # beat after the rating, so it gets its own explicit wait instead of
        # relying on the initial time.sleep(2) above)
        # -------------------------

        try:
            label = self.driver.find_element(
                By.CSS_SELECTOR,
                'div.F7nice span[aria-label*="star"]'
            ).get_attribute("aria-label")

            m = re.search(r'([0-9.]+)', label)

            data["rating"] = m.group(1) if m else None

        except:
            data["rating"] = None

        try:
            review_el = self.wait.until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, 'div.F7nice span[aria-label*="review"]')
                )
            )

            label = review_el.get_attribute("aria-label")

            m = re.search(r'([0-9,]+)', label)

            data["reviews"] = m.group(1) if m else None

        except:
            data["reviews"] = None

        # -------------------------
        # Coordinates
        # -------------------------

        lat, lng = self.get_coordinates(self.driver.current_url)

        data["latitude"] = lat
        data["longitude"] = lng

        data["maps_url"] = self.driver.current_url

        return data

    def close(self):

        self.driver.quit()


if __name__ == "__main__":

    url = "https://www.google.com/maps/place/SATHI+CYBER+CAFE/data=!4m7!3m6!1s0x39ecf1de9463665d:0x35cbe3419fd7dc31!8m2!3d26.5996223!4d85.4952668!16s%2Fg%2F11xzxvwg0j!19sChIJXWZjlN7x7DkRMdzXn0HjyzU?authuser=0&hl=en&rclk=1"

    scraper = GoogleMapsScraper(headless=False)

    result = scraper.scrape(url)

    scraper.close()

    from pprint import pprint

    pprint(result)