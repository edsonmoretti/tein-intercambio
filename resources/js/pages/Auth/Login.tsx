import { useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                            Remember me
                        </span>
                    </label>

                    <span className="text-sm text-gray-400 cursor-not-allowed">Forgot password?</span>

                </div>

                <Button className="w-full" disabled={processing}>
                    Log in
                </Button>

                <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        Sign up
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
