import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Loading from '../components/Loading';

const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const ConfiguracoesPage = lazy(() => import('../pages/Configuracoes'));
const HomePage = lazy(() => import('../pages/Home/HomePage'));
const EmpresaPage = lazy(() => import('../pages/Empresa'));
const FaturamentoPage = lazy(() => import('../pages/Faturamento'));

function PrivateRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default function AppRoutes() {
  const { loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Rota pública sem layout */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas privadas com layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/cadastro/empresa" element={<EmpresaPage />} />
              <Route path="/faturamento" element={<FaturamentoPage />} />
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            </Route>
          </Route>

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}