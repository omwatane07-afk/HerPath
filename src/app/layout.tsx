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
  themeColor: '#F6F8FC',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-brand-bg text-brand-text flex flex-col antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
