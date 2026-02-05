import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Plans from './pages/Plans';
import Payments from './pages/Payments';
import Config from './pages/Config';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/config" element={<Config />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
