import { ReactNode } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-muted/30">
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-8">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="-ml-2" />
                        <h1 className="text-xl font-semibold">Dashboard</h1>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/schedule?new=true">
                            <Plus className="size-4" />
                            Nova Aula
                        </Link>
                    </Button>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}