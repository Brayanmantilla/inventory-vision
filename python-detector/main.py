from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO('yolov8n.pt')

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    print(f"Frame recibido: {file.filename}, tamaño: {file.size}")
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        print("Error: imagen no decodificada")
        return {"detections": []}
    results = model(img, conf=0.4)
    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                "class_name": model.names[int(box.cls)],
                "confidence": float(box.conf),
                "bbox": box.xyxy[0].tolist()
            })
    print(f"Detecciones: {len(detections)}")
    return {"detections": detections}

@app.get("/health")
def health():
    return {"status": "ok"}