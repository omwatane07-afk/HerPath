import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HERPATH | Safety-Aware Navigation & Family Companion',
  description:
    'Transparent, context-rich navigation platform designed for women, students, and commuters. Transparent streetlights, facilities, disturbance reports, and family check-ins.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#080c18',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-navy-950 text-slate-100 flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
