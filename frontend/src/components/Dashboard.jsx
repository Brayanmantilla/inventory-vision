import { useState, useEffect } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const BACKEND_URL = 'https://observant-empathy-production-facf.up.railway.app';

export default function Dashboard() {
    const [inventory, setInventory] = useState([]);
    const [sessionUrl, setSessionUrl] = useState('');
    const [connected, setConnected] = useState(false);
    const [stats, setStats] = useState({});

    const fetchInventory = async () => {
        try {
            const authToken = localStorage.getItem('token');
            const response = await fetch(`${BACKEND_URL}/api/inventory`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                const counts = {};
                data.forEach(r => {
                    const name = r.product?.name || 'unknown';
                    counts[name] = (counts[name] || 0) + 1;
                });
                setStats(counts);
                setInventory(data);
                setConnected(true);
            }
        } catch (e) {
            setConnected(false);
        }
    };

    useEffect(() => {
        const token = crypto.randomUUID();
        setSessionUrl(`${window.location.origin}/scan/${token}`);
        fetchInventory();
        const interval = setInterval(fetchInventory, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleReset = async () => {
        try {
            const authToken = localStorage.getItem('token');
            await fetch(`${BACKEND_URL}/api/inventory`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setInventory([]);
            setStats({});
        } catch (e) {
            console.log('Error limpiando:', e);
        }
    };

    const handleExport = () => {
        if (inventory.length === 0) return;
        const data = inventory.map((item, i) => ({
            '#': i + 1,
            'Producto': item.product?.name || '-',
            'SKU': item.product?.sku || '-',
            'Cantidad': item.quantity,
            'Fecha': new Date(item.detectedAt).toLocaleString(),
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        ws['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 25 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const topProduct = Object.entries(stats).sort((a, b) => b[1] - a[1])[0];
    const maxCount = Math.max(...Object.values(stats), 1);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    <h1 className="text-xl font-bold">Inventory Vision</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full border ${connected ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {connected ? 'Conectado' : 'Desconectado'}
                    </span>
                    <button
                        onClick={handleReset}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-1.5 rounded-lg text-sm transition-colors"
                    >
                        🗑 Limpiar
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={inventory.length === 0}
                        className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 disabled:opacity-40 px-4 py-1.5 rounded-lg text-sm transition-colors"
                    >
                        📊 Exportar Excel
                    </button>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total detecciones</p>
                        <p className="text-3xl font-bold text-blue-400">{inventory.length}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Productos únicos</p>
                        <p className="text-3xl font-bold text-purple-400">{Object.keys(stats).length}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Más detectado</p>
                        <p className="text-xl font-bold text-green-400 truncate">{topProduct ? topProduct[0] : '-'}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Estado</p>
                        <p className="text-xl font-bold text-yellow-400">{connected ? '🟢 Live' : '🔴 Off'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <h2 className="font-semibold text-gray-300 mb-4 text-sm uppercase tracking-wider">📱 Escanear con móvil</h2>
                        {sessionUrl && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="bg-white p-3 rounded-xl">
                                    <QRCode value={sessionUrl} size={150} />
                                </div>
                                <p className="text-xs text-gray-500 text-center break-all">{sessionUrl}</p>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <h2 className="font-semibold text-gray-300 mb-4 text-sm uppercase tracking-wider">📊 Distribución por producto</h2>
                        {Object.keys(stats).length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-gray-600">
                                Sin datos aún...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                                    <div key={name} className="flex items-center gap-3">
                                        <span className="text-gray-300 text-sm w-24 truncate">{name}</span>
                                        <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center px-2 transition-all duration-500"
                                                style={{ width: `${(count / maxCount) * 100}%` }}
                                            >
                                                <span className="text-white text-xs font-bold">{count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-300 text-sm uppercase tracking-wider">📋 Registro en tiempo real</h2>
                        <span className="text-xs text-gray-500">{inventory.length} registros</span>
                    </div>
                    <div className="overflow-auto max-h-80">
                        <table className="w-full">
                            <thead className="bg-gray-800/50 sticky top-0">
                                <tr>
                                    <th className="p-4 text-left text-xs text-gray-400 uppercase tracking-wider">Producto</th>
                                    <th className="p-4 text-left text-xs text-gray-400 uppercase tracking-wider">Cantidad</th>
                                    <th className="p-4 text-left text-xs text-gray-400 uppercase tracking-wider">Detectado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item, i) => (
                                    <tr key={i} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                <span className="text-white font-medium">{item.product?.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {new Date(item.detectedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {inventory.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-12 text-center text-gray-600">
                                            Esperando detecciones...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}