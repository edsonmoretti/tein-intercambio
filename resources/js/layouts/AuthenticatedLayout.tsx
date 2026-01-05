import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Plane,
    FileText,
    CheckSquare,
    ShoppingBag,
    PiggyBank,
    Home,
    Menu,
    X,
    LogOut,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Intercâmbios', href: '/exchanges', icon: Plane },
        { name: 'Documentos', href: '/documents', icon: FileText },
        { name: 'Checklist', href: '/tasks', icon: CheckSquare },
        { name: 'Compras', href: '/purchases', icon: ShoppingBag },
        { name: 'Financeiro', href: '/budgets', icon: PiggyBank },
        { name: 'Moradia', href: '/housings', icon: Home },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Inter<span className="text-blue-600">Cambio</span>
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
                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <User className="size-4" />
                        </div>
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
    );
}
