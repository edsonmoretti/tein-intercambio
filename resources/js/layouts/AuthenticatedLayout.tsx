import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import {
    Plane,
    Menu,
    X,
    LogOut,
    User,
    Users,
    ShoppingBasket,
    CheckSquare,
    Heart,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface FlashProps {
    success?: string;
    error?: string;
    message?: string;
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { auth, flash } = usePage().props as any;
    const user = auth.user as User;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const navItems = [
        { name: 'Família', href: '/family', icon: Users },
        { name: 'Compras', href: '/shopping', icon: ShoppingBasket },
        { name: 'Checklist', href: '/checklist', icon: CheckSquare },
        { name: 'Viagens', href: '/trips', icon: Plane },
        { name: 'Saúde', href: '#', icon: Heart }, // Placeholder
        { name: 'Financeiro', href: '#', icon: DollarSign }, // Placeholder
        { name: 'Meu Perfil', href: '/profile', icon: User },
    ];

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Toaster position="top-right" richColors />
                {/* Mobile Sidebar Backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-200 lg:translate-x-0 dark:bg-slate-900",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                        <Link href="/trips" className="flex items-center gap-2">
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Lar<span className="text-blue-600">Digital</span>
                            </span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
                            <X className="size-6" />
                        </button>
                    </div>

                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                                    // Add active state check here based on current URL
                                )}
                            >
                                <item.icon className="size-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 px-3 py-2">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="size-8 rounded-full object-cover" />
                            ) : (
                                <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <User className="size-4" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate dark:text-white">
                                    {user.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="lg:ml-64 flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/80">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md dark:hover:bg-slate-800"
                        >
                            <Menu className="size-6" />
                        </button>

                        <div className="flex-1" /> {/* Spacer */}

                        <div className="flex items-center gap-4">
                            <ModeToggle />

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="size-5" />
                            </Link>
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}
