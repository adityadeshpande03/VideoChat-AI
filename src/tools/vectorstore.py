from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
from tools.embeddings import model

def initialize_collection():
    client = QdrantClient(url="http://localhost:6333")
    client.delete_collection(collection_name="youtube_transcripts")
    client.create_collection(
        collection_name="youtube_transcripts",
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )
    return client

def store_embeddings(embeddings):
    client = QdrantClient(url="http://localhost:6333")
    points = []
    
    for i, embedding in enumerate(embeddings):
        point = PointStruct(
            id=i,
            vector=embedding['embedding'],
            payload={"text": embedding['text'], "timestamp": embedding['timestamp']}
        )
        points.append(point)

    client.upsert(collection_name="youtube_transcripts", points=points)

def query_qdrant(query, video_id, top_k=3):
    client = QdrantClient(url="http://localhost:6333")
    query_embedding = model.encode(query, convert_to_numpy=True)

    search_results = client.search(
        collection_name='youtube_transcripts',
        query_vector=query_embedding.tolist(),
        limit=top_k,
        with_payload=True
    )

    results = []
    retrieved_texts = []

    for result in search_results:
        text = result.payload['text']
        timestamp = result.payload['timestamp']
        youtube_link = f"https://www.youtube.com/watch?v={video_id}&t={int(timestamp)}s"
        results.append((text, timestamp, result.score))
        retrieved_texts.append(text)

    return results, retrieved_texts