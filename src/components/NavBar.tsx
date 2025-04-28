"use client";

import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';

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
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {!loading && !user && (
          <Link href="/login" aria-label="Ir a login">
            <button className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-700/30 hover:scale-110 transition-all">
              <FiUser size={24} />
            </button>
          </Link>
        )}
        {!loading && user && (
          <div className="relative">
            <button
              className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-700/30 hover:scale-110 transition-all"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-label="Menú de usuario"
            >
              <FiUser size={24} />
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
