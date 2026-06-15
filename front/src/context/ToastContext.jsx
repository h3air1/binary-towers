import { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(() => {});

// Хук для вызова уведомлений из любого компонента: const push = useToast();
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);

  const push = useCallback((msg, type = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setList((l) => [...l, { id, msg, type }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3600);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts">
        {list.map((t) => (
          <div key={t.id} className={"toast " + t.type}>
            <span className="tdot" />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
