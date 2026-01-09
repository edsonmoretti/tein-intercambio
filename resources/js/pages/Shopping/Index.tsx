import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, ShoppingBasket, Check, PlusCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

export default function Index({ items }: { items: any[] }) {
    const listItems = items.filter(i => i.is_on_list);
    const catalogItems = items; // Show all in catalog tab, or maybe just those NOT on list? Usually catalog shows all.

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/shopping', {
            onSuccess: () => reset(),
        });
    };

    const toggleList = (item: any) => {
        router.put(`/shopping/${item.id}`, {
            is_on_list: !item.is_on_list
        }, { preserveScroll: true });
    };

    const toggleCheck = (item: any) => {
        router.put(`/shopping/${item.id}`, {
            is_checked: !item.is_checked
        }, { preserveScroll: true });
    };

    const deleteItem = (id: number) => {
        if (confirm('Remover este item permanentemente?')) {
            router.delete(`/shopping/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Compras do Mês" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Compras do Mês</h1>
                <p className="text-muted-foreground">Gerencie sua lista de compras de supermercado/feira.</p>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list" className="gap-2">
                        <ShoppingBasket className="h-4 w-4" />
                        Lista de Compras
                        {listItems.length > 0 && (
                            <Badge variant="secondary" className="ml-1 px-1 py-0 text-[10px] h-4 min-w-4 flex items-center justify-center">
                                {listItems.filter(i => !i.is_checked).length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="catalog" className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Cadastrar / Gerenciar Itens
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Checklist de Mercado</CardTitle>
                            <CardDescription>
                                Marque os itens conforme for colocando no carrinho.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {listItems.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <ShoppingBasket className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>Sua lista está vazia.</p>
                                    <Button variant="link" onClick={() => document.getElementById('tab-catalog')?.click()}>
                                        Adicionar itens do catálogo
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {listItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                                item.is_checked
                                                    ? "bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-900/50 dark:border-slate-800"
                                                    : "bg-white border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-800"
                                            )}
                                            onClick={() => toggleCheck(item)}
                                        >
                                            <div className="flex items-center gap-3 cursor-pointer select-none flex-1">
                                                <div className={cn(
                                                    "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                                                    item.is_checked
                                                        ? "bg-green-500 border-green-500 text-white"
                                                        : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-950"
                                                )}>
                                                    {item.is_checked && <Check className="h-3 w-3" />}
                                                </div>
                                                <span className={cn(
                                                    "font-medium transition-all",
                                                    item.is_checked && "line-through opacity-70"
                                                )}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                onClick={(e) => { e.stopPropagation(); toggleList(item); }}
                                            >
                                                <MinusCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="catalog" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cadastro de Itens</CardTitle>
                            <CardDescription>Cadastre todos os itens que sua família costuma comprar.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex gap-2">
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ex: Arroz 5kg, Detergente..."
                                    className="flex-1"
                                    required
                                />
                                <Button type="submit" disabled={processing}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Catálogo Completo</CardTitle>
                            <CardDescription>Ative os itens que deseja incluir na lista da vez.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-md border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                                        <span className="text-sm font-medium truncate pr-2">{item.name}</span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant={item.is_on_list ? "secondary" : "outline"}
                                                size="sm"
                                                className={cn(
                                                    "h-7 text-xs",
                                                    item.is_on_list && "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                                                )}
                                                onClick={() => toggleList(item)}
                                            >
                                                {item.is_on_list ? "Na Lista" : "Adicionar"}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-slate-400 hover:text-red-500"
                                                onClick={() => deleteItem(item.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
}
