"""Shared rate limiter. Uses Redis when REDIS_URL is set, else in-process."""
import os
import time
from typing import Optional

_memory: dict[str, list[float]] = {}

def _redis():
    url = os.getenv("REDIS_URL", "")
    if not url:
        return None
    try:
        import redis
        return redis.Redis.from_url(url, decode_responses=True)
    except Exception:
        return None

def limited(key: str, limit: int = 5, window: int = 300) -> bool:
    r = _redis()
    if r is not None:
        try:
            pipe = r.pipeline()
            now = int(time.time())
            bucket = f"rl:{key}"
            pipe.zremrangebyscore(bucket, 0, now - window)
            pipe.zadd(bucket, {str(now): now})
            pipe.zcard(bucket)
            pipe.expire(bucket, window)
            _, _, count, _ = pipe.execute()
            return count > limit
        except Exception:
            pass
    now = time.time()
    hits = [t for t in _memory.get(key, []) if now - t < window]
    if len(hits) >= limit:
        _memory[key] = hits
        return True
    hits.append(now)
    _memory[key] = hits
    return False
