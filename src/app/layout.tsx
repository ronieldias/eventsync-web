// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { AuthProvider } from "@/providers/auth-provider"; // <--- Importe aqui
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/shared/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventSync",
  description: "Gerenciamento de eventos simplificado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AuthProvider> {/* <--- Adicione o AuthProvider AQUI, envolvendo tudo */}
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster richColors />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}