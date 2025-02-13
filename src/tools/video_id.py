import re

def get_video_id(youtube_video_url):
    """
    Extracts the YouTube video ID from a given URL.
    Returns the video ID if found, else raises a ValueError.
    """
    video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", youtube_video_url)
    
    if not video_id_match:
        raise ValueError("Invalid YouTube URL")
    
    return video_id_match.group(1)
