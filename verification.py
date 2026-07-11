import asyncio
import httpx
import json
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from backend.app.config import get_settings

settings = get_settings()

async def main():
    print("=== Starting Verification ===")
    
    # 1. Connect to Redis and subscribe to events
    redis = Redis.from_url(settings.redis_url)
    pubsub = redis.pubsub()
    await pubsub.psubscribe("pipeline.*", "agent.*")
    print("[1/5] Subscribed to Redis events")

    # 2. Upload document
    print("[2/5] Uploading sample PDF...")
    async with httpx.AsyncClient() as client:
        # Wait for health endpoint first
        for _ in range(10):
            try:
                res = await client.get("http://localhost:8000/docs")
                if res.status_code == 200:
                    break
            except Exception:
                pass
            await asyncio.sleep(2)
            
        files = {'file': ('test_prospectus.pdf', b'%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF', 'application/pdf')}
        response = await client.post("http://localhost:8000/api/v1/upload", files=files)
        response.raise_for_status()
        upload_data = response.json()
        print(f"Upload Response: {json.dumps(upload_data, indent=2)}")
        
    document_id = upload_data["document_id"]

    # 3. Listen to Redis events
    print("[3/5] Waiting for Celery / LangGraph events (listening for 10s)...")
    events_received = []
    
    async def listen_events():
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message:
                channel = message['channel'].decode('utf-8')
                data = message['data'].decode('utf-8')
                print(f"EVENT >> {channel}: {data}")
                events_received.append(channel)
            await asyncio.sleep(0.1)

    listen_task = asyncio.create_task(listen_events())
    await asyncio.sleep(10)
    listen_task.cancel()

    # 4. Verify DB Records
    print("\n[4/5] Verifying DB Records...")
    engine = create_async_engine(settings.database_url)
    async with engine.connect() as conn:
        doc_result = await conn.execute(text(f"SELECT id, filename, processing_status FROM documents WHERE id = '{document_id}'"))
        doc = doc_result.fetchone()
        print(f"Document Record: {doc}")
        
        job_result = await conn.execute(text("SELECT id, status FROM jobs ORDER BY started_at DESC LIMIT 1"))
        job = job_result.fetchone()
        print(f"Latest Job Record: {job}")

    # 5. Done
    print("\n[5/5] Skipping MinIO python check, will verify via CLI...")
    print("\n=== Verification Complete ===")

if __name__ == "__main__":
    asyncio.run(main())
