'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0d0e12]/90 backdrop-blur-md border-b border-gray-800 text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400">
          RAYLIZIIE <span className="text-white text-xs font-normal px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500">ANIME</span>
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-purple-400 transition">Beranda</Link>
          <Link href="/schedule" className="hover:text-purple-400 transition">Jadwal Rilis</Link>
          <Link href="/search" className="hover:text-purple-400 transition">Katalog</Link>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative w-full sm:w-72">
        <input
          type="text"
          placeholder="Cari anime / drama..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-900 text-sm text-gray-200 rounded-full px-4 py-2 pl-10 border border-gray-700 focus:outline-none focus:border-purple-500 transition"
        />
        <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* HURUF 'M' DITAMBAHKAN DI AWAL 'd' DI BAWAH INI */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </form>
    </nav>
  );
}
