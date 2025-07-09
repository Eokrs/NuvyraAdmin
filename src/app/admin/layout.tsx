
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from '@/components/theme-toggle';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const navItems = [
    { href: '/admin/products', label: 'Produtos', icon: Package },
    { href: '/admin/settings', label: 'Configurações', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Package className="h-16 w-16 animate-pulse text-primary" /></div>;
  }
  
  if (!user) {
     return null; 
  }

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'AD';

  return (
    <SidebarProvider defaultOpen={true} collapsible="icon">
      <Sidebar variant="sidebar" side="left" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 flex flex-col items-center">
           <Link href="/admin/products" className="flex items-center gap-2 mb-4 group-data-[collapsible=icon]:hidden">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
              <path d="M12.378 1.602a.75.75 0 00-.756 0L3.366 6.077a.75.75 0 00-.498.813l1.936 11.388a.75.75 0 00.582.613l5.529 1.908a.75.75 0 00.196.021h.012a.75.75 0 00.196-.021l5.529-1.908a.75.75 0 00.582-.613l1.936-11.388a.75.75 0 00-.498-.813L12.378 1.602zM12 7.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0V8.25A.75.75 0 0112 7.5zM11.25 15a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" />
            </svg>
            <span className="font-headline text-xl font-semibold text-primary-foreground">Nuvyra Admin</span>
          </Link>
           <Link href="/admin/products" className="items-center gap-2 mb-4 group-data-[collapsible=icon]:flex hidden">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
              <path d="M12.378 1.602a.75.75 0 00-.756 0L3.366 6.077a.75.75 0 00-.498.813l1.936 11.388a.75.75 0 00.582.613l5.529 1.908a.75.75 0 00.196.021h.012a.75.75 0 00.196-.021l5.529-1.908a.75.75 0 00.582-.613l1.936-11.388a.75.75 0 00-.498-.813L12.378 1.602zM12 7.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0V8.25A.75.75 0 0112 7.5zM11.25 15a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" />
            </svg>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label, side: 'right' }}
                    className="justify-start"
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:aspect-square">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || user?.email || 'Admin'} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-medium text-sidebar-foreground">{user?.displayName || user?.email}</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 shadow-sm backdrop-blur-md md:justify-end">
            <SidebarTrigger className="md:hidden" /> 
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-background">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
