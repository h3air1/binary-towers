import { useState, useEffect, useCallback, useRef } from "react";
import { I } from "../components/icons.jsx";
import { makeApi } from "../api/client.js";
import { ROLE_RU } from "../lib/format.js";
import { useToast } from "../context/ToastContext.jsx";
import { Dashboard } from "../pages/Dashboard.jsx";
import { Appointments } from "../pages/Appointments.jsx";
import { Patients } from "../pages/Patients.jsx";
import { Doctors } from "../pages/Doctors.jsx";

export function Workspace({ session, onLogout }) {
  const push = useToast();
  const [page, setPage] = useState("dashboard");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOk, setApiOk] = useState(null);

  // API-клиент создаётся один раз на сессию.
  const api = useRef(
    makeApi(session.api, session.token, () => {
      push("Сессия истекла — войдите снова", "err");
      onLogout();
    })
  ).current;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [d, p, a] = await Promise.all([api.doctors(), api.patients(), api.appointments()]);
      setDoctors(d || []);
      setPatients(p || []);
      setAppts(a || []);
      setApiOk(true);
    } catch (e) {
      setApiOk(false);
      push(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    api.health().then(() => setApiOk(true)).catch(() => setApiOk(false));
  }, []);

  const nav = [
    ["dashboard", "Дашборд", I.grid],
    ["appointments", "Визиты", I.cal],
    ["patients", "Пациенты", I.users],
    ["doctors", "Врачи", I.stetho],
  ];
  const titles = {
    dashboard: ["Дашборд", "Сводка по работе клиники"],
    appointments: ["Визиты", "Расписание приёма пациентов"],
    patients: ["Пациенты", "Картотека пациентов клиники"],
    doctors: ["Врачи", "Команда специалистов"],
  };

  const u = session.user || {};
  const roleRu = ROLE_RU[u.role] || u.role;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="mark">{I.pulse}</div>
          <div><b>Клиника</b><span>CRM</span></div>
        </div>
        <div className="nav-label">Разделы</div>
        {nav.map(([k, l, ic]) => (
          <button key={k} className={"navitem" + (page === k ? " active" : "")} onClick={() => setPage(k)}>{ic}{l}</button>
        ))}
        <div className="side-foot">
          <div className="side-user">
            <span className="avatar">{(u.username || "U").slice(0, 2).toUpperCase()}</span>
            <div style={{ minWidth: 0 }}>
              <b style={{ color: "#fff", fontSize: 13, display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{u.username}</b>
              <small>{roleRu}</small>
            </div>
          </div>
          <button className="navitem" style={{ marginTop: 6 }} onClick={onLogout}>{I.logout}Выйти</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div style={{ flex: 1 }}>
            <h1>{titles[page][0]}</h1>
            <p>{titles[page][1]}</p>
          </div>
          <div className={"apistat " + (apiOk === true ? "ok" : apiOk === false ? "bad" : "")}>
            <span className="dot" />
            {apiOk === true ? "API на связи" : apiOk === false ? "API недоступен" : "Проверка…"}
          </div>
        </header>
        <div className="content">
          {page === "dashboard" && <Dashboard api={api} appts={appts} loading={loading} goto={setPage} />}
          {page === "appointments" && <Appointments api={api} appts={appts} doctors={doctors} patients={patients} reload={loadAll} loading={loading} />}
          {page === "patients" && <Patients api={api} patients={patients} reload={loadAll} loading={loading} />}
          {page === "doctors" && <Doctors api={api} doctors={doctors} reload={loadAll} loading={loading} />}
        </div>
      </div>
    </div>
  );
}
