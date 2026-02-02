import React, { useState } from "react";
import { Button } from "../components/ui/Button.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Dialog } from "../components/ui/Dialog.jsx";
import { Table } from "../components/ui/Table.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { vendasRepository } from "../services/repositories.js";
import { Badge } from "../components/ui/Badge.jsx";
import { useToast } from "../components/ui/Toast.jsx";

export const Vendas = () => {
  const [open, setOpen] = useState(false);
  const { push } = useToast();
  const { data, loading, error } = useAsyncData(vendasRepository.list, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Vendas de Produtos"
          subtitle="Controle de estoque e vendas rápidas"
          action={<Button onClick={() => setOpen(true)}>Nova venda</Button>}
        />
        {loading && <p className="text-sm text-slate-500">Carregando vendas...</p>}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </div>
        )}
        {!loading && !error && !data.length && (
          <p className="text-sm text-slate-500">Nenhuma venda registrada.</p>
        )}
        {!loading && !error && data.length > 0 && (
          <Table
            columns={["Venda", "Cliente", "Item", "Status", "Valor"]}
            rows={data.map((venda) => [
              venda.id,
              venda.cliente,
              venda.item,
              <Badge key={venda.id} label={venda.status} variant="success" />,
              `R$ ${venda.valor}`,
            ])}
          />
        )}
      </Card>

      <Dialog
        open={open}
        title="Registrar venda"
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (import.meta.env.DEV) {
                  console.info("[vendas] registrar venda");
                }
                push("Venda registrada com sucesso!", "success");
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
            "Cliente",
            "Produto",
            "Quantidade",
            "Forma de pagamento",
            "Valor",
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
