import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, DollarSign, Users, Calendar } from 'lucide-react';

const StatCard = ({ title, value, description, icon: Icon }: any) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </CardContent>
    </Card>
);

export default function Dashboard({ auth }: { auth: any }) {
    return (
        <AuthenticatedLayout>
            <Head title="Painel de Controle" />

            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total de Intercâmbios Ativos"
                        value="2"
                        description="+1 do mês passado"
                        icon={Activity}
                    />
                    <StatCard
                        title="Documentos Pendentes"
                        value="3"
                        description="2 obrigatórios"
                        icon={Users}
                    />
                    <StatCard
                        title="Orçamento Gasto"
                        value="$3,240"
                        description="45% do orçamento total"
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Próximos Eventos"
                        value="5"
                        description="Nos próximos 7 dias"
                        icon={Calendar}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 h-[400px]">
                        <CardHeader>
                            <CardTitle>Visão Geral</CardTitle>
                            <CardDescription>Espaço reservado para gráfico de atividade</CardDescription>
                        </CardHeader>
                        <CardContent>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3 rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 h-[400px]">
                        <CardHeader>
                            <CardTitle>Atividade Recente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500">Lista de ações recentes</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
