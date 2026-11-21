from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
from app.database import Base
from app.models import *

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_online():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async def do_run_migrations(connection):
        context.configure(connection=connection, target_metadata=target_metadata)
        async with context.begin_transaction():
            await context.run_migrations()
    import asyncio
    asyncio.run(do_run_migrations(connectable.connect()))

if context.is_offline_mode():
    pass
else:
    run_migrations_online()
