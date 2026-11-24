"""Reservation expiry scheduler.
Calls both order and seat expiry endpoints.
Interval: EXPIRE_INTERVAL_SECONDS (default 60).
"""
import os
import asyncio
import httpx

async def run_expiry_loop():
    secret = os.getenv("INTERNAL_API_SECRET", "")
    interval = int(os.getenv("EXPIRE_INTERVAL_SECONDS", "60"))
    base = os.getenv("INTERNAL_API_URL", "http://127.0.0.1:8000")
    headers = {"X-Internal-Job": secret}
    urls = [
        base + "/orders/internal/expire-reservations",
        base + "/seat-maps/internal/expire-seat-reservations",
        base + "/admin/cms/internal/publish-scheduled",
    ]
    while True:
        for url in urls:
            try:
                async with httpx.AsyncClient() as client:
                    r = await client.post(url, headers=headers, timeout=10)
                    print(f"expire {url}: {r.status_code}")
            except Exception as e:
                print(f"expire error {url}: {e}")
        await asyncio.sleep(interval)

if __name__ == "__main__":
    asyncio.run(run_expiry_loop())
