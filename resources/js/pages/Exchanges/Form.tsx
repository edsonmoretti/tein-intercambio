import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormEventHandler } from 'react';

export default function Form({ exchange }: { exchange?: any }) {
    const isEditing = !!exchange;

    const { data, setData, post, put, processing, errors } = useForm({
        country: exchange?.country || '',
        city: exchange?.city || '',
        institution: exchange?.institution || '',
        start_date: exchange?.start_date || '',
        end_date: exchange?.end_date || '',
        type: exchange?.type || 'study',
        status: exchange?.status || 'planning',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(`/exchanges/${exchange.id}`);
        } else {
            post('/exchanges');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEditing ? 'Editar Intercâmbio' : 'Novo Intercâmbio'} />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/exchanges" className="hover:text-slate-900">Intercâmbios</Link>
                    <span>/</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                        {isEditing ? 'Editar' : 'Novo'}
                    </span>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Editar Intercâmbio' : 'Planejar Novo Intercâmbio'}</CardTitle>
                        <CardDescription>
                            Preencha os detalhes do seu próximo destino.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="country">País</Label>
                                    <Input
                                        id="country"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        placeholder="Ex: Canadá"
                                        required
                                    />
                                    {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Ex: Vancouver"
                                        required
                                    />
                                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="institution">Instituição (Opcional)</Label>
                                <Input
                                    id="institution"
                                    value={data.institution}
                                    onChange={(e) => setData('institution', e.target.value)}
                                    placeholder="Ex: ILAC School"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Data Início</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                    />
                                    {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Data Fim</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                    {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="study">Estudo</SelectItem>
                                            <SelectItem value="language">Idioma</SelectItem>
                                            <SelectItem value="high_school">High School</SelectItem>
                                            <SelectItem value="work_study">Work & Study</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                                </div>

                                {isEditing && (
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status atual" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="planning">Planejamento</SelectItem>
                                                <SelectItem value="documents">Documentação</SelectItem>
                                                <SelectItem value="confirmed">Confirmado</SelectItem>
                                                <SelectItem value="in_progress">Em Andamento</SelectItem>
                                                <SelectItem value="completed">Concluído</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Link href="/exchanges">
                                    <Button type="button" variant="outline">Cancelar</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {isEditing ? 'Salvar Alterações' : 'Criar Planejamento'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
