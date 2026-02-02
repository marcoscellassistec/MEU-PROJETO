import { listData } from "./dataService.js";

export const clientesRepository = {
  list: () => listData("clientes"),
};

export const osRepository = {
  list: () => listData("os"),
};

export const vendasRepository = {
  list: () => listData("vendas"),
};

export const financeiroRepository = {
  list: () => listData("financeiro"),
};

export const caixaRepository = {
  list: () => listData("caixa"),
};
