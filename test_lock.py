
import asyncio
from application import _async_search

if __name__ == "__main__":
    try:
        res = asyncio.run(_async_search("What project is Alice on?"))
        print(f"SUCCESS: {res}")
    except Exception as e:
        print(f"FAILED: {e}")
