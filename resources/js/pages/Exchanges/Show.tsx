import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
// Note: Checkbox component is not created yet, I will simulate it standard input or create it next.
// Simulating with standard input type='checkbox' for now to be safe or cleaner code.
import { Plus, Trash2, CheckCircle, Circle, MapPin, Calendar, CreditCard, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Show({ exchange }: { exchange: any }) {
    const [activeTab, setActiveTab] = useState("details");
    // Checklist Filtering
    const [checklistFilter, setChecklistFilter] = useState<string>('all');

    // Task Form
    const { data: taskData, setData: setTaskData, post: postTask, reset: resetTask, processing: taskProcessing } = useForm({
        description: '',
        category: 'before_go',
        due_date: ''
    });

    const submitTask = (e: React.FormEvent) => {
        e.preventDefault();
        postTask(`/exchanges/${exchange.id}/tasks`, {
            onSuccess: () => resetTask()
        });
    };

    const toggleTask = (task: any) => {
        router.put(`/tasks/${task.id}`, {
            status: task.status === 'completed' ? 'pending' : 'completed'
        }, { preserveScroll: true });
    };

    const deleteTask = (id: number) => {
        if (confirm('Delete task?')) router.delete(`/tasks/${id}`, { preserveScroll: true });
    };

    // Purchase Form
    const { data: purchaseData, setData: setPurchaseData, post: postPurchase, reset: resetPurchase, processing: purchaseProcessing } = useForm({
        item: '',
        estimated_cost: '', // Changed to string to match input type
        display_cost: '',
        category: 'clothing',
        type: 'before'
    });

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPurchaseData((prev: any) => ({
            ...prev,
            display_cost: value,
            estimated_cost: value.replace(/[^0-9.]/g, '')
        }));
    };

    // ...

    const submitPurchase = (e: React.FormEvent) => {
        e.preventDefault();
        postPurchase(`/exchanges/${exchange.id}/purchases`, {
            onSuccess: () => {
                resetPurchase('item', 'estimated_cost', 'display_cost'); // Reset specific fields
                setPurchaseData(prev => ({ ...prev, item: '', estimated_cost: '', display_cost: '' }));
            },
            preserveScroll: true
        });
    };

    const deletePurchase = (id: number) => {
        if (confirm('Delete purchase?')) router.delete(`/purchases/${id}`, { preserveScroll: true });
    };

    // Filtered Tasks
    // Filtered Tasks
    const tasks = exchange.tasks || []; // Ensure tasks is array
    const filteredTasks = tasks.filter((task: any) => {
        if (checklistFilter === 'all') return true;
        return task.category === checklistFilter;
    });

    return (
        <AuthenticatedLayout>
            <Head title={`${exchange.city}, ${exchange.country}`} />

            {/* DEBUG: Validate data arrival */}
            {/* <pre className="text-xs bg-gray-100 p-2 overflow-auto max-h-20">{JSON.stringify(exchange, null, 2)}</pre> */}

            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link href="/exchanges" className="hover:text-slate-900">Intercâmbios</Link>
                    <span>/</span>
                    <span className="font-medium text-slate-900 dark:text-white">Detalhes</span>
                </div>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{exchange.city}, {exchange.country}</h1>
                        <p className="text-slate-500 flex items-center gap-2 mt-1">
                            <SchoolIcon className="h-4 w-4" /> {exchange.institution || 'Instituição não definida'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/exchanges/${exchange.id}/edit`}>
                            <Button variant="outline">Editar</Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="details">Resumo</TabsTrigger>
                    <TabsTrigger value="checklist">Checklist</TabsTrigger>
                    <TabsTrigger value="purchases">Compras</TabsTrigger>
                    <TabsTrigger value="documents">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Progresso Checklist</CardTitle>
                                <CheckCircle className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {exchange.tasks?.filter((t: any) => t.status === 'completed').length} / {exchange.tasks?.length || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Gasto Estimado</CardTitle>
                                <CreditCard className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    ${Number(exchange.purchases?.reduce((acc: number, curr: any) => acc + Number(curr.estimated_cost || 0), 0) || 0).toFixed(2)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="checklist" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nova Tarefa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitTask} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 space-y-2 w-full">
                                    <Label>Descrição</Label>
                                    <Input
                                        value={taskData.description}
                                        onChange={e => setTaskData('description', e.target.value)}
                                        placeholder="Ex: Renovar passaporte..."
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-[200px] space-y-2">
                                    <Label>Categoria</Label>
                                    <Select value={taskData.category} onValueChange={val => setTaskData('category', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="before_go">Antes de ir</SelectItem>
                                            <SelectItem value="arrival">Chegada</SelectItem>
                                            <SelectItem value="during">Durante</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full md:w-[150px] space-y-2">
                                    <Label>Prazo (Opcional)</Label>
                                    <Input
                                        type="date"
                                        value={taskData.due_date}
                                        onChange={e => setTaskData('due_date', e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={taskProcessing}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex items-center space-x-2 pb-2">
                        <span className="text-sm font-medium text-slate-500">Filtrar por:</span>
                        <div className="flex gap-2">
                            {[
                                { id: 'all', label: 'Todas' },
                                { id: 'before_go', label: 'Antes de ir' },
                                { id: 'arrival', label: 'Chegada' },
                                { id: 'during', label: 'Durante' }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setChecklistFilter(cat.id)}
                                    className={cn(
                                        "px-3 py-1 text-xs rounded-full border transition-colors",
                                        checklistFilter === cat.id
                                            ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {filteredTasks.length === 0 && (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800">
                                Nenhuma tarefa encontrada nesta categoria.
                            </div>
                        )}

                        {filteredTasks.map((task: any) => (
                            <div
                                key={task.id}
                                className={cn(
                                    "flex items-center justify-between p-4 border rounded-lg transition-colors",
                                    task.status === 'completed'
                                        ? "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                                        : "bg-white border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-800"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleTask(task)}
                                        className={cn(
                                            "flex-shrink-0 transition-all duration-200",
                                            task.status === 'completed'
                                                ? "text-green-600 dark:text-green-500"
                                                : "text-slate-300 hover:text-slate-400 dark:text-slate-600"
                                        )}
                                    >
                                        {task.status === 'completed'
                                            ? <CheckCircle className="h-6 w-6" />
                                            : <Circle className="h-6 w-6" />
                                        }
                                    </button>
                                    <div className={cn("space-y-1", task.status === 'completed' && "opacity-50")}>
                                        <p className={cn(
                                            "font-medium text-slate-900 dark:text-slate-100",
                                            task.status === 'completed' && "line-through"
                                        )}>
                                            {task.description}
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800">
                                                {task.category.replace('_', ' ')}
                                            </span>
                                            {task.due_date && (
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> {new Date(task.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="purchases" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Planejar Compra</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitPurchase} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Item</Label>
                                    <Input
                                        value={purchaseData.item}
                                        onChange={e => setPurchaseData('item', e.target.value)}
                                        placeholder="Ex: Mala grande"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Custo Estimado ($)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={purchaseData.display_cost}
                                        onChange={handleCostChange}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Categoria</Label>
                                    <Select value={purchaseData.category} onValueChange={val => setPurchaseData('category', val)}>
                                        <SelectTrigger> <SelectValue /> </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="clothing">Roupas</SelectItem>
                                            <SelectItem value="document">Documentos</SelectItem>
                                            <SelectItem value="tech">Tecnologia</SelectItem>
                                            <SelectItem value="home">Casa</SelectItem>
                                            <SelectItem value="other">Outros</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" disabled={purchaseProcessing} className="md:col-span-1">
                                    Adicionar
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900 dark:border-slate-800">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium dark:bg-slate-800 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3">Categoria</th>
                                    <th className="px-4 py-3">Estimado</th>
                                    <th className="px-4 py-3">Real</th>
                                    <th className="px-4 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {(exchange.purchases || []).map((purchase: any) => (
                                    <tr key={purchase.id}>
                                        <td className="px-4 py-3 font-medium">{purchase.item}</td>
                                        <td className="px-4 py-3 capitalize">{purchase.category}</td>
                                        <td className="px-4 py-3">${Number(purchase.estimated_cost).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {purchase.actual_cost ? `$${Number(purchase.actual_cost).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deletePurchase(purchase.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {(!exchange.purchases || exchange.purchases.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                            Nenhuma compra planejada ainda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="documents">
                    <div className="text-center py-10 text-slate-500">
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>Gestão de documentos em breve...</p>
                    </div>
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
}

function SchoolIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m4 6 8-4 8 4" />
            <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" />
            <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
            <path d="M18 5v17" />
            <path d="M6 5v17" />
            <circle cx="12" cy="9" r="2" />
        </svg>
    )
}
