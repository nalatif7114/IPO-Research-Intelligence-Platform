import requests
import time
import json
import os

BASE_URL = "http://localhost:8000/api/v1"

print("Uploading test prospectus...")
# Check if GoTo_IPO_Prospectus.pdf exists
pdf_path = "f_prdl-prospektus-final.pdf"
if not os.path.exists(pdf_path):
    print("PDF not found, writing a dummy PDF...")
    with open(pdf_path, "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Title (GoTo_IPO_Prospectus)\n>>\nendobj\n%%EOF")

with open(pdf_path, "rb") as f:
    files = {"file": (pdf_path, f, "application/pdf")}
    res = requests.post(f"{BASE_URL}/upload", files=files)

print("Upload response:", res.status_code, res.text)
if not res.ok:
    exit(1)

data = res.json()
job_id = data.get("job_id")
document_id = data.get("document_id")

print(f"Triggered Job ID: {job_id}")
print("Polling job status...")

while True:
    time.sleep(3)
    res = requests.get(f"{BASE_URL}/jobs/{job_id}")
    if not res.ok:
        print("Error fetching job:", res.status_code)
        continue
        
    job = res.json()
    print(f"Status: {job['status']}, Progress: {job['progress']}%")
    
    # get steps
    steps_res = requests.get(f"{BASE_URL}/jobs/{job_id}/steps")
    if steps_res.ok:
        steps = steps_res.json()
        print(f"Completed steps: {len([s for s in steps if s['status'] == 'completed'])} / {len(steps)}")
        
    if job["status"] in ["completed", "failed", "cancelled"]:
        break

if job["status"] == "completed":
    print("\nFetching Job Result cache...")
    res = requests.get(f"{BASE_URL}/jobs/{job_id}/result")
    result = res.json()
    print("Keys in result:", result.keys())
    
    print("\nTesting Chat API...")
    chat_payload = {
        "document_id": document_id,
        "query": "What are the key investment risks?"
    }
    chat_res = requests.post(f"{BASE_URL}/chat/message", json=chat_payload)
    print("Chat response:", chat_res.status_code)
    if chat_res.ok:
        print(json.dumps(chat_res.json(), indent=2))
    else:
        print(chat_res.text)
