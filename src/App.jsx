import React from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import { ToastProvider, useToast } from "./components/ui/Toast.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import { PageLayout } from "./components/layout/PageLayout.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Clientes } from "./pages/Clientes.jsx";
import { Ordens } from "./pages/Ordens.jsx";
import { Vendas } from "./pages/Vendas.jsx";
import { Financeiro } from "./pages/Financeiro.jsx";
import { Caixa } from "./pages/Caixa.jsx";
import { Configuracoes } from "./pages/Configuracoes.jsx";
import { Login } from "./pages/Login.jsx";
import { NotFound } from "./pages/NotFound.jsx";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

const ShellRoute = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  const { push } = useToast();

  const handleSearch = (value) => {
    if (import.meta.env.DEV) {
      console.info("[search]", value);
    }
    if (value === "nova-os") {
      push("Abrindo criação de OS...", "info");
      navigate("/os");
    }
    if (value === "nova-venda") {
      push("Abrindo criação de venda...", "info");
      navigate("/vendas");
    }
  };

  return (
    <AppShell>
      <PageLayout title={title} subtitle={subtitle} onSearch={handleSearch}>
        {children}
      </PageLayout>
    </AppShell>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <ShellRoute
            title="Dashboard"
            subtitle="Visão geral da operação em tempo real."
          >
            <Dashboard />
          </ShellRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/clientes"
      element={
        <ProtectedRoute>
          <ShellRoute
            title="Clientes"
            subtitle="Gerencie históricos, contatos e oportunidades."
          >
            <Clientes />
          </ShellRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/os"
      element={
        <ProtectedRoute>
          <ShellRoute
            title="Ordens de Serviço"
            subtitle="Controle total do fluxo de OS."
          >
            <Ordens />
          </ShellRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/vendas"
      element={
        <ProtectedRoute>
          <ShellRoute
            title="Vendas"
            subtitle="Balcão e estoque conectados ao caixa."
          >
            <Vendas />
          </ShellRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/financeiro"
      element={
        <ProtectedRoute>
          <ShellRoute
            title="Financeiro"
            subtitle="Fluxo de caixa e relatórios estratégicos."
          >
            <Financeiro />
          </ShellRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/caixa"
      element={
        <ProtectedRoute>
          <ShellRoute
            title="Caixa"
            subtitle="Abertura e fechamento diário sem falhas."
          >
            <Caixa />
          </ShellRoute>
        </ProtectedRoute>
      }
    />
    <Route
      path="/configuracoes"
      element={
        <ProtectedRoute>
          <ShellRoute
            title="Configurações"
            subtitle="Personalização completa da sua assistência."
          >
            <Configuracoes />
          </ShellRoute>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  </AuthProvider>
);

export default App;
