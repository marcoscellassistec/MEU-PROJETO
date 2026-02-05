import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface PaymentItem {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
}

export default function Payments() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const data = await api.get<{ payments: PaymentItem[]; totalPages: number }>(`/admin/payments?${params}`);
      setPayments(data.payments);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [page, statusFilter]);

  const approvePayment = async (id: string) => {
    if (!confirm('Confirmar aprovação manual do pagamento?')) return;
    await api.patch(`/admin/payments/${id}/approve`);
    fetchPayments();
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} className="text-green-600" />;
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      default: return <XCircle size={16} className="text-red-600" />;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pagamentos</h2>

      <div className="card mb-6">
        <div className="flex gap-3">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input w-48">
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Usuário</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm">{payment.user.name}</p>
                    <p className="text-xs text-gray-500">{payment.user.email}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold">R$ {payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {payment.method === 'PIX' ? 'Pix' : 'Mercado Pago'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {statusIcon(payment.status)}
                      <span className="text-sm capitalize">{payment.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.status === 'pending' && (
                      <button onClick={() => approvePayment(payment.id)} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm font-medium">
                        Aprovar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
