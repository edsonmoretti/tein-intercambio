import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    birth_date: string;
}

export default function Edit({ status }: { status?: string }) {
    const user = usePage().props.auth.user as User;

    const { data, setData, patch, errors, processing, recentlySuccessful, clearErrors } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        birth_date: user.birth_date || '',
    });

    const { data: passwordData, setData: setPasswordData, put: putPassword, errors: passwordErrors, processing: passwordProcessing, recentlySuccessful: passwordRecentlySuccessful, reset: resetPassword, clearErrors: clearPasswordErrors } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/profile', {
            preserveScroll: true,
            onSuccess: () => clearErrors(),
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        putPassword('/profile/password', {
            preserveScroll: true,
            onSuccess: () => {
                resetPassword();
                clearPasswordErrors();
            },
            onError: () => {
                resetPassword('password', 'password_confirmation');
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Meu Perfil" />

            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Meu Perfil</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Gerencie suas informações de conta e preferências.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Perfil</CardTitle>
                        <CardDescription>
                            Atualize as informações do seu perfil e endereço de e-mail.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone (Opcional)</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birth_date">Data de Nascimento (Opcional)</Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                    className="dark:[color-scheme:dark] date-input"
                                />
                                {errors.birth_date && <p className="text-sm text-red-600">{errors.birth_date}</p>}
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar
                                </Button>

                                {recentlySuccessful && (
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        Salvo com sucesso.
                                    </p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Atualizar Senha</CardTitle>
                        <CardDescription>
                            Garanta que sua conta use uma senha longa e aleatória para se manter segura.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitPassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Senha Atual</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData('current_password', e.target.value)}
                                    required
                                />
                                {passwordErrors.current_password && <p className="text-sm text-red-600">{passwordErrors.current_password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    required
                                />
                                {passwordErrors.password && <p className="text-sm text-red-600">{passwordErrors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirmar Nova Senha</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    required
                                />
                                {passwordErrors.password_confirmation && <p className="text-sm text-red-600">{passwordErrors.password_confirmation}</p>}
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={passwordProcessing}>
                                    {passwordProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar Senha
                                </Button>

                                {passwordRecentlySuccessful && (
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        Senha atualizada.
                                    </p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
