import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/api/auth/login', form);
            localStorage.setItem('token', data.token);
            navigate('/dashboard');
        } catch {
            setError('Usuario o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            {/* Fondo con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-gray-950 to-purple-950/30"></div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
                        <span className="text-3xl">📦</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Inventory Vision</h1>
                    <p className="text-gray-400 mt-2 text-sm">Sistema de gestión con visión por computadora</p>
                </div>

                {/* Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Iniciar sesión</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-5 flex items-center gap-2">
                            <span className="text-red-400 text-sm">⚠️ {error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-sm mb-1.5 block">Usuario</label>
                            <input
                                className="w-full p-3.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="admin"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm mb-1.5 block">Contraseña</label>
                            <input
                                type="password"
                                className="w-full p-3.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white p-3.5 rounded-xl font-semibold transition-all duration-200 active:scale-95 mt-2 shadow-lg shadow-blue-500/25"
                        >
                            {loading ? '⏳ Ingresando...' : 'Ingresar →'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-gray-600 text-xs text-center">
                            Demo: admin / admin123
                        </p>
                    </div>
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    Powered by YOLOv8 + Spring Boot + React
                </p>
            </div>
        </div>
    );
}