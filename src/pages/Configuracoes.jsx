import React from "react";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";

export const Configuracoes = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader
        title="Dados da empresa"
        subtitle="Informações exibidas nas OS e impressões"
        action={<Button>Salvar</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          "Nome da empresa",
          "CNPJ/CPF",
          "Endereço",
          "Telefone",
          "WhatsApp",
          "Logo (URL)",
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
    </Card>

    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader
          title="Garantias"
          subtitle="Texto padrão e regras personalizadas"
          action={<Badge label="Editável" />}
        />
        <textarea
          className="h-40 w-full rounded-xl border border-slate-200 p-3 text-sm"
          defaultValue="Garantia de 90 dias para serviços conforme CDC."
        />
        <div className="mt-4 flex justify-end">
          <Button variant="secondary">Atualizar texto</Button>
        </div>
      </Card>
      <Card>
        <CardHeader
          title="Funcionários"
          subtitle="Base preparada para permissões futuras"
          action={<Button variant="secondary">Adicionar</Button>}
        />
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
            Admin Master
            <Badge label="Admin" />
          </li>
          <li className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
            Técnico João
            <Badge label="Técnico" variant="neutral" />
          </li>
        </ul>
      </Card>
    </div>

    <Card>
      <CardHeader
        title="Impressão térmica 58mm"
        subtitle="Editor de margens, cabeçalho e rodapé"
        action={<Button variant="secondary">Pré-visualizar</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-500">
          Cabeçalho
          <textarea className="mt-1 h-24 w-full rounded-xl border border-slate-200 p-3 text-sm" />
        </label>
        <label className="text-sm text-slate-500">
          Corpo
          <textarea className="mt-1 h-24 w-full rounded-xl border border-slate-200 p-3 text-sm" />
        </label>
        <label className="text-sm text-slate-500">
          Rodapé
          <textarea className="mt-1 h-24 w-full rounded-xl border border-slate-200 p-3 text-sm" />
        </label>
        <label className="text-sm text-slate-500">
          Margens / Espaçamento
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Ex: 5mm / 3mm"
          />
        </label>
      </div>
    </Card>
  </div>
);
