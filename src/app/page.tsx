import { CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="flex max-w-md flex-col items-center text-center space-y-4 rounded-xl border bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          EventSync Rodando!
        </h1>
        
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Seu ambiente foi configurado corretamente. A estrutura de pastas está organizada e o Next.js está pronto.
        </p>

        <div className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          src/app/page.tsx
        </div>
      </div>
    </main>
  );
}