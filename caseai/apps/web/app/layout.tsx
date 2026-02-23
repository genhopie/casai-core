import type { Metadata } from 'next';
import './globals.css';
import { VaultProvider } from '../components/vault-provider';

export const metadata: Metadata = {
  title: 'caseai',
  description: 'Local-first legal workspace'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <VaultProvider>
          <main className="mx-auto min-h-screen max-w-6xl p-6">{children}</main>
        </VaultProvider>
      </body>
    </html>
  );
}
