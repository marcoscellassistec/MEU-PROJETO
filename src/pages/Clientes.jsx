import React, { useState } from "react";
import { Button } from "../components/ui/Button.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Dialog } from "../components/ui/Dialog.jsx";
import { Table } from "../components/ui/Table.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { clientesRepository } from "../services/repositories.js";
import { useToast } from "../components/ui/Toast.jsx";

export const Clientes = () => {
  const [open, setOpen] = useState(false);
  const { push } = useToast();
  const { data, loading, error } = useAsyncData(clientesRepository.list, []);

  const handleNew = () => {
    if (import.meta.env.DEV) {
      console.info("[clientes] abrir modal novo cliente");
    }
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Clientes"
          subtitle="Base de clientes com histórico de atendimento"
          action={<Button onClick={handleNew}>Novo cliente</Button>}
        />
        {loading && <p className="text-sm text-slate-500">Carregando clientes...</p>}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </div>
        )}
        {!loading && !error && !data.length && (
          <p className="text-sm text-slate-500">Nenhum cliente cadastrado ainda.</p>
        )}
        {!loading && !error && data.length > 0 && (
          <Table
            columns={["Nome", "Telefone", "Documento", "Status"]}
            rows={data.map((cliente) => [
              cliente.nome,
              cliente.telefone,
              cliente.documento,
              cliente.status,
            ])}
          />
        )}
      </Card>

      <Dialog
        open={open}
        title="Cadastrar cliente"
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                push("Cliente salvo com sucesso!", "success");
                setOpen(false);
              }}
            >
              Salvar
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Nome",
            "Telefone",
            "WhatsApp",
            "CPF/CNPJ",
            "Endereço",
            "Observações",
          ].map((label) => (
            <label key={label} className="text-sm text-slate-500">
              {label}
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
          ))}
        </div>
      </Dialog>
    </div>
  );
};
