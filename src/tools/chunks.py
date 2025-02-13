import re

def preprocess_chunks(transcripts,chunk_size=50,chunk_overlap=10):

    '''
    Converts raw transcript into structured chunks with timestamps.
    
    Args:
        raw_transcript (str): Raw transcript text.
        chunk_size (int): Number of words per chunk.
        overlap (int): Overlapping words between chunks.

    Returns:
        List of dictionaries containing "timestamp" and "text".
    '''

    chunks=[]
    current_chunk=[]
    current_timestamp=None
    word_count=0

    lines = transcripts.split("\n")

    for line in lines:
        match=re.match(r"\[(\d+\.\d+)s\] (.+)",line)
        if match:
            timestamp=float(match.group(1))
            text=match.group(2)
            words=text.split()

            if not current_timestamp:
                current_timestamp=timestamp
            
            current_chunk.extend(words)
            word_count+=len(words)

            if word_count>=chunk_size:
                chunks.append({
                    "timestamp":current_timestamp,
                    "text":" ".join(current_chunk)
                })

                current_chunk = current_chunk[-chunk_overlap:]
                word_count = len(current_chunk)
                current_timestamp = timestamp

    if current_chunk:
        chunks.append({
            "timestamp":current_timestamp,
            "text":" ".join(current_chunk)
        })

    return chunks

