import tempfile
import os
import PyPDF2

def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Extract text content from PDF file bytes.
    
    Creates a temporary file to process the PDF and extracts text from
    all pages. Cleans up the temporary file after processing.
    
    Args:
        pdf_bytes: PDF file content as bytes
        
    Returns:
        Extracted text from all PDF pages
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        try:
            tmp.write(pdf_bytes)
            tmp_path = tmp.name
        finally:
            tmp.close()

    try:
        reader = PyPDF2.PdfReader(tmp_path)
        full_text = ""

        for page in reader.pages:
            txt = page.extract_text()
            if txt:
                full_text += txt + "\\n"
        return full_text
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
