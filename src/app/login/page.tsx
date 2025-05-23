"use client";

import React from 'react';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-slate-100 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <AuthForm mode="login" />
    </div>
  );
}
