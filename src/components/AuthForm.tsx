"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const { signUp, signIn, signInWithProvider, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [name, setName] = useState('');

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (isLogin) {
      const result = await signIn(email, password);
      if (result && result.error) setError(result.error.message);
      else router.push('/');
    } else {
      const result = await signUp(email, password, name);
      if (result && result.error) {
        if (result.error.message.includes('already registered')) {
          setError('Este correo ya está registrado.');
        } else if (result.error.message.includes('Invalid email')) {
          setError('El correo no es válido.');
        } else if (result.error.message.includes('Password should be at least')) {
          setError('La contraseña debe tener al menos 6 caracteres.');
        } else {
          setError(result.error.message);
        }
      }
    }
  };

  if (user) return <div className="text-center text-green-600 font-semibold">Ya has iniciado sesión.</div>;

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center mb-2">{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="input input-bordered w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
          />
        )}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="input input-bordered w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="input input-bordered w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="input input-bordered w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
          />
        )}
        <button type="submit" disabled={loading} className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all">
          {isLogin ? 'Entrar' : 'Registrarse'}
        </button>
      </form>
      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400">o continúa con</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => signInWithProvider('google')}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
        >
          <FcGoogle size={22} /> Continuar con Google
        </button>
        <button
          onClick={() => signInWithProvider('facebook')}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
        >
          <FaFacebook size={22} className="text-blue-600" /> Continuar con Facebook
        </button>
      </div>
      <div className="text-center mt-2">
        {isLogin ? (
          <span className="text-sm text-slate-500">¿No tienes cuenta?{' '}
            <Link href="/register" className="text-indigo-600 hover:underline font-semibold">Regístrate</Link>
          </span>
        ) : (
          <span className="text-sm text-slate-500">¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline font-semibold">Inicia sesión</Link>
          </span>
        )}
      </div>
      {error && <div className="text-red-500 text-center mt-2">{error}</div>}
    </div>
  );
};

export default AuthForm;
