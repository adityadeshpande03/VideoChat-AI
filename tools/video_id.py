from urllib.parse import urlparse, parse_qs

def get_video_id(url):
    """Extract video ID from different YouTube URL formats."""
    parsed_url = urlparse(url)
    if parsed_url.hostname in ['www.youtube.com', 'youtube.com']:
        if parsed_url.path == '/watch':
            return parse_qs(parsed_url.query)['v'][0]
        elif parsed_url.path.startswith(('/v/', '/embed/')):
            return parsed_url.path.split('/')[2]
    elif parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    raise ValueError("Could not extract video ID from URL")