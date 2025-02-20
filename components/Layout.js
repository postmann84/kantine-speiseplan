import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Betriebskantine</h1>
        </header>
        <main>{children}</main>
        <footer className="mt-8 py-4 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Betriebskantine
          </p>
        </footer>
      </div>
    </div>
  );
} 