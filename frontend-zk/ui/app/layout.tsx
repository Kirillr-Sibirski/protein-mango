import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Web3Provider } from '@/components/providers/WagmiProvider';

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
        <Header />
        <Web3Provider>
          {children}
        </Web3Provider>
        <Footer />
      </body>
    </html>
  );
}
