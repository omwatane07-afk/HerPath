import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HERPATH | Safety-Aware Navigation & Family Companion',
  description:
    'Transparent, context-rich navigation platform designed for women, students, and everyday commuters. Clear infrastructure context, verified facilities, and trusted check-ins.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F7F3EE',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink flex flex-col font-sans antialiased selection:bg-primary-tint selection:text-ink">
        {children}
      </body>
    </html>
  );
}
