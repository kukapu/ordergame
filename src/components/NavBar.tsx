"use client";

import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export const NavBar = () => {
  const { user, signOut, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú si haces click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="fixed top-4 left-0 w-full flex justify-between items-center px-4 z-20">
      <div>
        <Link href="/">
          <span className="font-bold text-xl tracking-tight cursor-pointer">OrderGame</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {/* LOG de estado auth para debug visual */}
        <div style={{ fontSize: 12, color: '#888', background: '#eee', borderRadius: 4, padding: '2px 6px' }}>
          loading: {String(loading)} | user: {user ? 'sí' : 'no'}
        </div>
        <ThemeToggle />
        {!loading && !user && (
          <Link href="/login" aria-label="Ir a login">
            <button className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-700/30 hover:scale-110 transition-all ml-2">
              {/* Icono de usuario/login */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </Link>
        )}
        {!loading && user && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-700/30 hover:scale-110 transition-all"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-label="Menú de usuario"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded shadow-lg py-2 z-30 animate-fadeIn">
                <Link href="/profile">
                  <span className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">Ver perfil</span>
                </Link>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  onClick={async () => { setDropdownOpen(false); await signOut(); }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
