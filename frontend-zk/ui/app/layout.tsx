// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Web3Provider } from '@/components/providers/WagmiProvider';
import dynamic from 'next/dynamic';

// Dynamically import the ThreeScene component with SSR disabled
const ThreeScene = dynamic(() => import('@/components/three-scene'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Protein Mango - Insurance Protocol',
  description: "Insurance protocol powered by Flare's web2 data sources & Mina's zk-proofs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThreeScene />
        <Web3Provider>
          <ClientLayout>
            {/* Your main content sits on top */}
            <div className="relative z-0">
              {children}
            </div></ClientLayout>
        </Web3Provider>
      </body>
    </html>
  );
}

// Client-side layout component
function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}