import { useState } from "react";
import { I } from "../components/icons.jsx";
import { makeApi } from "../api/client.js";
import { store, DEFAULT_API } from "../lib/storage.js";
import { useToast } from "../context/ToastContext.jsx";

export function Auth({ onAuth }) {
  const push = useToast();
  const [mode, setMode] = useState("login");
  const [api, setApi] = useState(store.get("clinic_api") || DEFAULT_API);
  const [f, setF] = useState({ username: "", password: "", role: "receptionist" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const client = makeApi(api, null, null);
    try {
      if (mode === "login") {
        const r = await client.login({ username: f.username, password: f.password });
        store.set("clinic_api", api);
        onAuth({ token: r.token, user: r.user, api });
      } else {
        await client.register({ username: f.username, password: f.password, role: f.role });
        push("Аккаунт создан — войдите", "ok");
        setMode("login");
        setF((s) => ({ ...s, password: "" }));
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-art">
        <div className="brand">
          <div className="mark">{I.pulse}</div>
          <div><b>Клиника</b><span>CRM система</span></div>
        </div>
        <h2>Управляйте приёмом, пациентами и врачами в одном месте</h2>
        <p>Рабочее пространство регистратуры: расписание визитов, картотека пациентов и команда врачей — без бумаги и таблиц.</p>
        <div className="auth-points">
          <div><span className="pico">{I.cal}</span> Расписание визитов и статусы в реальном времени</div>
          <div><span className="pico">{I.users}</span> Единая картотека пациентов</div>
          <div><span className="pico">{I.stetho}</span> Профили врачей и специализации</div>
        </div>
      </div>

      <div className="auth-form">
        <form className="auth-box" onSubmit={submit}>
          <h1>{mode === "login" ? "С возвращением" : "Создать аккаунт"}</h1>
          <p className="sub">{mode === "login" ? "Войдите, чтобы продолжить работу" : "Зарегистрируйте сотрудника клиники"}</p>

          {err && <div className="auth-err">{err}</div>}

          <div className="field">
            <label>Логин</label>
            <input className="input" value={f.username} onChange={set("username")} placeholder="например, registratura" autoFocus required />
          </div>
          <div className="field">
            <label>Пароль</label>
            <input className="input" type="password" value={f.password} onChange={set("password")} placeholder="••••••••" required />
          </div>
          {mode === "register" && (
            <div className="field">
              <label>Роль</label>
              <select className="input" value={f.role} onChange={set("role")}>
                <option value="receptionist">Регистратор</option>
                <option value="doctor">Врач</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "11px" }} disabled={busy}>
            {busy ? "Подождите…" : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>

          <div className="auth-switch">
            {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }}>
              {mode === "login" ? "Создать" : "Войти"}
            </button>
          </div>

          <details className="advanced">
            <summary>Настройки подключения к API</summary>
            <div className="field" style={{ marginTop: 12 }}>
              <label>Адрес backend</label>
              <input className="input" value={api} onChange={(e) => setApi(e.target.value)} placeholder="http://localhost:5000" />
            </div>
          </details>
        </form>
      </div>
    </div>
  );
}
