import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Hero } from './components/Hero';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Generator } from './pages/Generator';
import { Dashboard } from './pages/Dashboard';
import { JobDetails } from './pages/JobDetails';
import { OrganizationSetup } from './pages/OrganizationSetup';
import { Organization } from './pages/Organization';
import { AppLayout } from './components/AppLayout';
import { Toaster } from 'sonner';

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/organization-setup" element={<OrganizationSetup />} />
            <Route element={<AppLayout />}>
              <Route path="/generator" element={<Generator />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:jobId" element={<JobDetails />} />
              <Route path="/organization" element={<Organization />} />
            </Route>
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
