import React from "react";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";

export const Dashboard = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader
        title="Resumo operacional"
        subtitle="Indicadores-chave da assistência técnica"
      />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "OS em andamento", value: 12 },
          { label: "Clientes ativos", value: 184 },
          { label: "Receita mensal", value: "R$ 32.540" },
          { label: "Caixa do dia", value: "R$ 1.820" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="text-xl font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </Card>

    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader title="OS recentes" action={<Badge label="Hoje" />} />
        <div className="space-y-3">
          {[
            "OS #1024 - Troca de tela",
            "OS #1025 - Reparo de placa",
            "OS #1026 - Limpeza geral",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm"
            >
              <span className="text-slate-700">{item}</span>
              <Badge label="Em andamento" variant="warning" />
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="Alertas" subtitle="Pendências importantes" />
        <ul className="space-y-3 text-sm text-slate-600">
          <li>3 OS aguardando peças.</li>
          <li>2 clientes aguardando retorno.</li>
          <li>Fechar caixa até 19h.</li>
        </ul>
      </Card>
    </div>
  </div>
);
