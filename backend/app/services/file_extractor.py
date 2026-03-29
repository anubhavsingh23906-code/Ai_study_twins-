from pathlib import Path

from fastapi import HTTPException, UploadFile, status

ALLOWED_EXTENSIONS = {".txt", ".md", ".csv", ".json", ".pdf"}
MAX_FILE_BYTES = 3 * 1024 * 1024
MAX_EXTRACTED_CHARS = 12000


async def extract_text_from_upload(file: UploadFile) -> str:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Upload txt, md, csv, json, or pdf.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is too large. Keep it under 3 MB.")

    if extension == ".pdf":
        try:
            from io import BytesIO

            from pypdf import PdfReader

            reader = PdfReader(BytesIO(content))
            extracted = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not read the PDF. Try a text-based PDF or convert it to txt.",
            ) from exc
    else:
        try:
            extracted = content.decode("utf-8")
        except UnicodeDecodeError:
            extracted = content.decode("latin-1", errors="ignore")

    cleaned = extracted.strip()
    if not cleaned:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No readable text was found in the file.")

    return cleaned[:MAX_EXTRACTED_CHARS]
