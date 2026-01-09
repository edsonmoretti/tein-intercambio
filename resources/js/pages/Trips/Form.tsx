import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormEventHandler } from 'react';
import axios from 'axios';

export default function Form({ trip }: { trip?: any }) {
    const isEditing = !!trip;

    const { data, setData, post, put, processing, errors } = useForm({
        country: trip?.country || '',
        city: trip?.city || '',
        place: trip?.place || '',
        start_date: trip?.start_date || '',
        end_date: trip?.end_date || '',
        type: trip?.type || 'study',
        status: trip?.status || 'planning',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing) {
            axios.put(`/trips/${trip.id}`, data).then(response => {
                const tripId = response.data.trip_id;
                router.visit(`/trips/${tripId}`);
            });
        } else {
            axios.post('/trips', data).then(response => {
                const tripId = response.data.trip_id;
                router.visit(`/trips/${tripId}`);
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEditing ? 'Editar Viagem' : 'Nova Viagem'} />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/trips" className="hover:text-slate-900">Viagens</Link>
                    <span>/</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                        {isEditing ? 'Editar' : 'Nova'}
                    </span>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Editar Viagem' : 'Planejar Nova Viagem'}</CardTitle>
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
                                        placeholder="Ex: Irlanda"
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
                                        placeholder="Ex: Dublin"
                                        required
                                    />
                                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="place">Local (Opcional)</Label>
                                <Input
                                    id="place"
                                    value={data.place}
                                    onChange={(e) => setData('place', e.target.value)}
                                    placeholder="Ex: ILAC School, Hotel California"
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
                                        className="dark:[color-scheme:dark]"
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
                                        className="dark:[color-scheme:dark]"
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
                                            <SelectItem value="tourism">Turismo/Passeio</SelectItem>
                                            <SelectItem value="study">Estudo</SelectItem>
                                            <SelectItem value="work">Trabalho</SelectItem>
                                            <SelectItem value="work_study">Trabalho & Estudo</SelectItem>
                                            <SelectItem value="business">Negócios</SelectItem>
                                            <SelectItem value="volunteer">Voluntariado</SelectItem>
                                            <SelectItem value="cultural_exchange">Intercâmbio Cultural</SelectItem>
                                            <SelectItem value="adventure">Aventura</SelectItem>
                                            <SelectItem value="family_visit">Visita Familiar</SelectItem>
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
                                <Link href="/trips">
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
