from configure.config import get_gemini_response
from tools.transcription import extract_transcript, transcripts
from tools.chunks import preprocess_chunks, chunking
from tools.embeddings import embeddings
from tools.vectorstore import store_embeddings, query_qdrant
from tools.video_id import get_video_id, youtube_video_url

#storing the vectors in Qdrant vector store
store_embeddings(embeddings)

#querying the Qdrant vector store
while True:
    query = input("Enter your search query (or type 'exit' to quit)")
    if query.lower() == 'exit':
        break
    
    video_id=get_video_id(youtube_video_url)
    query_results, retrieved_texts = query_qdrant(query,video_id)
    summary = get_gemini_response("\n".join(retrieved_texts))
    
    print("\n🔍 **Top Matching Transcript Segments:**")
    for text, link in query_results:
        print(f"🔹 {text}")
        print(f"📌 Watch here: {link}\n")
        
    print("\n📄 **Summary of Retrieved Results:**")
    print(summary)