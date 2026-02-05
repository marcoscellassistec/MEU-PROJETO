import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Search, UserCheck, UserX } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  subscription: { status: string; plan: { name: string } } | null;
  _count: { transactions: number };
}

export default function Users() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      const data = await api.get<{ users: UserItem[]; totalPages: number }>(`/admin/users?${params}`);
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const toggleUser = async (id: string) => {
    await api.patch(`/admin/users/${id}/toggle`);
    fetchUsers();
  };

  const statusBadge = (status: string | undefined) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      TRIAL: 'bg-blue-100 text-blue-700',
      EXPIRED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-700',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      TRIAL: 'Trial',
      EXPIRED: 'Expirado',
      CANCELLED: 'Cancelado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status || ''] || 'bg-gray-100 text-gray-500'}`}>
        {labels[status || ''] || 'Sem plano'}
      </span>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Usuários</h2>

      <div className="card mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por nome ou email..."
              className="input pl-10"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary">Buscar</button>
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Assinatura</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Transações</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cadastro</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className={`${!user.isActive ? 'bg-red-50 opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    {statusBadge(user.subscription?.status)}
                    {user.subscription?.plan && (
                      <span className="text-xs text-gray-500 ml-2">{user.subscription.plan.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user._count.transactions}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleUser(user.id)}
                      className={`p-2 rounded-lg ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                      title={user.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
