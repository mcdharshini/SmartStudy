import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
import wikipedia
from typing import Optional

def get_youtube_video_id(url: str) -> Optional[str]:
    """Extract video ID from various YouTube URL formats.
    
    Supports multiple URL patterns including youtu.be, youtube.com/watch,
    youtube.com/embed, and youtube.com/v/ formats.
    
    Args:
        url: YouTube URL in any supported format
        
    Returns:
        Video ID string if found, None otherwise
    """
    query = urlparse(url)
    if query.hostname == 'youtu.be':
        return query.path[1:]
    if query.hostname in ('www.youtube.com', 'youtube.com'):
        if query.path == '/watch':
            p = parse_qs(query.query)
            return p['v'][0]
        if query.path[:7] == '/embed/':
            return query.path.split('/')[2]
        if query.path[:3] == '/v/':
            return query.path.split('/')[2]
    return None


def extract_youtube_transcript(video_id: str) -> str:
    """Fetch and translate YouTube video transcript to English.
    
    Attempts to retrieve transcript with the following priority:
    1. Manual English transcript
    2. Auto-generated English transcript
    3. Any available language, translated to English
    
    Args:
        video_id: YouTube video identifier
        
    Returns:
        Formatted transcript text with language code, or error message
    """
    try:
        print(f"Fetching transcript list for YouTube Video: {video_id}")
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        transcript = None
        
        try:
           transcript = transcript_list.find_transcript(['en'])
        except:
            for t in transcript_list:
                transcript = t
                break
        
        if transcript:
            if not transcript.is_translatable and transcript.language_code != 'en':
                pass
            elif transcript.language_code != 'en':
                try:
                    transcript = transcript.translate('en')
                except Exception as e:
                    print(f"Translation failed: {e}")

            full_data = transcript.fetch()
            full_transcript = " ".join([t['text'] for t in full_data])
            return f"YouTube Video Transcript ({transcript.language_code}):\\n\\n{full_transcript}"
            
        return "Error: No transcript found for this video."

    except Exception as e:
        print(f"Error fetching YouTube transcript: {e}")
        return f"Error: Could not retrieve YouTube transcript. The video might not have captions enabled. ({str(e)})"


def crawl_website_content(url: str) -> str:
    """Scrape and extract clean text content from a website.
    
    Removes scripts, styles, navigation, headers, footers, and cleans
    whitespace to extract the main textual content.
    
    Args:
        url: Website URL to scrape
        
    Returns:
        Cleaned text content from the website, or empty string on error
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()
            
        text = soup.get_text()
        
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\\n'.join(chunk for chunk in chunks if chunk)
        
        return f"Website Content ({url}):\\n\\n{text}"
    except Exception as e:
        print(f"Error scraping URL: {e}")
        return ""


def fetch_wikipedia_content(query: str) -> str:
    """Retrieve content from a Wikipedia article.
    
    Handles disambiguation errors and page not found errors gracefully.
    
    Args:
        query: Wikipedia topic or article name (can include 'wikipedia:' prefix)
        
    Returns:
        Wikipedia article content with title, or error message
    """
    try:
        topic = query.replace("wikipedia:", "").strip()
        print(f"Searching Wikipedia for: {topic}")
        
        page = wikipedia.page(topic, auto_suggest=True)
        return f"Wikipedia Article ({page.title}):\\n\\n{page.content}"
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Error: Wikipedia query is ambiguous. Possible options: {', '.join(e.options[:5])}"
    except wikipedia.exceptions.PageError:
        return f"Error: Wikipedia page '{topic}' not found."
    except Exception as e:
        return f"Error fetching Wikipedia: {e}"


def process_url_content(url_or_query: str) -> str:
    """Route URL or query to the appropriate content extraction function.
    
    Determines the type of content (Wikipedia, YouTube, or general website)
    and delegates to the appropriate handler.
    
    Args:
        url_or_query: URL or query string (supports 'wikipedia:' prefix)
        
    Returns:
        Extracted content from the appropriate source
    """
    if url_or_query.lower().startswith("wikipedia:"):
        return fetch_wikipedia_content(url_or_query)

    video_id = get_youtube_video_id(url_or_query)
    if video_id:
        return extract_youtube_transcript(video_id)
    
    return crawl_website_content(url_or_query)
