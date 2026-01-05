import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 pt-6 sm:justify-center sm:pt-0 dark:bg-slate-900">
            <div>
                <Link href="/">
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">
                            Inter<span className="text-blue-600">Cambio</span>
                        </span>
                    </div>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg dark:bg-slate-800">
                {children}
            </div>
        </div>
    );
}
