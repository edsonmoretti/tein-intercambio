import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, User, Star, Pencil, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ROLES = [
    'Marido/Pai', 'Esposa/Mãe', 'Filho(a)', 'Avô(ó)', 'Tio(a)', 'Primo(a)', 'Amigo(a)', 'Outro(a)'
];

export default function Index({ members }: { members: any[] }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        role: '',
        is_primary: false,
    });

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editRole, setEditRole] = useState('');
    const [editIsPrimary, setEditIsPrimary] = useState(false);

    const deleteMember = (id: number) => {
        if (confirm('Remover este membro da família? Se ele tiver conta, perderá o acesso a esta família.')) {
            router.delete(`/family/${id}`);
        }
    };

    const startEdit = (member: any) => {
        setEditingId(member.id);
        setEditRole(member.role);
        setEditIsPrimary(member.is_primary);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditRole('');
        setEditIsPrimary(false);
    };

    const saveEdit = (id: number) => {
        router.put(`/family/${id}`, {
            role: editRole,
            is_primary: editIsPrimary,
        }, {
            onSuccess: () => cancelEdit()
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/family', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Membros da Família" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Membros da Família</h1>
                <p className="text-muted-foreground">Gerencie quem faz parte do seu lar digital.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Form Section */}
                <div className="md:col-span-4 lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Membro</CardTitle>
                            <CardDescription>Cadastre um novo integrante.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ex: João Silva"
                                        required
                                    />
                                    {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="joao@exemplo.com"
                                        required
                                    />
                                    {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Parentesco / Função</Label>
                                    <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map((role) => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <span className="text-xs text-red-500">{errors.role}</span>}
                                </div>

                                {/*<div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="is_primary"
                                        checked={data.is_primary}
                                        onCheckedChange={(checked) => setData('is_primary', checked as boolean)}
                                    />
                                    <Label htmlFor="is_primary" className="cursor-pointer">Membro Principal?</Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Arquivos anexados por qualquer membro irão para o Google Drive deste usuário (Membro Principal).
                                </p>
*/}
                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Plus className="mr-2 h-4 w-4" /> Cadastrar
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* List Section */}
                <div className="md:col-span-8 lg:col-span-9">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {members.length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-500">
                                Nenhum membro cadastrado ainda.
                            </div>
                        )}

                        {members.map((member) => (
                            <Card key={member.id} className="relative overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                                                    {member.is_primary ? (
                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    ) : null}
                                                </div>
                                                <p className="text-sm text-slate-500">{member.email}</p>

                                                {editingId === member.id ? (
                                                    <div className="mt-2 flex flex-col gap-3">
                                                        <div className="flex gap-2">
                                                            <Select value={editRole} onValueChange={setEditRole}>
                                                                <SelectTrigger className="h-8 w-[140px]">
                                                                    <SelectValue placeholder="Função" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {ROLES.map((role, index) => (
                                                                        <SelectItem key={`edit-${index}-${role}`} value={role}>{role}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" onClick={() => saveEdit(member.id)}>
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        {/*      <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`edit-primary-${member.id}`}
                                                                checked={editIsPrimary}
                                                                onCheckedChange={(checked) => setEditIsPrimary(checked as boolean)}
                                                            />
                                                            <Label htmlFor={`edit-primary-${member.id}`} className="cursor-pointer text-sm">
                                                                Membro Principal
                                                            </Label>
                                                        </div>*/}
                                                        {editIsPrimary ? (
                                                            <p className="text-[10px] text-muted-foreground leading-tight">
                                                                Responsável pelos arquivos no Google Drive.
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="mt-2">
                                                        {member.role}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {editingId !== member.id && (
                                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => startEdit(member)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteMember(member.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
