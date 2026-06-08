import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Line Photography',
  description: 'Bekijk en selecteer jouw foto\'s',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
