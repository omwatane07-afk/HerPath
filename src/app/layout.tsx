import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-serif-display',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-ui',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

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
  themeColor: '#FAF6F0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-canvas text-bordeaux flex flex-col font-sans antialiased selection:bg-rose-gold selection:text-white">
        {children}
      </body>
    </html>
  );
}
