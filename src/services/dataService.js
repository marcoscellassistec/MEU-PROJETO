const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fakeDatabase = {
  clientes: [
    {
      id: "cli-1",
      nome: "Ana Martins",
      telefone: "(11) 98877-2233",
      documento: "123.456.789-00",
      status: "Ativo",
    },
  ],
  os: [
    {
      id: "os-1024",
      cliente: "Ana Martins",
      aparelho: "Notebook",
      status: "Em andamento",
      valor: 420,
    },
  ],
  vendas: [
    {
      id: "vd-77",
      cliente: "Balcão",
      item: "Película 3D",
      valor: 45,
      status: "Pago",
    },
  ],
  financeiro: [
    {
      id: "fin-1",
      tipo: "Entrada",
      descricao: "OS #1024",
      valor: 420,
      forma: "PIX",
    },
  ],
  caixa: [
    {
      id: "cx-1",
      turno: "Manhã",
      abertura: "09:00",
      saldo: 520,
      status: "Aberto",
    },
  ],
};

export const listData = async (collection) => {
  await delay(500);
  return fakeDatabase[collection] ?? [];
};
