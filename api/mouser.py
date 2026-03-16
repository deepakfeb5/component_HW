import os
import time
import json
import random
import logging
from typing import List, Dict, Any, Optional, Tuple

import pandas as pd
import requests
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(message)s"
)
LOGGER = logging.getLogger("mouser_api")

CONNECT_TIMEOUT = float(os.getenv("CONNECT_TIMEOUT", "5"))
READ_TIMEOUT = float(os.getenv("READ_TIMEOUT", "45"))
TIMEOUT = (CONNECT_TIMEOUT, READ_TIMEOUT)

CALLS_PER_MIN = int(os.getenv("MOUSER_CALLS_PER_MINUTE", "10"))
MIN_INTERVAL = 60.0 / max(CALLS_PER_MIN, 1)

MAX_RETRIES = int(os.getenv("MAX_RETRIES", "5"))
BACKOFF_BASE = float(os.getenv("BACKOFF_BASE", "1.2"))
BACKOFF_CAP = float(os.getenv("BACKOFF_CAP", "30"))

session = requests.Session()

class RateLimiter:
    def __init__(self, min_interval: float):
        self.min_interval = min_interval
        self._next_ok = time.monotonic()

    def wait(self):
        now = time.monotonic()
        if now < self._next_ok:
            time.sleep(self._next_ok - now)
        self._next_ok = time.monotonic() + self.min_interval

rate_limiter = RateLimiter(MIN_INTERVAL)

def compute_total(price: Optional[str], qty: int) -> Optional[float]:
    if price is None:
        return None
    try:
        p = float(price.replace("$", "").replace(",", "").strip())
        return round(p * qty, 4)
    except:
        return None

class MouserClient:
    SEARCH_URL = "https://api.mouser.com/api/v1/search/partnumber"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.cache: Dict[str, Tuple[Optional[Dict], List[str], Optional[str]]] = {}

    def _backoff_sleep(self, attempt: int):
        delay = min(BACKOFF_CAP, (BACKOFF_BASE ** attempt)) + random.random() * 0.2
        time.sleep(delay)

    def _post_once(self, mpn: str) -> requests.Response:
        rate_limiter.wait()
        return session.post(
            self.SEARCH_URL,
            params={"apiKey": self.api_key},
            json={"SearchByPartRequest": {"mouserPartNumber": mpn}},
            timeout=TIMEOUT,
        )

    def search_part(self, mpn: str):
        mpn_key = mpn.strip()

        if mpn_key in self.cache:
            return self.cache[mpn_key]

        last_exc = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = self._post_once(mpn_key)
            except Exception as e:
                last_exc = e
                self._backoff_sleep(attempt)
                continue

            if resp.status_code == 200:
                try:
                    data = resp.json()
                except:
                    result = (None, [], "Invalid JSON")
                    self.cache[mpn_key] = result
                    return result

                parts = data.get("SearchResults", {}).get("Parts", [])
                if not parts:
                    result = (None, [], "No results")
                    self.cache[mpn_key] = result
                    return result

                main = parts[0]
                alternates = [p.get("ManufacturerPartNumber", "") for p in parts[1:]]

                price_breaks = main.get("PriceBreaks", []) or []
                unit_price = price_breaks[0].get("Price") if price_breaks else None

                main_data = {
                    "price": unit_price,
                    "lifecycle": main.get("LifecycleStatus"),
                    "manufacturer": main.get("Manufacturer"),
                    "stock": main.get("Availability"),
                }

                result = (main_data, alternates, None)
                self.cache[mpn_key] = result
                return result

            if resp.status_code in (403, 429):
                self._backoff_sleep(attempt)
                continue

            result = (None, [], f"HTTP {resp.status_code}")
            self.cache[mpn_key] = result
            return result

        result = (None, [], f"Network error: {last_exc}")
        self.cache[mpn_key] = result
        return result


app = FastAPI(title="Mouser BOM API")

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/process-bom")
async def process_bom(file: UploadFile = File(...)):
    api_key = os.getenv("MOUSER_API_KEY", "").strip()
    if not api_key:
        return JSONResponse({"error": "MOUSER_API_KEY missing"}, status_code=500)

    mouser = MouserClient(api_key)

    try:
        df = pd.read_csv(file.file)
    except Exception as e:
        return JSONResponse({"error": f"Invalid CSV: {e}"}, status_code=400)

    if "PartNumber" not in df or "Quantity" not in df:
        return JSONResponse(
            {"error": "CSV must contain PartNumber and Quantity columns"},
            status_code=400,
        )

    df["Quantity"] = pd.to_numeric(df["Quantity"], errors="coerce").fillna(0).astype(int)
    df["PartNumber"] = df["PartNumber"].astype(str).str.strip()

    results = []
    total_cost = 0

    for _, row in df.iterrows():
        mpn = row["PartNumber"]
        qty = row["Quantity"]

        data, alternates, error = mouser.search_part(mpn)

        entry = {
            "PartNumber": mpn,
            "Quantity": qty,
            "Manufacturer": None,
            "Lifecycle": None,
            "Stock": None,
            "UnitPrice": None,
            "TotalPrice": None,
            "Alternates": alternates,
            "Error": error,
        }

        if not error and data:
            entry["Manufacturer"] = data.get("manufacturer")
            entry["Lifecycle"] = data.get("lifecycle")
            entry["Stock"] = data.get("stock")
            entry["UnitPrice"] = data.get("price")

            total = compute_total(entry["UnitPrice"], qty)
            entry["TotalPrice"] = total
            if total:
                total_cost += total

        results.append(entry)

    return {"results": results, "total_cost": round(total_cost, 2)}
