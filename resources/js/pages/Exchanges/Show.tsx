import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, CheckCircle, Circle, MapPin, Calendar, CreditCard, FileText, ShoppingBag, PiggyBank, Upload, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = [
    { id: 'before_go', label: 'Antes de ir' },
    { id: 'arrival', label: 'Chegada' },
    { id: 'during', label: 'Durante' }
];

const PURCHASE_CATEGORIES = [
    { id: 'clothing', label: 'Roupas' },
    { id: 'document', label: 'Documentos' },
    { id: 'tech', label: 'Tecnologia' },
    { id: 'home', label: 'Casa' },
    { id: 'other', label: 'Outros' }
];

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
    const { data: purchaseData, setData: setPurchaseData, post: postPurchase, reset: resetPurchase, processing: purchaseProcessing, errors: purchaseErrors } = useForm({
        item: '',
        estimated_cost: '',
        display_cost: '',
        category: 'clothing',
        type: 'before'
    });

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only digits and one dot
        if (value && !/^\d*\.?\d*$/.test(value)) return;

        setPurchaseData((prev: any) => ({
            ...prev,
            display_cost: value,
            estimated_cost: value
        }));
    };

    const submitPurchase = (e: React.FormEvent) => {
        e.preventDefault();
        postPurchase(`/exchanges/${exchange.id}/purchases`, {
            onSuccess: () => {
                resetPurchase();
                setPurchaseData(prev => ({ ...prev, item: '', estimated_cost: '', display_cost: '' }));
            },
            preserveScroll: true
        });
    };

    const deletePurchase = (id: number) => {
        if (confirm('Delete purchase?')) router.delete(`/purchases/${id}`, { preserveScroll: true });
    };

    // Document Form
    const { data: documentData, setData: setDocumentData, post: postDocument, reset: resetDocument, processing: documentProcessing } = useForm({
        type: '',
        expiration_date: '',
        is_mandatory: false
    });

    const submitDocument = (e: React.FormEvent) => {
        e.preventDefault();
        postDocument(`/exchanges/${exchange.id}/documents`, {
            onSuccess: () => resetDocument()
        });
    };

    const deleteDocument = (id: number) => {
        if (confirm('Remover documento?')) router.delete(`/documents/${id}`, { preserveScroll: true });
    };

    const togglePurchase = (purchase: any) => {
        if (purchase.status === 'completed') {
            if (confirm('Deseja marcar como não comprado? O valor pago será removido.')) {
                router.put(`/purchases/${purchase.id}`, {
                    status: 'pending',
                    actual_cost: null
                }, { preserveScroll: true });
            }
        } else {
            const cost = prompt('Qual foi o valor real pago ($)?', purchase.estimated_cost);
            if (cost !== null) {
                const cleanCost = cost.replace(/,/g, '.');
                if (isNaN(Number(cleanCost)) || cleanCost.trim() === '') {
                    alert('Por favor, insira um valor válido.');
                    return;
                }

                router.put(`/purchases/${purchase.id}`, {
                    status: 'completed',
                    actual_cost: cleanCost
                }, { preserveScroll: true });
            }
        }
    };

    // Filtered Tasks
    const tasks = exchange.tasks || []; // Ensure tasks is array
    const filteredTasks = tasks.filter((task: any) => {
        if (checklistFilter === 'all') return true;
        return task.category === checklistFilter;
    });

    return (
        <AuthenticatedLayout>
            <Head title={`${exchange.city}, ${exchange.country}`} />

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
                            <Button variant="outline" className='dark:text-white'>Editar</Button>
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
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Compras Realizadas</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {exchange.purchases?.filter((p: any) => p.status === 'completed').length} / {exchange.purchases?.length || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Gasto Real</CardTitle>
                                <PiggyBank className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    ${Number(exchange.purchases?.reduce((acc: number, curr: any) => acc + Number(curr.actual_cost || 0), 0) || 0).toFixed(2)}
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
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                            ))}
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
                            <button
                                onClick={() => setChecklistFilter('all')}
                                className={cn(
                                    "px-3 py-1 text-xs rounded-full border transition-colors",
                                    checklistFilter === 'all'
                                        ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                                )}
                            >
                                Todas
                            </button>
                            {CATEGORIES.map((cat) => (
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
                                                {CATEGORIES.find(c => c.id === task.category)?.label || task.category}
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
                            <form onSubmit={submitPurchase} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Item</Label>
                                    <Input
                                        value={purchaseData.item}
                                        onChange={e => setPurchaseData('item', e.target.value)}
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
                                    <Select value={purchaseData.category} onValueChange={val => setPurchaseData('category', val)}>
                                        <SelectTrigger> <SelectValue /> </SelectTrigger>
                                        <SelectContent>
                                            {PURCHASE_CATEGORIES.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {purchaseErrors.category && <span className="text-xs text-red-500">{purchaseErrors.category}</span>}
                                </div>
                                <div className="md:col-span-1 pt-8">
                                    <Button type="submit" disabled={purchaseProcessing} className="w-full">
                                        Adicionar
                                    </Button>
                                </div>
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
                                    <tr key={purchase.id} className="text-slate-900 dark:text-slate-100">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => togglePurchase(purchase)}
                                                    className={cn(
                                                        "flex-shrink-0 transition-all duration-200",
                                                        purchase.status === 'completed'
                                                            ? "text-green-600 dark:text-green-500"
                                                            : "text-slate-300 hover:text-slate-400 dark:text-slate-600"
                                                    )}
                                                    title={purchase.status === 'completed' ? "Marcar como pendente" : "Marcar como comprado"}
                                                >
                                                    {purchase.status === 'completed'
                                                        ? <CheckCircle className="h-5 w-5" />
                                                        : <Circle className="h-5 w-5" />
                                                    }
                                                </button>
                                                <div className={cn("font-medium", purchase.status === 'completed' && "line-through opacity-50")}>
                                                    {purchase.item}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {PURCHASE_CATEGORIES.find(c => c.id === purchase.category)?.label || purchase.category}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                            ${Number(purchase.estimated_cost).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {purchase.actual_cost ? (
                                                <span className={cn(
                                                    Number(purchase.actual_cost) > Number(purchase.estimated_cost) ? "text-red-500" : "text-green-600 dark:text-green-400"
                                                )}>
                                                    ${Number(purchase.actual_cost).toFixed(2)}
                                                </span>
                                            ) : '-'}
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
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
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
                            <form onSubmit={submitDocument} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 space-y-2 w-full">
                                    <Label>Nome do Documento</Label>
                                    <Input
                                        value={documentData.type}
                                        onChange={e => setDocumentData('type', e.target.value)}
                                        placeholder="Ex: Passaporte, Visto..."
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-[200px] space-y-2">
                                    <Label>Validade (Opcional)</Label>
                                    <Input
                                        type="date"
                                        value={documentData.expiration_date}
                                        onChange={e => setDocumentData('expiration_date', e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-[200px] space-y-2">
                                    <Label>Arquivo (Opcional)</Label>
                                    <Input
                                        type="file"
                                        onChange={e => e.target.files && setDocumentData('file', e.target.files[0])}
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
                        {(!exchange.documents || exchange.documents.length === 0) && (
                            <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded-lg dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800">
                                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>Nenhum documento cadastrado.</p>
                            </div>
                        )}

                        {(exchange.documents || []).map((doc: any) => (
                            <Card key={doc.id} className="relative overflow-hidden group">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-slate-500" />
                                            {doc.type}
                                        </CardTitle>
                                        <div className="flex gap-1 -mr-2 -mt-2">
                                            {doc.file_path && (
                                                <a href={`/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-500" title="Visualizar">
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                </a>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => deleteDocument(doc.id)} title="Remover">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Status:</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider",
                                                doc.status === 'valid' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                    doc.status === 'expired' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            )}>
                                                {doc.status === 'pending' ? 'Pendente' :
                                                    doc.status === 'valid' ? 'Válido' :
                                                        doc.status === 'sent' ? 'Enviado' :
                                                            doc.status === 'expired' ? 'Expirado' : doc.status}
                                            </span>
                                        </div>
                                        {doc.expiration_date && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Validade:</span>
                                                <span className={cn(
                                                    new Date(doc.expiration_date) < new Date() ? "text-red-500 font-bold" : "text-slate-700 dark:text-slate-300"
                                                )}>
                                                    {new Date(doc.expiration_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        <div className="pt-2 flex justify-end">
                                            {!doc.file_path && (
                                                <label className="text-xs flex items-center gap-1 cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                                    <Upload className="h-3 w-3" /> Anexar Arquivo
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                router.post(`/documents/${doc.id}`, {
                                                                    _method: 'put',
                                                                    file: e.target.files[0]
                                                                }, { preserveScroll: true });
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                            {doc.file_path && (
                                                <label className="text-xs flex items-center gap-1 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                    <Upload className="h-3 w-3" /> Substituir
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                router.post(`/documents/${doc.id}`, {
                                                                    _method: 'put',
                                                                    file: e.target.files[0]
                                                                }, { preserveScroll: true });
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
