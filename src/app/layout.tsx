import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/shared/header"; // Importando o Header

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
          {/* O Header fica aqui para ser fixo em todas as páginas */}
          <Header />
          
          <main className="min-h-screen">
            {children}
          </main>
          
          <Toaster richColors />
        </ReactQueryProvider>
      </body>
    </html>
  );
}