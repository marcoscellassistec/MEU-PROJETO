import React, { useState } from "react";
import { Button } from "../components/ui/Button.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Dialog } from "../components/ui/Dialog.jsx";
import { Table } from "../components/ui/Table.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { caixaRepository } from "../services/repositories.js";
import { Badge } from "../components/ui/Badge.jsx";
import { useToast } from "../components/ui/Toast.jsx";

export const Caixa = () => {
  const [open, setOpen] = useState(false);
  const { push } = useToast();
  const { data, loading, error } = useAsyncData(caixaRepository.list, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Caixa"
          subtitle="Abertura, fechamento e movimentação diária"
          action={<Button onClick={() => setOpen(true)}>Abrir caixa</Button>}
        />
        {loading && <p className="text-sm text-slate-500">Carregando caixa...</p>}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </div>
        )}
        {!loading && !error && !data.length && (
          <p className="text-sm text-slate-500">Nenhum caixa aberto.</p>
        )}
        {!loading && !error && data.length > 0 && (
          <Table
            columns={["Turno", "Abertura", "Saldo", "Status"]}
            rows={data.map((item) => [
              item.turno,
              item.abertura,
              `R$ ${item.saldo}`,
              <Badge key={item.id} label={item.status} variant="success" />,
            ])}
          />
        )}
      </Card>

      <Dialog
        open={open}
        title="Abertura de caixa"
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (import.meta.env.DEV) {
                  console.info("[caixa] abrir caixa");
                }
                push("Caixa aberto com sucesso!", "success");
                setOpen(false);
              }}
            >
              Abrir
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Turno",
            "Saldo inicial",
            "Responsável",
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
