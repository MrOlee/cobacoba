export const metadata = {
  title: 'RAYLIZIIEDESU - Anime & Drama',
  description: 'Streaming anime dan drama subtitle Indonesia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
