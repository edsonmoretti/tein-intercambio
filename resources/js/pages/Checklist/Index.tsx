import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, CheckCircle, Circle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Index({ tasks, members }: { tasks: any[], members: any[] }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        description: '',
        family_member_id: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/checklist', {
            onSuccess: () => reset(),
        });
    };

    const toggleStatus = (task: any) => {
        router.put(`/checklist/${task.id}`, {
            is_completed: !task.is_completed
        }, { preserveScroll: true });
    };

    const deleteTask = (id: number) => {
        if (confirm('Excluir esta tarefa?')) {
            router.delete(`/checklist/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Checklist Geral" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Checklist do Lar</h1>
                <p className="text-muted-foreground">Tarefas e afazeres da família.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                <div className="md:col-span-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nova Tarefa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <Input
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Ex: Levar o carro na revisão..."
                                    required
                                />
                                <Select value={data.family_member_id} onValueChange={(val) => setData('family_member_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Atribuir a quem? (Opcional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nobody">Ninguém</SelectItem>
                                        {members.map((m) => (
                                            <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Plus className="mr-2 h-4 w-4" /> Criar Tarefa
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Tarefas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tasks.length === 0 ? (
                                <p className="text-center py-8 text-slate-500">Nenhuma tarefa pendente.</p>
                            ) : (
                                <div className="space-y-2">
                                    {tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-lg border transition-colors",
                                                task.is_completed
                                                    ? "bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800"
                                                    : "bg-white border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-800"
                                            )}
                                        >
                                            <div className="flex items-start gap-3 flex-1">
                                                <button
                                                    onClick={() => toggleStatus(task)}
                                                    className={cn(
                                                        "mt-1 flex-shrink-0 transition-colors",
                                                        task.is_completed ? "text-green-500" : "text-slate-300 hover:text-slate-400"
                                                    )}
                                                >
                                                    {task.is_completed ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                                </button>
                                                <div className="space-y-1">
                                                    <p className={cn(
                                                        "text-sm font-medium",
                                                        task.is_completed && "text-slate-500 line-through"
                                                    )}>
                                                        {task.description}
                                                    </p>
                                                    {task.member && (
                                                        <Badge variant="outline" className="text-xs font-normal gap-1">
                                                            <User className="h-3 w-3" />
                                                            {task.member.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-red-500"
                                                onClick={() => deleteTask(task.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
