from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from configure.config import get_gemini_response
from tools.transcription import extract_transcript
from tools.chunks import preprocess_chunks
from tools.embeddings import get_embeddings
from tools.vectorstore import initialize_collection, store_embeddings, query_qdrant
from tools.video_id import get_video_id
from fastapi.responses import JSONResponse
from datetime import datetime

app = FastAPI(
    title="YouTube Transcript Search API",
    description="API for searching and summarizing YouTube video transcripts"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity, adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handling middleware
@app.middleware("http")
async def add_error_handling(request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

class VideoSearchRequest(BaseModel):
    youtube_url: str
    query: str

class VideoSearchResponse(BaseModel):
    status: str
    matching_segments: List[dict]
    summary: str

def format_timestamp(seconds):
    """Convert seconds to HH:MM:SS format."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

@app.get("/health")
async def health_check():
    """Health check endpoint to verify server status."""
    try:
        # Test database connection here if needed
        return {
            "status": "ok",
            "message": "Server is running",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.post("/process-and-search", response_model=VideoSearchResponse)
async def process_and_search(request: VideoSearchRequest):
    try:
        # Initialize collection at the start
        initialize_collection()
        
        # Extract video transcripts
        transcripts = extract_transcript(request.youtube_url)
        
        # Process chunks
        chunks = preprocess_chunks(transcripts)
        
        # Generate embeddings
        embedded_chunks = get_embeddings(chunks)
        
        # Store embeddings
        store_embeddings(embedded_chunks)
        
        # Get video ID and perform search
        video_id = get_video_id(request.youtube_url)
        query_results, retrieved_texts = query_qdrant(request.query, video_id)
        
        # Generate contextual summary using Gemini
        summary = get_gemini_response(
            query=request.query,
            text="\n".join(retrieved_texts)
        )
        
        # Format the top 3 results with timestamps and scores
        matching_segments = []
        for text, timestamp, score in query_results:
            try:
                # Convert timestamp to seconds
                if isinstance(timestamp, str):
                    if ':' in timestamp:
                        parts = timestamp.split(':')
                        seconds = sum(int(x) * 60**i for i, x in enumerate(reversed(parts)))
                    else:
                        seconds = int(timestamp)
                else:
                    seconds = int(timestamp)
                
                formatted_time = format_timestamp(seconds)
                timestamp_link = f"https://youtube.com/watch?v={video_id}&t={seconds}"
                
                matching_segments.append({
                    "text": text,
                    "timestamp": formatted_time,
                    "timestamp_link": timestamp_link,
                    "relevance_score": round(score * 100, 2)  # Convert score to percentage
                })
            except (ValueError, TypeError) as e:
                continue
        
        return {
            "status": "success",
            "matching_segments": matching_segments,
            "summary": summary,
            "query": request.query  # Add the query to the response
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")