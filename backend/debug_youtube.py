from app.main import extract_youtube_transcript, process_url_content
import time

video_id = "zN7Se8pHokg" # The video user linked

print("--- Starting Debug ---")
start = time.time()

print("1. Testing Transcript Extraction...")
try:
    text = extract_youtube_transcript(video_id)
    print(f"Transcript Length: {len(text)} chars")
    print(f"First 100 chars: {text[:100]}")
except Exception as e:
    print(f"Transcript Error: {e}")

print(f"Time taken: {time.time() - start:.2f}s")
