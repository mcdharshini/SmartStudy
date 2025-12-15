import youtube_transcript_api
from youtube_transcript_api import YouTubeTranscriptApi

print("Trying list_transcripts...")
try:
    video_id = "zN7Se8pHokg"
    # This returns a TranscriptList object
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    
    # Try to find a transcript (english or any)
    # We can iterate or find
    print("Available transcripts:", [t.language_code for t in transcript_list])
    
    # Get the first available one
    for transcript in transcript_list:
        print(f"Fetching {transcript.language_code}...")
        results = transcript.fetch()
        print("Success! First line:", results[0])
        break

except Exception as e:
    print(f"Error: {e}")
