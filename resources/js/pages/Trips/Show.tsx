import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Circle,
    CreditCard,
    Eye,
    FileText,
    Home,
    MapPin,
    PiggyBank,
    Plus,
    ShoppingBag,
    Trash2,
    Upload,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const CATEGORIES = [
    { id: 'before_go', label: 'Antes de ir' },
    { id: 'arrival', label: 'Chegada' },
    { id: 'during', label: 'Durante' },
];

const PURCHASE_CATEGORIES = [
    { id: 'clothing', label: 'Roupas' },
    { id: 'document', label: 'Documentos' },
    { id: 'tech', label: 'Tecnologia' },
    { id: 'home', label: 'Casa' },
    { id: 'other', label: 'Outros' },
];

export default function Show({ trip }: { trip: any }) {
    const [activeTab, setActiveTab] = useState('details');
    // Checklist Filtering
    const [checklistFilter, setChecklistFilter] = useState<string>('all');

    // Task Form
    const {
        data: taskData,
        setData: setTaskData,
        post: postTask,
        reset: resetTask,
        processing: taskProcessing,
    } = useForm({
        description: '',
        category: 'before_go',
        due_date: '',
        trip_member_id: '',
    });

    const submitTask = (e: React.FormEvent) => {
        e.preventDefault();
        postTask(`/trips/${trip.id}/tasks`, {
            onSuccess: () => resetTask(),
        });
    };

    const toggleTask = (task: any) => {
        router.put(
            `/tasks/${task.id}`,
            {
                status: task.status === 'completed' ? 'pending' : 'completed',
            },
            { preserveScroll: true },
        );
    };

    const deleteTask = (id: number) => {
        if (confirm('Delete task?')) router.delete(`/tasks/${id}`, { preserveScroll: true });
    };

    // Purchase Form
    const {
        data: purchaseData,
        setData: setPurchaseData,
        post: postPurchase,
        reset: resetPurchase,
        processing: purchaseProcessing,
        errors: purchaseErrors,
    } = useForm({
        item: '',
        estimated_cost: '',
        display_cost: '',
        category: 'clothing',
        type: 'before',
        trip_member_id: '',
    });

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only digits and one dot
        if (value && !/^\d*\.?\d*$/.test(value)) return;

        setPurchaseData((prev: any) => ({
            ...prev,
            display_cost: value,
            estimated_cost: value,
        }));
    };

    const submitPurchase = (e: React.FormEvent) => {
        e.preventDefault();
        postPurchase(`/trips/${trip.id}/purchases`, {
            onSuccess: () => {
                resetPurchase();
                setPurchaseData((prev) => ({ ...prev, item: '', estimated_cost: '', display_cost: '' }));
            },
            preserveScroll: true,
        });
    };

    const deletePurchase = (id: number) => {
        if (confirm('Delete purchase?')) router.delete(`/purchases/${id}`, { preserveScroll: true });
    };

    // Document Form
    const {
        data: documentData,
        setData: setDocumentData,
        post: postDocument,
        reset: resetDocument,
        processing: documentProcessing,
    } = useForm({
        type: '',
        expiration_date: '',
        is_mandatory: false,
        trip_member_id: 'all',
        file: null as File | null,
    });

    const submitDocument = (e: React.FormEvent) => {
        e.preventDefault();
        postDocument(`/trips/${trip.id}/documents`, {
            onSuccess: () => resetDocument(),
        });
    };

    const deleteDocument = (id: number) => {
        if (confirm('Remover documento?')) router.delete(`/documents/${id}`, { preserveScroll: true });
    };

    const togglePurchase = (purchase: any) => {
        if (purchase.status === 'completed') {
            if (confirm('Deseja marcar como não comprado? O valor pago será removido.')) {
                router.put(
                    `/purchases/${purchase.id}`,
                    {
                        status: 'pending',
                        actual_cost: null,
                    },
                    { preserveScroll: true },
                );
            }
        } else {
            const cost = prompt('Qual foi o valor real pago ($)?', purchase.estimated_cost);
            if (cost !== null) {
                const cleanCost = cost.replace(/,/g, '.');
                if (isNaN(Number(cleanCost)) || cleanCost.trim() === '') {
                    alert('Por favor, insira um valor válido.');
                    return;
                }

                router.put(
                    `/purchases/${purchase.id}`,
                    {
                        status: 'completed',
                        actual_cost: cleanCost,
                    },
                    { preserveScroll: true },
                );
            }
        }
    };

    // Budget Form
    const {
        data: budgetData,
        setData: setBudgetData,
        post: postBudget,
        reset: resetBudget,
        processing: budgetProcessing,
    } = useForm({
        category: '',
        planned_amount: '',
        spent_amount: '',
        period: 'monthly',
    });

    const submitBudget = (e: React.FormEvent) => {
        e.preventDefault();
        postBudget(`/trips/${trip.id}/budgets`, {
            onSuccess: () => resetBudget(),
        });
    };

    const deleteBudget = (id: number) => {
        if (confirm('Remover orçamento?')) router.delete(`/budgets/${id}`, { preserveScroll: true });
    };

    // Filtered Tasks
    const tasks = trip.tasks || []; // Ensure tasks is array
    const filteredTasks = tasks.filter((task: any) => {
        if (checklistFilter === 'all') return true;
        return task.category === checklistFilter;
    });

    // Housing Form
    const {
        data: housingData,
        setData: setHousingData,
        post: postHousing,
        reset: resetHousing,
        processing: housingProcessing,
    } = useForm({
        type: 'Casa de Família',
        address: '',
        contact_info: '',
        start_date: '',
        end_date: '',
        cost: '',
    });

    const submitHousing = (e: React.FormEvent) => {
        e.preventDefault();
        postHousing(`/trips/${trip.id}/housings`, {
            onSuccess: () => resetHousing(),
        });
    };

    const deleteHousing = (id: number) => {
        if (confirm('Remover acomodação?')) router.delete(`/housings/${id}`, { preserveScroll: true });
    };

    // Member Form
    const {
        data: memberData,
        setData: setMemberData,
        post: postMember,
        reset: resetMember,
        processing: memberProcessing,
    } = useForm({
        name: '',
        user_id: '', // Optional linkage to user account
    });

    const submitMember = (e: React.FormEvent) => {
        e.preventDefault();
        postMember(`/trips/${trip.id}/members`, {
            onSuccess: () => resetMember(),
        });
    };

    const deleteMember = (id: number) => {
        if (confirm('Remover participante?')) router.delete(`/trip-members/${id}`, { preserveScroll: true });
    };

    // Budget Calculations
    const totalBudget = trip.budgets?.reduce((acc: number, curr: any) => acc + Number(curr.planned_amount), 0) || 0;
    const totalEstimated = trip.purchases?.reduce((acc: number, curr: any) => acc + Number(curr.estimated_cost || 0), 0) || 0;
    const totalActual = trip.purchases?.reduce((acc: number, curr: any) => acc + Number(curr.actual_cost || 0), 0) || 0;

    return (
        <AuthenticatedLayout>
            <Head title={`${trip.city}, ${trip.country}`} />

            <div className="mb-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/trips" className="hover:text-slate-900">
                        Viagens
                    </Link>
                    <span>/</span>
                    <span className="font-medium text-slate-900 dark:text-white">Detalhes</span>
                </div>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {trip.city}, {trip.country}
                        </h1>
                        <p className="mt-1 flex items-center gap-2 text-slate-500">
                            <SchoolIcon className="h-4 w-4" />
                            {trip.place ? (
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${trip.place}, ${trip.city}, ${trip.country}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-colors hover:text-blue-600 hover:underline"
                                >
                                    {trip.place}
                                </a>
                            ) : (
                                'Local não definido'
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/trips/${trip.id}/edit`}>
                            <Button variant="outline" className="dark:text-white">
                                Editar
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} className="space-y-4" onValueChange={setActiveTab}>
                <TabsList className="h-auto flex-wrap justify-start">
                    <TabsTrigger value="details">Resumo</TabsTrigger>
                    <TabsTrigger value="members">Participantes</TabsTrigger>
                    <TabsTrigger value="budget">Financeiro</TabsTrigger>
                    <TabsTrigger value="housing">Moradia</TabsTrigger>
                    <TabsTrigger value="checklist">Checklist</TabsTrigger>
                    <TabsTrigger value="purchases">Compras</TabsTrigger>
                    <TabsTrigger value="documents">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    {/* ... (existing details content) ... */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Progresso Checklist</CardTitle>
                                <CheckCircle className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {trip.tasks?.filter((t: any) => t.status === 'completed').length} / {trip.tasks?.length || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
                                <PiggyBank className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">${Number(totalBudget).toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Compras Realizadas</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {trip.purchases?.filter((p: any) => p.status === 'completed').length} / {trip.purchases?.length || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Gasto Real (Compras)</CardTitle>
                                <CreditCard className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">${Number(totalActual).toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="members" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Participante</CardTitle>
                            <CardDescription>Cadastre quem participará desta viagem (você, cônjuge, filho(a), etc).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitMember} className="flex items-end gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label>Nome do Participante</Label>
                                    <Input
                                        value={memberData.name}
                                        onChange={(e) => setMemberData('name', e.target.value)}
                                        placeholder="Ex: João, Maria, Eu..."
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={memberProcessing}>
                                    Adicionar
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {(trip.members || []).map((member: any) => (
                            <Card key={member.id} className="relative">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                                        <Users className="h-4 w-4 text-slate-500" />
                                        {member.name}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-slate-400 hover:text-red-500"
                                        onClick={() => deleteMember(member.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-slate-500">Adicionado em {new Date(member.created_at).toLocaleDateString()}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="budget" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Visão Geral Financeira</CardTitle>
                                <CardDescription>Comparativo entre Orçamento Planejado, Estimativas de Compra e Gastos Reais.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Orçamento Definido</span>
                                        <span className="font-bold">${totalBudget.toFixed(2)}</span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div className="h-full rounded-full bg-blue-500" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Custo Estimado (Compras)</span>
                                        <span className="font-bold text-slate-600 dark:text-slate-400">${totalEstimated.toFixed(2)}</span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                                            style={{ width: `${totalBudget > 0 ? Math.min((totalEstimated / totalBudget) * 100, 100) : 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {totalBudget > 0
                                            ? `${((totalEstimated / totalBudget) * 100).toFixed(1)}% do orçamento`
                                            : 'Defina um orçamento para ver a porcentagem.'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Gasto Real (Confirmado)</span>
                                        <span className={cn('font-bold', totalActual > totalBudget ? 'text-red-500' : 'text-green-600')}>
                                            ${totalActual.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all duration-500',
                                                totalActual > totalBudget ? 'bg-red-500' : 'bg-green-500',
                                            )}
                                            style={{ width: `${totalBudget > 0 ? Math.min((totalActual / totalBudget) * 100, 100) : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Definir Orçamentos</CardTitle>
                                <CardDescription>Adicione categorias de orçamento macro (Ex: Passagens, Moradia, Alimentação).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitBudget} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Categoria</Label>
                                            <Input
                                                value={budgetData.category}
                                                onChange={(e) => setBudgetData('category', e.target.value)}
                                                placeholder="Ex: Moradia"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Valor Planejado ($)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={budgetData.planned_amount}
                                                onChange={(e) => setBudgetData('planned_amount', e.target.value)}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={budgetProcessing} className="w-full">
                                        Adicionar Orçamento
                                    </Button>
                                </form>

                                <div className="mt-6 space-y-2">
                                    <h4 className="mb-3 text-sm font-medium text-slate-500">Orçamentos Definidos</h4>
                                    {(trip.budgets || []).length === 0 && (
                                        <p className="text-center text-sm text-slate-400 italic">Nenhum orçamento definido.</p>
                                    )}
                                    <div className="max-h-[200px] space-y-2 overflow-y-auto pr-2">
                                        {(trip.budgets || []).map((budget: any) => (
                                            <div
                                                key={budget.id}
                                                className="flex items-center justify-between rounded border bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">{budget.category}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold">${Number(budget.planned_amount).toFixed(2)}</span>
                                                    <button onClick={() => deleteBudget(budget.id)} className="text-slate-400 hover:text-red-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                            <form onSubmit={submitTask} className="flex flex-col items-end gap-4 md:flex-row">
                                <div className="w-full flex-1 space-y-2">
                                    <Label>Descrição</Label>
                                    <Input
                                        value={taskData.description}
                                        onChange={(e) => setTaskData('description', e.target.value)}
                                        placeholder="Ex: Renovar passaporte..."
                                        required
                                    />
                                </div>
                                <div className="w-full space-y-2 md:w-[200px]">
                                    <Label>Atribuir a (Opcional)</Label>
                                    <Select value={taskData.trip_member_id} onValueChange={(val) => setTaskData('trip_member_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(trip.members || []).map((m: any) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full space-y-2 md:w-[200px]">
                                    <Label>Categoria</Label>
                                    <Select value={taskData.category} onValueChange={(val) => setTaskData('category', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full space-y-2 md:w-[150px]">
                                    <Label>Prazo (Opcional)</Label>
                                    <Input type="date" value={taskData.due_date} onChange={(e) => setTaskData('due_date', e.target.value)} />
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
                            <button
                                onClick={() => setChecklistFilter('all')}
                                className={cn(
                                    'rounded-full border px-3 py-1 text-xs transition-colors',
                                    checklistFilter === 'all'
                                        ? 'border-slate-900 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400',
                                )}
                            >
                                Todas
                            </button>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setChecklistFilter(cat.id)}
                                    className={cn(
                                        'rounded-full border px-3 py-1 text-xs transition-colors',
                                        checklistFilter === cat.id
                                            ? 'border-slate-900 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400',
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {filteredTasks.length === 0 && (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                                Nenhuma tarefa encontrada nesta categoria.
                            </div>
                        )}

                        {filteredTasks.map((task: any) => (
                            <div
                                key={task.id}
                                className={cn(
                                    'flex items-center justify-between rounded-lg border p-4 transition-colors',
                                    task.status === 'completed'
                                        ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                                        : 'border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950',
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleTask(task)}
                                        className={cn(
                                            'flex-shrink-0 transition-all duration-200',
                                            task.status === 'completed'
                                                ? 'text-green-600 dark:text-green-500'
                                                : 'text-slate-300 hover:text-slate-400 dark:text-slate-600',
                                        )}
                                    >
                                        {task.status === 'completed' ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                                    </button>
                                    <div className={cn('space-y-1', task.status === 'completed' && 'opacity-50')}>
                                        <p
                                            className={cn(
                                                'font-medium text-slate-900 dark:text-slate-100',
                                                task.status === 'completed' && 'line-through',
                                            )}
                                        >
                                            {task.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-800">
                                                {CATEGORIES.find((c) => c.id === task.category)?.label || task.category}
                                            </span>
                                            {task.member && (
                                                <span className="flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                                    <Users className="h-3 w-3" /> {task.member.name}
                                                </span>
                                            )}
                                            {task.due_date && (
                                                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                                    <Calendar className="h-3 w-3" /> {new Date(task.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
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
                            <form onSubmit={submitPurchase} className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Item</Label>
                                    <Input
                                        value={purchaseData.item}
                                        onChange={(e) => setPurchaseData('item', e.target.value)}
                                        placeholder="Ex: Mala grande"
                                        required
                                    />
                                    {purchaseErrors.item && <span className="text-xs text-red-500">{purchaseErrors.item}</span>}
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Custo Estimado ($)</Label>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        value={purchaseData.display_cost}
                                        onChange={handleCostChange}
                                        placeholder="0.00"
                                        required
                                    />
                                    {purchaseErrors.estimated_cost && <span className="text-xs text-red-500">{purchaseErrors.estimated_cost}</span>}
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Categoria</Label>
                                    <Select value={purchaseData.category} onValueChange={(val) => setPurchaseData('category', val)}>
                                        <SelectTrigger>
                                            {' '}
                                            <SelectValue />{' '}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PURCHASE_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {purchaseErrors.category && <span className="text-xs text-red-500">{purchaseErrors.category}</span>}
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Atribuir a (Opcional)</Label>
                                    <Select
                                        value={purchaseData.trip_member_id}
                                        onValueChange={(val) => setPurchaseData('trip_member_id', val)}
                                    >
                                        <SelectTrigger>
                                            {' '}
                                            <SelectValue placeholder="Todos" />{' '}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(trip.members || []).map((m: any) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="pt-8 md:col-span-1">
                                    <Button type="submit" disabled={purchaseProcessing} className="w-full">
                                        Adicionar
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="overflow-hidden rounded-lg border bg-white dark:border-slate-800 dark:bg-slate-900">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3">Categoria</th>
                                    <th className="px-4 py-3">Quem</th>
                                    <th className="px-4 py-3">Estimado</th>
                                    <th className="px-4 py-3">Real</th>
                                    <th className="px-4 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {(trip.purchases || []).map((purchase: any) => (
                                    <tr key={purchase.id} className="text-slate-900 dark:text-slate-100">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => togglePurchase(purchase)}
                                                    className={cn(
                                                        'flex-shrink-0 transition-all duration-200',
                                                        purchase.status === 'completed'
                                                            ? 'text-green-600 dark:text-green-500'
                                                            : 'text-slate-300 hover:text-slate-400 dark:text-slate-600',
                                                    )}
                                                    title={purchase.status === 'completed' ? 'Marcar como pendente' : 'Marcar como comprado'}
                                                >
                                                    {purchase.status === 'completed' ? (
                                                        <CheckCircle className="h-5 w-5" />
                                                    ) : (
                                                        <Circle className="h-5 w-5" />
                                                    )}
                                                </button>
                                                <div className={cn('font-medium', purchase.status === 'completed' && 'line-through opacity-50')}>
                                                    {purchase.item}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {PURCHASE_CATEGORIES.find((c) => c.id === purchase.category)?.label || purchase.category}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{purchase.member ? purchase.member.name : '-'}</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                            ${Number(purchase.estimated_cost).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {purchase.actual_cost ? (
                                                <span
                                                    className={cn(
                                                        Number(purchase.actual_cost) > Number(purchase.estimated_cost)
                                                            ? 'text-red-500'
                                                            : 'text-green-600 dark:text-green-400',
                                                    )}
                                                >
                                                    ${Number(purchase.actual_cost).toFixed(2)}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500"
                                                onClick={() => deletePurchase(purchase.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {(!trip.purchases || trip.purchases.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                            Nenhuma compra planejada ainda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Documento</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitDocument} className="flex flex-col items-end gap-4 md:flex-row">
                                <div className="w-full flex-1 space-y-2">
                                    <Label>Nome do Documento</Label>
                                    <Input
                                        value={documentData.type}
                                        onChange={(e) => setDocumentData('type', e.target.value)}
                                        placeholder="Ex: Passaporte, Visto..."
                                        required
                                    />
                                </div>
                                <div className="w-full space-y-2 md:w-[200px]">
                                    <Label>Validade (Opcional)</Label>
                                    <Input
                                        type="date"
                                        value={documentData.expiration_date}
                                        onChange={(e) => setDocumentData('expiration_date', e.target.value)}
                                    />
                                </div>
                                <div className="w-full space-y-2 md:w-[200px]">
                                    <Label>Atribuir a</Label>
                                    <Select
                                        value={documentData.trip_member_id}
                                        onValueChange={(val) => setDocumentData('trip_member_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os Participantes</SelectItem>
                                            {(trip.members || []).map((m: any) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full space-y-2 md:w-[200px]">
                                    <Label>Arquivo (Opcional)</Label>
                                    <Input
                                        type="file"
                                        onChange={(e) => e.target.files && setDocumentData('file', e.target.files[0])}
                                        className="cursor-pointer"
                                    />
                                </div>
                                <Button type="submit" disabled={documentProcessing}>
                                    Adicionar
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {(!trip.documents || trip.documents.length === 0) && (
                            <div className="col-span-full rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                                <FileText className="mx-auto mb-2 h-10 w-10 opacity-20" />
                                <p>Nenhum documento cadastrado.</p>
                            </div>
                        )}

                        {(trip.documents || []).map((doc: any) => (
                            <Card key={doc.id} className="group relative overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                                            <FileText className="h-4 w-4 text-slate-500" />
                                            {doc.type}
                                        </CardTitle>
                                        <div className="-mt-2 -mr-2 flex gap-1">
                                            {doc.file_path && (
                                                <a href={`/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-slate-400 hover:text-blue-500"
                                                        title="Visualizar"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                </a>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-slate-400 hover:text-red-500"
                                                onClick={() => deleteDocument(doc.id)}
                                                title="Remover"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    {doc.member && (
                                        <CardDescription className="flex items-center gap-1 text-xs">
                                            <Users className="h-3 w-3" /> {doc.member.name}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500">Status:</span>
                                            <span
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                                                    doc.status === 'valid'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : doc.status === 'expired'
                                                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                                                )}
                                            >
                                                {doc.status === 'pending'
                                                    ? 'Pendente'
                                                    : doc.status === 'valid'
                                                      ? 'Válido'
                                                      : doc.status === 'sent'
                                                        ? 'Enviado'
                                                        : doc.status === 'expired'
                                                          ? 'Expirado'
                                                          : doc.status}
                                            </span>
                                        </div>
                                        {doc.expiration_date && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Validade:</span>
                                                <span
                                                    className={cn(
                                                        new Date(doc.expiration_date) < new Date()
                                                            ? 'font-bold text-red-500'
                                                            : 'text-slate-700 dark:text-slate-300',
                                                    )}
                                                >
                                                    {new Date(doc.expiration_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-2">
                                            {!doc.file_path && (
                                                <label className="flex cursor-pointer items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                                    <Upload className="h-3 w-3" /> Anexar Arquivo
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                router.post(
                                                                    `/documents/${doc.id}`,
                                                                    {
                                                                        _method: 'put',
                                                                        file: e.target.files[0],
                                                                    },
                                                                    { preserveScroll: true },
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                            {doc.file_path && (
                                                <label className="flex cursor-pointer items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                    <Upload className="h-3 w-3" /> Substituir
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                router.post(
                                                                    `/documents/${doc.id}`,
                                                                    {
                                                                        _method: 'put',
                                                                        file: e.target.files[0],
                                                                    },
                                                                    { preserveScroll: true },
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="housing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Acomodação</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitHousing} className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <Select value={housingData.type} onValueChange={(val) => setHousingData('type', val)}>
                                        <SelectTrigger>
                                            {' '}
                                            <SelectValue />{' '}
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Casa de Família">Casa de Família (Homestay)</SelectItem>
                                            <SelectItem value="Residência Estudantil">Residência Estudantil</SelectItem>
                                            <SelectItem value="Apartamento">Apartamento</SelectItem>
                                            <SelectItem value="Hotel/Hostel">Hotel/Hostel</SelectItem>
                                            <SelectItem value="Outro">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Endereço</Label>
                                    <Input
                                        value={housingData.address}
                                        onChange={(e) => setHousingData('address', e.target.value)}
                                        placeholder="Rua, Número, Bairro..."
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contato (Opcional)</Label>
                                    <Input
                                        value={housingData.contact_info}
                                        onChange={(e) => setHousingData('contact_info', e.target.value)}
                                        placeholder="Nome, Telefone ou Email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Check-in</Label>
                                    <Input
                                        type="date"
                                        value={housingData.start_date}
                                        onChange={(e) => setHousingData('start_date', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Check-out</Label>
                                    <Input
                                        type="date"
                                        value={housingData.end_date}
                                        onChange={(e) => setHousingData('end_date', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Custo ($)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={housingData.cost}
                                        onChange={(e) => setHousingData('cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="lg:col-span-3">
                                    <Button type="submit" disabled={housingProcessing}>
                                        Adicionar Acomodação
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {(trip.housings || []).map((housing: any) => (
                            <Card key={housing.id} className="relative overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                                            <Home className="h-4 w-4 text-slate-500" />
                                            {housing.type}
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="-mt-2 -mr-2 h-6 w-6 text-slate-400 hover:text-red-500"
                                            onClick={() => deleteHousing(housing.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <CardDescription>{housing.address}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {new Date(housing.start_date).toLocaleDateString()} - {new Date(housing.end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {housing.cost && (
                                        <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                                            <CreditCard className="h-3 w-3 text-slate-500" />
                                            <span>${Number(housing.cost).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {housing.contact_info && (
                                        <div className="mt-2 border-t pt-2 text-xs text-slate-500">
                                            <strong>Contato:</strong> {housing.contact_info}
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(housing.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            <MapPin className="h-3 w-3" /> Ver rotas
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
    );
}
