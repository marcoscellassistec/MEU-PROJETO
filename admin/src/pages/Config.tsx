import { useState, useEffect, FormEvent } from 'react';
import { api } from '../lib/api';
import { Save, RefreshCw } from 'lucide-react';

export default function Config() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get<Record<string, unknown>>('/admin/config')
      .then(data => {
        const flat: Record<string, string> = {};
        for (const [key, value] of Object.entries(data)) {
          flat[key] = typeof value === 'string' ? value : JSON.stringify(value);
        }
        setConfig(flat);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      for (const [key, value] of Object.entries(config)) {
        let jsonValue: unknown;
        try {
          jsonValue = JSON.parse(value);
        } catch {
          jsonValue = value;
        }
        await api.put(`/admin/config/${key}`, { value: jsonValue });
      }
      setMessage('Configurações salvas!');
    } catch (err) {
      setMessage('Erro ao salvar');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Carregando...</div>;

  const configFields = [
    { key: 'app_name', label: 'Nome do App', type: 'text' },
    { key: 'support_email', label: 'Email de Suporte', type: 'email' },
    { key: 'pix_key', label: 'Chave Pix', type: 'text' },
    { key: 'pix_receiver_name', label: 'Nome do Recebedor Pix', type: 'text' },
    { key: 'pix_city', label: 'Cidade Pix', type: 'text' },
    { key: 'pix_enabled', label: 'Pix Habilitado', type: 'toggle' },
    { key: 'mercadopago_enabled', label: 'Mercado Pago Habilitado', type: 'toggle' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h2>

      <form onSubmit={handleSave}>
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Configurações Gerais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configFields.filter(f => f.type !== 'toggle').map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  className="input"
                  value={config[field.key]?.replace(/"/g, '') || ''}
                  onChange={e => setConfig({ ...config, [field.key]: JSON.stringify(e.target.value) })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Métodos de Pagamento</h3>
          <div className="space-y-4">
            {configFields.filter(f => f.type === 'toggle').map(field => (
              <div key={field.key} className="flex items-center justify-between py-2">
                <span className="font-medium text-gray-700">{field.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    const current = config[field.key] === 'true' || config[field.key] === '"true"';
                    setConfig({ ...config, [field.key]: String(!current) });
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config[field.key] === 'true' || config[field.key] === '"true"' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    config[field.key] === 'true' || config[field.key] === '"true"' ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            message.includes('Erro') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
