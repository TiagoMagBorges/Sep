"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Administração SEP</h1>
        </div>
        <Button variant="outline" size="sm" onClick={signOut} className="gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </header>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}