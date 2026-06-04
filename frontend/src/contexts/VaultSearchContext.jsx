import { createContext, useContext, useMemo, useState } from "react";

const VaultSearchContext = createContext(null);

export function VaultSearchProvider({ children }) {
  const [query, setQuery] = useState("");
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return <VaultSearchContext.Provider value={value}>{children}</VaultSearchContext.Provider>;
}

export function useVaultSearch() {
  const ctx = useContext(VaultSearchContext);
  if (!ctx) {
    throw new Error("useVaultSearch must be used within VaultSearchProvider");
  }
  return ctx;
}

export function useVaultSearchOptional() {
  return useContext(VaultSearchContext);
}
