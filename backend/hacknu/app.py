import httpx
from fastapi import FastAPI, File, UploadFile, BackgroundTasks, HTTPException
from models import UserMessage, Response
from lightrag_client import query_lightrag
from query_builder import QueryBuilder
from whisper import transcribe_audio
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Audio and Text Processing")

@app.post("/process_message", response_model=Response)
async def process_message(req: UserMessage, background_tasks: BackgroundTasks):
    try:
        if req.message_type == "audio":
            transcription = await transcribe_audio(req.message)
            query_builder = QueryBuilder(transcription)
        elif req.message_type == "text":
            query_builder = QueryBuilder(req.message)
        else:
            raise HTTPException(status_code=400, detail="Invalid message type")

        query_text = query_builder.build_query()
        lightrag_response = await query_lightrag(query_text)

        response_payload = {
            "status": "success",
            "result": lightrag_response
        }

        if req.callback_url:
            background_tasks.add_task(post_callback, req.callback_url, response_payload)

        return response_payload

    except HTTPException as e:
        raise HTTPException(status_code=500, detail=str(e))


async def post_callback(url: str, payload: dict):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(url, json=payload)
    except Exception as e:
        print(f"Error posting callback: {e}")

@app.get("/health")
async def health():
    return {"status": "ok"}
