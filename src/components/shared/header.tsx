'use client';

import Link from 'next/link';
import { LogOut, User as UserIcon, Home, Calendar, LayoutDashboard } from 'lucide-react';

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
import { useAuthContext } from '@/providers/auth-provider';

export function Header() {
  const { user, signOut } = useAuthContext();

  // Pega as iniciais do nome para o Avatar
  const initials = user?.nome
    ? user.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LADO ESQUERDO: Botão Home / Logo e Navegação Principal */}
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

          {/* ADICIONADO: Navegação para Dashboard (Apenas Organizadores) */}
          {user?.role === 'organizer' && (
            <nav className="hidden md:flex items-center gap-4">
               <Link 
                href="/dashboard" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </nav>
          )}
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
                  
                  {/* Link redundante no menu (opcional, mas bom para mobile) */}
                  {user.role === 'organizer' && (
                     <DropdownMenuItem asChild className="cursor-pointer">
                       <Link href="/dashboard">
                         <Calendar className="mr-2 h-4 w-4" />
                         <span>Meus Eventos</span>
                       </Link>
                     </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer focus:text-red-600">
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