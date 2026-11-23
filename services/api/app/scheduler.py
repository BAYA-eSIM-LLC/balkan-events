"""Simple reservation expiry scheduler.
Call from a process manager or cron:
  curl -X POST -H "X-Internal-Job: $INTERNAL_API_SECRET" http://localhost:8000/orders/internal/expire-reservations
Interval: configurable via EXPIRE_INTERVAL_SECONDS (default 60).
"""
import os
import asyncio
import httpx

async def run_expiry_loop():
    secret = os.getenv("INTERNAL_API_SECRET", "")
    interval = int(os.getenv("EXPIRE_INTERVAL_SECONDS", "60"))
    url = os.getenv("INTERNAL_API_URL", "http://127.0.0.1:8000") + "/orders/internal/expire-reservations"
    while True:
        try:
            async with httpx.AsyncClient() as client:
                r = await client.post(url, headers={"X-Internal-Job": secret}, timeout=10)
                print(f"expire job: {r.status_code}")
        except Exception as e:
            print(f"expire job error: {e}")
        await asyncio.sleep(interval)

if __name__ == "__main__":
    asyncio.run(run_expiry_loop())
