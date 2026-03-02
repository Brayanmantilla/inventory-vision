import { useRef, useEffect, useState } from 'react';

export default function ScanView() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const [detections, setDetections] = useState([]);
    const [connected, setConnected] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [saved, setSaved] = useState(false);
    const [lastSaved, setLastSaved] = useState([]);
    const isProcessing = useRef(false);

    const BACKEND_URL = 'https://observant-empathy-production-facf.up.railway.app';
    const PYTHON_URL = 'https://inventory-vision-production.up.railway.app';

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 640, height: 480 } })
            .then(stream => {
                videoRef.current.srcObject = stream;
                setConnected(true);
            });
    }, []);

    const drawBoundingBoxes = (dets, width, height) => {
        const canvas = overlayRef.current;
        if (!canvas) return;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        dets.forEach(det => {
            const [x1, y1, x2, y2] = det.bbox;
            const confidence = (det.confidence * 100).toFixed(0);
            const label = `${det.class_name} ${confidence}%`;

            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            ctx.font = 'bold 14px Arial';
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(x1, y1 - 22, textWidth + 10, 22);
            ctx.fillStyle = '#000';
            ctx.fillText(label, x1 + 5, y1 - 6);

            const cs = 12;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(x1, y1 + cs); ctx.lineTo(x1, y1); ctx.lineTo(x1 + cs, y1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x2 - cs, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y1 + cs); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x1, y2 - cs); ctx.lineTo(x1, y2); ctx.lineTo(x1 + cs, y2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x2 - cs, y2); ctx.lineTo(x2, y2); ctx.lineTo(x2, y2 - cs); ctx.stroke();
        });
    };

    const detectOnly = async () => {
        if (isProcessing.current || !videoRef.current || videoRef.current.videoWidth === 0) return;
        isProcessing.current = true;

        const canvas = canvasRef.current;
        const w = videoRef.current.videoWidth;
        const h = videoRef.current.videoHeight;
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob) { isProcessing.current = false; return; }
            try {
                const formData = new FormData();
                formData.append('file', blob, 'frame.jpg');
                const response = await fetch(`${PYTHON_URL}/detect`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                setDetections(data.detections || []);
                drawBoundingBoxes(data.detections || [], w, h);
            } catch (e) {
                console.log('Error:', e);
            } finally {
                isProcessing.current = false;
            }
        }, 'image/jpeg', 0.6);
    };

    const handleCapture = async () => {
        if (detections.length === 0) return;
        setCapturing(true);
        setSaved(false);

        const canvas = canvasRef.current;
        canvas.toBlob(async (blob) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result.split(',')[1];
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${BACKEND_URL}/api/detect-frame`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ image: base64 })
                    });
                    const data = await response.json();
                    setLastSaved(data.records || []);
                    setSaved(true);
                    setTimeout(() => setSaved(false), 3000);
                } catch (e) {
                    console.log('Error guardando:', e);
                } finally {
                    setCapturing(false);
                }
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.6);
    };

    useEffect(() => {
        const interval = setInterval(detectOnly, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl mb-4 flex items-center justify-between">
                <h1 className="text-white font-bold text-xl">📷 Scanner</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${connected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {connected ? '● Activo' : '○ Conectando'}
                </span>
            </div>

            <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
                <video ref={videoRef} autoPlay playsInline className="w-full block" />
                <canvas ref={overlayRef} className="absolute top-0 left-0 w-full h-full" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-green-400 rounded-tl"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-green-400 rounded-tr"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-green-400 rounded-bl"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-green-400 rounded-br"></div>
            </div>

            <div className="w-full max-w-2xl mt-4 flex gap-2 flex-wrap min-h-8">
                {detections.length === 0 ? (
                    <p className="text-gray-600 text-sm">Apunta la cámara a un objeto...</p>
                ) : (
                    detections.map((d, i) => (
                        <div key={i} className="bg-gray-800 border border-green-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span className="text-white text-sm font-medium">{d.class_name}</span>
                            <span className="text-green-400 text-xs">{(d.confidence * 100).toFixed(0)}%</span>
                        </div>
                    ))
                )}
            </div>

            <div className="w-full max-w-2xl mt-6 flex flex-col items-center gap-3">
                <button
                    onClick={handleCapture}
                    disabled={capturing || detections.length === 0}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${detections.length === 0
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : capturing
                            ? 'bg-blue-600/50 text-white cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-lg shadow-blue-500/25'
                        }`}
                >
                    {capturing ? '⏳ Guardando...' : detections.length === 0 ? 'Sin objetos detectados' : `📸 Capturar ${detections.length} objeto${detections.length > 1 ? 's' : ''}`}
                </button>

                {saved && (
                    <div className="w-full bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 font-semibold text-center mb-2">✅ ¡Guardado en inventario!</p>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {lastSaved.map((r, i) => (
                                <span key={i} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                                    {r.product?.name} × {r.quantity}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}