import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { Toaster } from "@/components/ui/sonner"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventSync",
  description: "Gestão de eventos simplificada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <ReactQueryProvider>
          {children}
          {/* Agora o componente Toaster existe e vai funcionar */}
          <Toaster /> 
        </ReactQueryProvider>
      </body>
    </html>
  );
}