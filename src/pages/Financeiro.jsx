import React, { useState } from "react";
import { Button } from "../components/ui/Button.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Dialog } from "../components/ui/Dialog.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Tabs } from "../components/ui/Tabs.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { financeiroRepository } from "../services/repositories.js";
import { useToast } from "../components/ui/Toast.jsx";

export const Financeiro = () => {
  const [open, setOpen] = useState(false);
  const { push } = useToast();
  const { data, loading, error } = useAsyncData(financeiroRepository.list, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Financeiro"
          subtitle="Entradas, saídas e saúde financeira"
          action={<Button onClick={() => setOpen(true)}>Novo lançamento</Button>}
        />
        <Tabs
          tabs={[
            { value: "dia", label: "Diário" },
            { value: "mes", label: "Mensal" },
            { value: "periodo", label: "Período" },
          ]}
        />
        <div className="mt-4">
          {loading && (
            <p className="text-sm text-slate-500">Carregando lançamentos...</p>
          )}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
              {error}
            </div>
          )}
          {!loading && !error && !data.length && (
            <p className="text-sm text-slate-500">Nenhum lançamento registrado.</p>
          )}
          {!loading && !error && data.length > 0 && (
            <Table
              columns={["Tipo", "Descrição", "Forma", "Valor"]}
              rows={data.map((item) => [
                item.tipo,
                item.descricao,
                item.forma,
                `R$ ${item.valor}`,
              ])}
            />
          )}
        </div>
      </Card>

      <Dialog
        open={open}
        title="Novo lançamento"
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (import.meta.env.DEV) {
                  console.info("[financeiro] novo lançamento");
                }
                push("Lançamento salvo!", "success");
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
            "Tipo",
            "Descrição",
            "Forma de pagamento",
            "Valor",
            "Data",
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
