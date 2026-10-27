import type { Metadata, Viewport } from 'next';
import { Source_Serif_4, Inter } from 'next/font/google';
import './globals.css';

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-source-serif',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
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
  themeColor: '#F8F4EC',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-paper text-ink flex flex-col font-sans antialiased selection:bg-peacock selection:text-white">
        {children}
      </body>
    </html>
  );
}
