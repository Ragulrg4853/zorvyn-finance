import { Inter, Syne } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const syne  = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400','600','700'] });

export const metadata = {
  title: 'Zorvyn Finance — Secure Financial Systems',
  description: 'Enterprise-grade finance data processing and access control platform',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0f1e" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased bg-[#0a0f1e] text-gray-200 selection:bg-primary/30 min-h-screen relative overflow-x-hidden">
        {/* Ambient Neon Blobs */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none -z-10 mix-blend-screen" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none -z-10 mix-blend-screen" />
        
        {children}
      </body>
    </html>
  );
}
