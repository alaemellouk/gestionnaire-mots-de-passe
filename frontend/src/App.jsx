import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AppShellProvider } from "./contexts/AppShellContext";

const Login = lazy(() => import("./components/login"));
const Register = lazy(() => import("./components/register"));
const RegisterVerify = lazy(() => import("./components/RegisterVerify"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const Layout = lazy(() => import("./components/Layout"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const PasswordsPage = lazy(() => import("./pages/PasswordsPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminProtectedRoute = lazy(() => import("./components/admin/AdminProtectedRoute"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UsersManagement = lazy(() => import("./pages/admin/UsersManagement"));
const SecurityPolicy = lazy(() => import("./pages/admin/SecurityPolicy"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function PageLoader() {
  return (
    <div className="app-page-loader" role="status" aria-live="polite">
      <span className="app-page-loader__spinner" aria-hidden />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppShellProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/verify" element={<RegisterVerify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/passwords" element={<PasswordsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UsersManagement />} />
                <Route path="/admin/security" element={<SecurityPolicy />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
              </Route>
            </Routes>
          </Suspense>
        </AppShellProvider>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
