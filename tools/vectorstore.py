from qdrant_client.http.models import SearchRequest

def query_qdrant(query: str, video_id: str, limit: int = 3):
    """Query Qdrant and return top 3 most relevant results with scores."""
    embedded_query = get_embeddings([query])[0]
    
    search_result = client.search(
        collection_name="youtube_segments",
        query_vector=embedded_query,
        query_filter=Filter(
            must=[FieldCondition(key="video_id", match=MatchValue(value=video_id))]
        ),
        limit=limit
    )
    
    results = []
    texts = []
    
    for hit in search_result:
        text = hit.payload.get("text", "")
        timestamp = hit.payload.get("timestamp", 0)
        score = hit.score  # Relevance score
        
        texts.append(text)
        results.append((text, timestamp, score))
    
    return results, texts