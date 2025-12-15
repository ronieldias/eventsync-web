// src/providers/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  signIn: (user: User, token: string) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Ao carregar a página, verifica se já existe usuário salvo
  useEffect(() => {
    const storedUser = localStorage.getItem('xe_user');
    const token = localStorage.getItem('xe_auth_token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao recuperar sessão:', error);
        signOut(); // Limpa dados corrompidos
      }
    }
  }, []);

  const signIn = (userData: User, token: string) => {
    localStorage.setItem('xe_user', JSON.stringify(userData));
    localStorage.setItem('xe_auth_token', token);
    setUser(userData); // Isso atualiza o estado global e re-renderiza o Header!
  };

  const signOut = () => {
    localStorage.removeItem('xe_user');
    localStorage.removeItem('xe_auth_token');
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);