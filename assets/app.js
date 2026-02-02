const sections = document.querySelectorAll(".section");
const menuItems = document.querySelectorAll(".menu-item");
const sectionTitle = document.getElementById("section-title");
const sectionSubtitle = document.getElementById("section-subtitle");
const loginModal = document.getElementById("login-modal");
const quickActions = document.getElementById("quick-actions");

const subtitles = {
  dashboard: "Visão geral da operação em tempo real.",
  clientes: "Centralize os dados e histórico do cliente.",
  os: "Controle total do fluxo de OS, do recebimento à entrega.",
  garantias: "Padronize e personalize suas garantias.",
  produtos: "Cadastro, estoque e vendas em um só lugar.",
  financeiro: "Entrada e saída com visão clara da saúde financeira.",
  funcionarios: "Equipe alinhada com histórico de serviços.",
  impressoes: "Personalize impressões para térmicas 58mm.",
  configuracoes: "Dados da empresa e preparação para SaaS.",
};

const storageKeys = {
  clientes: "assistec_clientes",
  os: "assistec_os",
  produtos: "assistec_produtos",
  financeiro: "assistec_financeiro",
  funcionarios: "assistec_funcionarios",
  garantia: "assistec_garantia",
  impressao: "assistec_impressao",
  empresa: "assistec_empresa",
};

const state = {
  clientes: JSON.parse(localStorage.getItem(storageKeys.clientes) || "[]"),
  os: JSON.parse(localStorage.getItem(storageKeys.os) || "[]"),
  produtos: JSON.parse(localStorage.getItem(storageKeys.produtos) || "[]"),
  financeiro: JSON.parse(localStorage.getItem(storageKeys.financeiro) || "[]"),
  funcionarios: JSON.parse(localStorage.getItem(storageKeys.funcionarios) || "[]"),
  garantia: JSON.parse(localStorage.getItem(storageKeys.garantia) || "{}"),
  impressao: JSON.parse(localStorage.getItem(storageKeys.impressao) || "{}"),
  empresa: JSON.parse(localStorage.getItem(storageKeys.empresa) || "{}"),
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);

const persist = (key, value) => {
  localStorage.setItem(storageKeys[key], JSON.stringify(value));
};

const renderTable = (elementId, items, formatter) => {
  const container = document.getElementById(elementId);
  container.innerHTML = "";

  if (!items.length) {
    container.innerHTML = "<p>Nenhum registro encontrado.</p>";
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "table-item";
    row.innerHTML = formatter(item);
    container.appendChild(row);
  });
};

