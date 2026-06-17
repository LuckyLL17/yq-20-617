import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CaseList from './pages/cases/CaseList';
import CaseDetail from './pages/cases/CaseDetail';
import CaseCreate from './pages/cases/CaseCreate';
import ClientList from './pages/clients/ClientList';
import ClientDetail from './pages/clients/ClientDetail';
import UserList from './pages/users/UserList';
import LawyerList from './pages/lawyers/LawyerList';
import BillingList from './pages/billing/BillingList';
import PerformanceReport from './pages/performance/PerformanceReport';

function App() {
  const { isAuthenticated, user } = useAuth();
  const isClient = user?.role === 'CLIENT';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={isClient ? <Navigate to="/cases" replace /> : <Dashboard />} />
                <Route path="/cases" element={<CaseList />} />
                <Route path="/cases/create" element={isClient ? <Navigate to="/cases" replace /> : <CaseCreate />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/clients" element={isClient ? <Navigate to="/cases" replace /> : <ClientList />} />
                <Route path="/clients/:id" element={isClient ? <Navigate to="/cases" replace /> : <ClientDetail />} />
                <Route path="/lawyers" element={<LawyerList />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/billing" element={<BillingList />} />
                <Route path="/performance" element={<PerformanceReport />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
