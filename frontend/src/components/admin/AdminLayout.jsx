import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Header from "../Header";
import IdleSessionGuard from "../IdleSessionGuard";
import { AdminUsersSearchProvider } from "../../contexts/AdminUsersSearchContext";

export default function AdminLayout() {
  return (
    <div className="app-layout app-layout--admin">
      <AdminSidebar />
      <div className="main-wrapper">
        <AdminUsersSearchProvider>
          <Header isAdmin={true} />
          <main className="main-content">
            <Outlet />
          </main>
        </AdminUsersSearchProvider>
      </div>
      <IdleSessionGuard />
    </div>
  );
}