const renderDashboard = () => {
  document.getElementById("stat-os").textContent = state.os.filter(
    (item) => item.status === "Em andamento"
  ).length;
  document.getElementById("stat-clientes").textContent = state.clientes.length;

  const receita = state.financeiro
    .filter((item) => item.tipo === "Entrada")
    .reduce((total, item) => total + Number(item.valor || 0), 0);
  document.getElementById("stat-receita").textContent = formatCurrency(receita);

  const caixa = receita -
    state.financeiro
      .filter((item) => item.tipo === "Saída")
      .reduce((total, item) => total + Number(item.valor || 0), 0);
  document.getElementById("stat-caixa").textContent = formatCurrency(caixa);

  const agenda = document.getElementById("dashboard-agenda");
  agenda.innerHTML = "";
  const hoje = new Date().toISOString().slice(0, 10);
  const osHoje = state.os.filter((item) => item.previsao === hoje);
  if (!osHoje.length) {
    agenda.innerHTML = "<li>Nenhuma OS prevista para hoje.</li>";
  } else {
    osHoje.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.cliente} - ${item.aparelho} (${item.status})`;
      agenda.appendChild(li);
    });
  }
};

const setActiveSection = (sectionId) => {
  sections.forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });
  menuItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.section === sectionId);
  });
  sectionTitle.textContent =
    sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  sectionSubtitle.textContent = subtitles[sectionId];
};

menuItems.forEach((item) => {
  item.addEventListener("click", () => setActiveSection(item.dataset.section));
});

const setupForm = (formId, key, onSubmit) => {
  const form = document.getElementById(formId);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    onSubmit(data, form);
  });
};

setupForm("cliente-form", "clientes", (data, form) => {
  state.clientes.unshift({ id: crypto.randomUUID(), ...data });
  persist("clientes", state.clientes);
  form.reset();
  renderAll();
});

setupForm("os-form", "os", (data, form) => {
  state.os.unshift({
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
    ...data,
  });
  persist("os", state.os);
  form.reset();
  renderAll();
});

setupForm("garantia-form", "garantia", (data) => {
  state.garantia = { ...data, atualizadoEm: new Date().toISOString() };
  persist("garantia", state.garantia);
  renderGarantia();
});

setupForm("produto-form", "produtos", (data, form) => {
  state.produtos.unshift({ id: crypto.randomUUID(), ...data });
  persist("produtos", state.produtos);
  form.reset();
  renderAll();
});

setupForm("financeiro-form", "financeiro", (data, form) => {
  state.financeiro.unshift({ id: crypto.randomUUID(), ...data });
  persist("financeiro", state.financeiro);
  form.reset();
  renderAll();
});

setupForm("funcionario-form", "funcionarios", (data, form) => {
  state.funcionarios.unshift({ id: crypto.randomUUID(), ...data });
  persist("funcionarios", state.funcionarios);
  form.reset();
  renderAll();
});

setupForm("impressao-form", "impressao", (data) => {
  state.impressao = { ...data, atualizadoEm: new Date().toISOString() };
  persist("impressao", state.impressao);
  renderImpressao();
});

setupForm("empresa-form", "empresa", (data, form) => {
  state.empresa = { ...data, atualizadoEm: new Date().toISOString() };
  persist("empresa", state.empresa);
  form.reset();
});

const renderGarantia = () => {
  const preview = document.getElementById("garantia-preview");
  if (!state.garantia.texto) {
    preview.textContent = "Defina um texto de garantia para visualizar.";
    return;
  }
  preview.innerHTML = `
    <strong>${state.garantia.titulo || "Garantia"}</strong>
    <p>${state.garantia.texto}</p>
    <small>Opções: ${state.garantia.opcoes || "Padrão"}</small>
  `;
};

const renderImpressao = () => {
  const preview = document.getElementById("print-preview");
  if (!state.impressao.cabecalho) {
    preview.textContent = "Configure o modelo para visualizar.";
    return;
  }
  preview.innerHTML = `
    <pre>
${state.impressao.cabecalho}

${state.impressao.corpo}

${state.impressao.rodape}
    </pre>
  `;
};

const renderAll = () => {
  renderTable("clientes-table", state.clientes, (item) => `
    <div>
      <strong>${item.nome}</strong>
      <small>${item.telefone || "Sem telefone"}</small>
    </div>
    <div>
      <small>${item.documento || "Documento não informado"}</small>
    </div>
  `);

  renderTable("os-table", state.os, (item) => `
    <div>
      <strong>${item.cliente}</strong>
      <small>${item.aparelho} - ${item.modelo || "Modelo não informado"}</small>
    </div>
    <div>
      <small>Status: ${item.status}</small>
      <small>Valor: ${formatCurrency(item.valor)}</small>
    </div>
  `);

  renderTable("produtos-table", state.produtos, (item) => `
    <div>
      <strong>${item.nome}</strong>
      <small>${item.categoria || "Sem categoria"}</small>
    </div>
    <div>
      <small>Estoque: ${item.estoque || 0}</small>
      <small>${formatCurrency(item.preco)}</small>
    </div>
  `);

  renderTable("financeiro-table", state.financeiro, (item) => `
    <div>
      <strong>${item.descricao || "Movimentação"}</strong>
      <small>${item.forma || ""}</small>
    </div>
    <div>
      <small>${item.tipo}</small>
      <small>${formatCurrency(item.valor)}</small>
    </div>
  `);

  renderTable("funcionarios-table", state.funcionarios, (item) => `
    <div>
      <strong>${item.nome}</strong>
      <small>${item.funcao || "Função não definida"}</small>
    </div>
    <div>
      <small>${item.email || "Sem e-mail"}</small>
    </div>
  `);

  renderGarantia();
  renderImpressao();
  renderDashboard();
};

const showLoginIfNeeded = () => {
  const logged = localStorage.getItem("assistec_logged");
  if (!logged) {
    loginModal.classList.add("active");
  }
};

const login = () => {
  localStorage.setItem("assistec_logged", "true");
  loginModal.classList.remove("active");
};

const logout = () => {
  localStorage.removeItem("assistec_logged");
  loginModal.classList.add("active");
};

const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
  });
});

document.getElementById("login-email-btn").addEventListener("click", login);
document.getElementById("login-google-btn").addEventListener("click", login);
document.getElementById("logout").addEventListener("click", logout);

document
  .getElementById("open-quick-actions")
  .addEventListener("click", () => quickActions.classList.add("active"));
document
  .getElementById("close-quick-actions")
  .addEventListener("click", () => quickActions.classList.remove("active"));

document
  .getElementById("new-item")
  .addEventListener("click", () => setActiveSection("os"));

document
  .getElementById("open-firebase-docs")
  .addEventListener("click", () =>
    window.open("docs/firebase.md", "_blank")
  );

renderAll();
showLoginIfNeeded();
