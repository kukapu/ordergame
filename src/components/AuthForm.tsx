"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthForm = () => {
  const { signUp, signIn, signInWithProvider, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isLogin) {
      const result = await signIn(email, password);
      if (result && result.error) setError(result.error.message);
    } else {
      const result = await signUp(email, password);
      if (result && result.error) setError(result.error.message);
    }
  };

  if (user) return <div>Ya has iniciado sesión.</div>;

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {isLogin ? 'Entrar' : 'Registrarse'}
        </button>
      </form>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        {isLogin ? (
          <>
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              onClick={() => setIsLogin(false)}
            >
              Regístrate
            </button>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              onClick={() => setIsLogin(true)}
            >
              Inicia sesión
            </button>
          </>
        )}
      </div>
      <hr />
      <button onClick={() => signInWithProvider('google')} style={{ width: '100%', marginBottom: 8 }}>
        Continuar con Google
      </button>
      <button onClick={() => signInWithProvider('facebook')} style={{ width: '100%' }}>
        Continuar con Facebook
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default AuthForm;
