import os
from app.services import rate_limit

def test_memory_limit():
    os.environ.pop("REDIS_URL", None)
    key = "test-memory-limit"
    rate_limit._memory.pop(key, None)
    assert rate_limit.limited(key, limit=2, window=60) is False
    assert rate_limit.limited(key, limit=2, window=60) is False
    assert rate_limit.limited(key, limit=2, window=60) is True
