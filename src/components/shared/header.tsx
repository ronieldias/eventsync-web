'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, User as UserIcon, Home, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  // Recupera o usuário do localStorage ao carregar a página
  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('xe_user');
    const token = localStorage.getItem('xe_auth_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erro ao processar dados do usuário", e);
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('xe_auth_token');
    localStorage.removeItem('xe_user');
    setUser(null);
    router.push('/login');
    router.refresh();
  }

  // Evita renderização incorreta no servidor (Hydration Mismatch)
  if (!mounted) return <header className="h-16 border-b bg-background" />;

  // Pega as iniciais do nome para o Avatar (ex: Roniel Dias -> RD)
  const initials = user?.nome
    ? user.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LADO ESQUERDO: Botão Home / Logo */}
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
            title="Voltar para Home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline-block">EventSync</span>
          </Link>
        </div>

        {/* LADO DIREITO: Menu do Usuário ou Login */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{user.nome}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800">
                      {/* Se o backend mandar foto, coloque aqui: user.foto_url */}
                      <AvatarImage src="" alt={user.nome} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal md:hidden">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.nome}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="md:hidden" />
                  
                  <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  
                  {/* Se for organizador, mostra link para Dashboard */}
                  {user.role === 'organizer' && (
                     <DropdownMenuItem asChild className="cursor-pointer">
                       <Link href="/dashboard">
                         <Calendar className="mr-2 h-4 w-4" />
                         <span>Meus Eventos</span>
                       </Link>
                     </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Cadastre-se</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}