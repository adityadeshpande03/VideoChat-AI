from youtube_transcript_api import YouTubeTranscriptApi
from tools.video_id import get_video_id
from dotenv import load_dotenv

load_dotenv()

def extract_transcript(youtube_video_url):
    try:
        video_id = get_video_id(youtube_video_url)
        transcript_text = YouTubeTranscriptApi.get_transcript(video_id)
        
        transcript = []
        for i in transcript_text:
            timestamp = i['start']
            text = i['text']
            transcript.append(f'[{timestamp:.2f}s] {text}')
        return "\n".join(transcript)

    except Exception as e:
        raise e