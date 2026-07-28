import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Rayliziie Anime - Platform Streaming Anime & Asian Content',
  description: 'Nonton streaming anime dan drama subtitle Indonesia terlengkap dan gratis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#0b0c10] text-gray-100 min-h-screen antialiased flex flex-col justify-between">
        <div>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
        </div>
        <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Rayliziie Anime. Dynamic proxy stream system integrated.
        </footer>
      </body>
    </html>
  );
}
