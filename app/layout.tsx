import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RunwayBriefing — Flight Information Display',
  description: 'FIDS — Flight Information Display System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-board-bg text-board-text antialiased">{children}</body>
    </html>
  );
}
