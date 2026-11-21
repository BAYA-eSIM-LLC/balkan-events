import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def check():
    url = os.environ["DATABASE_URL"]
    eng = create_async_engine(url)
    async with eng.connect() as conn:
        r = await conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"))
        tables = [row[0] for row in r]
        print("Tables:", tables)
        required = ["users", "organizations", "events", "ticket_types", "ticket_inventory", "reservations", "ledger_entries"]
        missing = [t for t in required if t not in tables]
        assert not missing, f"Missing tables: {missing}"
        print("Schema OK")
    await eng.dispose()

if __name__ == "__main__":
    asyncio.run(check())
