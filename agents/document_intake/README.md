# Document Intake Agent

Handles ingestion of IPO prospectus documents into the platform.

## Purpose
Accepts documents via file upload or URL, validates them, computes integrity hashes, persists to object storage, and emits an intake event.

## Inputs
- `file_path` — local path to the uploaded file (optional)
- `url` — remote URL to download the document from (optional)
- `metadata` — user-supplied metadata dictionary

## Outputs
- `document_id` — unique identifier assigned to the ingested document
- `storage_path` — object storage path where the document is stored
- `page_count` — number of pages detected
- `document_hash` — SHA-256 hash for integrity verification
