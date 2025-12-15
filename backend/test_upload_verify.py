import requests
import os

# Create a dummy PDF
with open("test.pdf", "wb") as f:
    f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\n0000000273 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n368\n%%EOF")

try:
    url = "http://127.0.0.1:8000/upload_pdf"
    files = {"pdf": ("test.pdf", open("test.pdf", "rb"), "application/pdf")}
    data = {"notebook_id": "nb-test"}
    
    print("Uploading PDF...")
    with open("test.pdf", "rb") as pdf_file:
        files = {"pdf": ("test.pdf", pdf_file, "application/pdf")}
        response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        json_resp = response.json()
        print("Upload Success:", json_resp)
        file_url = json_resp.get("url")
        if file_url:
            print(f"Testing URL accessibility: {file_url}")
            file_resp = requests.get(file_url)
            if file_resp.status_code == 200:
                print("File is accessible via URL!")
                print("Status: SUCCESS")
            else:
                print(f"File URL returned status: {file_resp.status_code}")
                print("Status: FAILED_ACCESS")
        else:
            print("No URL returned in response.")
            print("Status: FAILED_URL")
    else:
        print(f"Upload failed with status: {response.status_code}")
        print(response.text)
        print("Status: FAILED_UPLOAD")

except Exception as e:
    print(f"Exception: {e}")
    print("Status: ERROR")

finally:
    if os.path.exists("test.pdf"):
        os.remove("test.pdf")
