"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/features/NotificationBell";

export function Header() {
  const { user, isAuthenticated, isOrganizer, logout } = useAuth();

  return (
    <header className="bg-slate-700 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white">
          EventSync
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/my-subscriptions">
                <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-slate-600">
                  Minhas Inscrições
                </Button>
              </Link>
              {isOrganizer && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-slate-600 border border-slate-500">
                    Dashboard
                  </Button>
                </Link>
              )}
              <NotificationBell />
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-200 text-sm hidden sm:inline">
                  {user?.name?.split(" ")[0]}
                </span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="text-slate-200 hover:text-white hover:bg-slate-600">
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-slate-600">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-primary-500 hover:bg-primary-600">Cadastrar</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
