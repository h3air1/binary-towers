import { useState } from "react";
import { store, DEFAULT_API } from "./lib/storage.js";
import { Auth } from "./pages/Auth.jsx";
import { Workspace } from "./layout/Workspace.jsx";

export function App() {
  // Восстанавливаем сессию из хранилища при старте.
  const [session, setSession] = useState(() => {
    const t = store.get("clinic_token");
    if (!t) return null;
    try {
      return {
        token: t,
        user: JSON.parse(store.get("clinic_user") || "{}"),
        api: store.get("clinic_api") || DEFAULT_API,
      };
    } catch {
      return null;
    }
  });

  const handleAuth = (s) => {
    store.set("clinic_token", s.token);
    store.set("clinic_user", JSON.stringify(s.user));
    store.set("clinic_api", s.api);
    setSession(s);
  };

  const handleLogout = () => {
    store.del("clinic_token");
    store.del("clinic_user");
    setSession(null);
  };

  if (!session) return <Auth onAuth={handleAuth} />;
  return <Workspace session={session} onLogout={handleLogout} />;
}
