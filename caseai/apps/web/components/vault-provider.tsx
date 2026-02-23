'use client';

import { initVault, VaultClient } from '@caseai/local-vault';
import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type SessionState = {
  userId: string;
  accessToken: string;
  role: 'USER' | 'ADMIN';
};

type VaultContextValue = {
  session: SessionState | null;
  vault: VaultClient | null;
  login(userId: string, accessToken: string, password: string): Promise<void>;
  logout(): void;
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [vault, setVault] = useState<VaultClient | null>(null);

  const value = useMemo<VaultContextValue>(
    () => ({
      session,
      vault,
      async login(userId: string, accessToken: string, password: string) {
        const nextVault = await initVault({ userId, password });
        const role: 'USER' | 'ADMIN' = userId.includes('admin') ? 'ADMIN' : 'USER';
        setVault(nextVault);
        setSession({ userId, accessToken, role });
      },
      logout() {
        setVault(null);
        setSession(null);
      }
    }),
    [session, vault]
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVaultSession() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('VaultProvider is missing');
  }
  return context;
}
