FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgomp1 \
    libxcb1 \
    libx11-6 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir \
    numpy==1.26.4 \
    fastapi==0.115.0 \
    uvicorn==0.30.0 \
    python-multipart==0.0.12 \
    pillow==10.4.0 \
    opencv-python-headless==4.10.0.84 \
    && pip install --no-cache-dir \
    torch==2.3.0+cpu torchvision==0.18.0+cpu \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir ultralytics==8.2.0

COPY . .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]