import { createContext, useContext, useMemo, useState } from "react";

const AdminUsersSearchContext = createContext(null);

export function AdminUsersSearchProvider({ children }) {
  const [query, setQuery] = useState("");
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return <AdminUsersSearchContext.Provider value={value}>{children}</AdminUsersSearchContext.Provider>;
}

export function useAdminUsersSearch() {
  const ctx = useContext(AdminUsersSearchContext);
  if (!ctx) {
    throw new Error("useAdminUsersSearch must be used within AdminUsersSearchProvider");
  }
  return ctx;
}

export function useAdminUsersSearchOptional() {
  return useContext(AdminUsersSearchContext);
}
