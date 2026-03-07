"use client";

import { Home, Users, Calendar, DollarSign, FileText, Settings, LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Alunos", url: "/students", icon: Users },
    { title: "Agenda", url: "/schedule", icon: Calendar },
    { title: "Finanças", url: "/finances", icon: DollarSign },
    { title: "Relatórios", url: "/reports", icon: FileText },
    { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();

    return (
        <Sidebar className="border-r border-border">
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-2">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">SEP</h2>
                </div>
            </SidebarHeader>
            <SidebarContent className="px-3">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            {items.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}
                                        >
                                            <Link href={item.url} className="flex items-center gap-3">
                                                <item.icon className="size-5" />
                                                <span className="font-medium">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="w-full justify-between h-auto p-2">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                                    <User2 className="size-4 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col items-start text-sm">
                                    <span className="font-medium">Prof. Tiago</span>
                                </div>
                            </div>
                            <LogOut className="size-4 text-muted-foreground hover:text-destructive cursor-pointer" onClick={signOut} />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}