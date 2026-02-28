from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO('yolov8n.pt')

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    results = model(img, conf=0.5)
    
    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                "class_name": model.names[int(box.cls)],
                "confidence": float(box.conf),
                "bbox": box.xyxy[0].tolist()
            })
    return {"detections": detections}

@app.get("/health")
def health():
    return {"status": "ok"}