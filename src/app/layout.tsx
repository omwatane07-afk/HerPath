import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/pwa/PwaRegister';

export const metadata: Metadata = {
  title: 'HERPATH | Safety-Aware Navigation & Civic Transparency',
  description:
    'Transparent, context-rich navigation platform designed for women, students, and everyday commuters. Clear infrastructure context, verified facilities, and trusted check-ins.',
  applicationName: 'HERPATH',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HERPATH',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#4F46E5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HERPATH" />
        <meta name="theme-color" content="#4F46E5" />
      </head>
      <body className="min-h-[100dvh] bg-canvas text-ink flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
