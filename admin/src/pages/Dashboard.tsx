import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Users, CreditCard, DollarSign, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  expiredUsers: number;
  totalRevenue: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>('/admin/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Carregando...</div>;
  if (!stats) return <div className="text-center py-20 text-red-500">Erro ao carregar dados</div>;

  const cards = [
    { label: 'Total Usuários', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Assinaturas Ativas', value: stats.activeSubscriptions, icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Receita Total', value: `R$ ${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Trials Ativos', value: stats.trialUsers, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const chartData = [
    { name: 'Ativos', value: stats.activeSubscriptions },
    { name: 'Trial', value: stats.trialUsers },
    { name: 'Expirados', value: stats.expiredUsers },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card flex items-center gap-4">
              <div className={`${card.bg} p-3 rounded-xl`}>
                <Icon size={24} className={card.color} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Status das Assinaturas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6C63FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Pagamentos Recentes</h3>
          <div className="space-y-3 max-h-[250px] overflow-auto">
            {stats.recentPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum pagamento ainda</p>
            ) : (
              stats.recentPayments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="font-medium text-sm">{payment.user.name}</p>
                    <p className="text-xs text-gray-500">{payment.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">R$ {payment.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{payment.method}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
