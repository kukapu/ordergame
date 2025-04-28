"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);
  const router = useRouter();

  if (loading) return <div className="text-center mt-10">Cargando...</div>;
  if (!user) {
    router.replace('/login');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setChanging(true);
    // Primero, reautenticar al usuario
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email as string,
      password: oldPassword,
    });
    if (signInError) {
      setError('La contraseña actual es incorrecta.');
      setChanging(false);
      return;
    }
    // Ahora, cambiar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError('Error al cambiar la contraseña.');
    } else {
      setSuccess('¡Contraseña cambiada correctamente!');
      setOldPassword('');
      setNewPassword('');
    }
    setChanging(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-slate-100 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center mb-2">Perfil de usuario</h2>
        <div className="text-center text-slate-700 dark:text-slate-200">
          <span className="font-semibold">Correo:</span> {user.email}
        </div>
        <button
          onClick={handleSignOut}
          className="w-full py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-all mb-2"
        >
          Cerrar sesión
        </button>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4 mt-4">
          <h3 className="text-lg font-semibold text-center">Cambiar contraseña</h3>
          <input
            type="password"
            placeholder="Contraseña actual"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
            className="input input-bordered w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            className="input input-bordered w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={changing}
            className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
          >
            {changing ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
          {error && <div className="text-red-500 text-center mt-2">{error}</div>}
          {success && <div className="text-green-600 text-center mt-2">{success}</div>}
        </form>
      </div>
    </div>
  );
} 