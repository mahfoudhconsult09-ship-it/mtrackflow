import './globals.css';
import type { Metadata, Viewport } from 'next';
import PWARegister from '../components/PWARegister';

export const metadata: Metadata = {
  title: 'TrackFlow — Simple order tracking for small businesses',
  description: 'Create orders, share tracking links and keep customers updated.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png'
  },
  appleWebApp: {
    capable: true,
    title: 'TrackFlow',
    statusBarStyle: 'default'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#2563eb'
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><PWARegister />{children}</body></html>;
}
