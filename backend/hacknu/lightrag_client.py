import os
import httpx
from typing import Optional

BASE = os.getenv("LIGHTRAG_BASE_URL", "http://localhost:9621")
TIMEOUTS = httpx.Timeout(connect=10, read=180, write=180, pool=60)
async def query_lightrag(query_text: str):
    api_key = os.getenv("LIGHTRAG_API_KEY")
    headers = {}
    if api_key:
        headers["X-API-Key"] = api_key

    async with httpx.AsyncClient(timeout=TIMEOUTS) as client:
        body = {
            "query": query_text,
            "mode": "mix",
            "response_type": "JSON",
            "top_k": 20,
            "chunk_top_k": 15,
            "enable_rerank": False,
            "history_turns": 0
        }
        try:
            r = await client.post(f"{BASE}/query", json=body, headers=headers)
            r.raise_for_status()
            return r.json()
        except httpx.RequestError as e:
            raise Exception(f"Error querying LightRAG: {e}")
