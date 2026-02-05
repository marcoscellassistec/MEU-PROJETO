import { useState, useEffect, FormEvent } from 'react';
import { api } from '../lib/api';
import { Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number;
  annualDiscount: number;
  trialDays: number;
  features: string[];
  isActive: boolean;
  _count: { subscriptions: number };
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', monthlyPrice: '', annualPrice: '',
    annualDiscount: '20', trialDays: '7', features: '',
  });

  const fetchPlans = async () => {
    try {
      const data = await api.get<Plan[]>('/admin/plans');
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description || '',
      monthlyPrice: String(plan.monthlyPrice),
      annualPrice: String(plan.annualPrice),
      annualDiscount: String(plan.annualDiscount),
      trialDays: String(plan.trialDays),
      features: plan.features.join('\n'),
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', monthlyPrice: '', annualPrice: '', annualDiscount: '20', trialDays: '7', features: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      monthlyPrice: Number(form.monthlyPrice),
      annualPrice: Number(form.annualPrice),
      annualDiscount: Number(form.annualDiscount),
      trialDays: Number(form.trialDays),
      features: form.features.split('\n').filter(f => f.trim()),
    };

    if (editing) {
      await api.put(`/admin/plans/${editing.id}`, payload);
    } else {
      await api.post('/admin/plans', payload);
    }
    setShowForm(false);
    fetchPlans();
  };

  const togglePlan = async (plan: Plan) => {
    await api.put(`/admin/plans/${plan.id}`, { isActive: !plan.isActive });
    fetchPlans();
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Planos</h2>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Plano
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Editar Plano' : 'Novo Plano'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mensal (R$)</label>
              <input className="input" type="number" step="0.01" value={form.monthlyPrice} onChange={e => setForm({ ...form, monthlyPrice: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Anual (R$)</label>
              <input className="input" type="number" step="0.01" value={form.annualPrice} onChange={e => setForm({ ...form, annualPrice: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desconto Anual (%)</label>
              <input className="input" type="number" value={form.annualDiscount} onChange={e => setForm({ ...form, annualDiscount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dias de Trial</label>
              <input className="input" type="number" value={form.trialDays} onChange={e => setForm({ ...form, trialDays: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (uma por linha)</label>
              <textarea className="input" rows={4} value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {plans.map(plan => (
          <div key={plan.id} className={`card ${!plan.isActive ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(plan)} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => togglePlan(plan)} className="p-2 rounded-lg hover:bg-gray-50">
                  {plan.isActive ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} className="text-gray-400" />}
                </button>
              </div>
            </div>
            <div className="mt-4 flex gap-6">
              <div>
                <p className="text-sm text-gray-500">Mensal</p>
                <p className="text-2xl font-bold text-primary-600">R$ {plan.monthlyPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Anual ({plan.annualDiscount}% desc.)</p>
                <p className="text-2xl font-bold text-green-600">R$ {plan.annualPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trial</p>
                <p className="text-2xl font-bold text-orange-600">{plan.trialDays} dias</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assinantes</p>
                <p className="text-2xl font-bold text-gray-700">{plan._count.subscriptions}</p>
              </div>
            </div>
            {plan.features.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.features.map((f, i) => (
                  <span key={i} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs">{f}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
