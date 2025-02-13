from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embeddings(chunks):
    embedded_chunks = []
    for chunk in chunks:
        chunk_with_embedding = chunk.copy()
        chunk_with_embedding['embedding'] = model.encode(chunk['text'], convert_to_numpy=True)
        embedded_chunks.append(chunk_with_embedding)
    return embedded_chunks

# Remove global variable
# embeddings = get_embeddings(chunking)

