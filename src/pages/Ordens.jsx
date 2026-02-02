import React, { useState } from "react";
import { Button } from "../components/ui/Button.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Dialog } from "../components/ui/Dialog.jsx";
import { Table } from "../components/ui/Table.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { osRepository } from "../services/repositories.js";
import { Badge } from "../components/ui/Badge.jsx";
import { useToast } from "../components/ui/Toast.jsx";

export const Ordens = () => {
  const [open, setOpen] = useState(false);
  const { push } = useToast();
  const { data, loading, error } = useAsyncData(osRepository.list, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Ordens de Serviço"
          subtitle="Controle do ciclo completo de atendimento"
          action={<Button onClick={() => setOpen(true)}>Nova OS</Button>}
        />
        {loading && <p className="text-sm text-slate-500">Carregando OS...</p>}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </div>
        )}
        {!loading && !error && !data.length && (
          <p className="text-sm text-slate-500">Nenhuma OS encontrada.</p>
        )}
        {!loading && !error && data.length > 0 && (
          <Table
            columns={["OS", "Cliente", "Aparelho", "Status", "Valor"]}
            rows={data.map((os) => [
              os.id,
              os.cliente,
              os.aparelho,
              <Badge key={os.id} label={os.status} variant="warning" />,
              `R$ ${os.valor}`,
            ])}
          />
        )}
      </Card>

      <Dialog
        open={open}
        title="Nova ordem de serviço"
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (import.meta.env.DEV) {
                  console.info("[os] salvar nova os");
                }
                push("OS criada com sucesso!", "success");
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
            "Aparelho",
            "Marca/Modelo",
            "Defeito informado",
            "Serviço executado",
            "Técnico responsável",
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
