import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Calendar, School, ArrowRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exchange {
    id: number;
    country: string;
    city: string;
    institution: string;
    start_date: string;
    end_date: string;
    type: string;
    status: string;
}

export default function Index({ exchanges }: { exchanges: Exchange[] }) {

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este intercâmbio?')) {
            router.delete(`/exchanges/${id}`);
        }
    };

    const statusColors: Record<string, string> = {
        planning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
        documents: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
        confirmed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500",
        in_progress: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
        completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    };

    return (
        <AuthenticatedLayout>
            <Head title="Intercâmbios" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight dark:text-white">Intercâmbios</h1>
                    <p className="text-muted-foreground dark:text-white">Gerencie seus planos de viagem de estudos.</p>
                </div>
                <Link href="/exchanges/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Novo Intercâmbio
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {exchanges.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        Nenhum intercâmbio encontrado. Comece criando um novo!
                    </div>
                )}

                {exchanges.map((exchange) => (
                    <Card key={exchange.id} className="group relative overflow-hidden transition-all hover:shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className={cn("px-2.5 py-0.5 text-xs font-semibold rounded-full", statusColors[exchange.status] || "bg-gray-100 text-gray-800")}>
                                    {exchange.status.toUpperCase()}
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(exchange.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardTitle className="text-xl mt-2 flex items-center gap-2">
                                <span className="text-2xl mr-1">
                                    {/* Simple flag mapping or just empty for now */}
                                    🌍
                                </span>
                                {exchange.city}, {exchange.country}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <School className="h-3 w-3" /> {exchange.institution || 'N/A'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>
                                        {exchange.start_date ? new Date(exchange.start_date).toLocaleDateString() : 'TBD'}
                                        {' - '}
                                        {exchange.end_date ? new Date(exchange.end_date).toLocaleDateString() : 'TBD'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    <span className="capitalize">{exchange.type} Exchange</span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Link href={`/exchanges/${exchange.id}`}>
                                    <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                                        Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
