import { useState } from "react";
import { I } from "../components/icons.jsx";
import { TableSkeleton, Empty, Confirm } from "../components/ui.jsx";
import { PatientForm } from "../components/forms/PatientForm.jsx";
import { colorFor, initials, fmtDate } from "../lib/format.js";
import { useToast } from "../context/ToastContext.jsx";

export function Patients({ api, patients, reload, loading }) {
  const push = useToast();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const list = patients.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.phone} ${p.email || ""}`.toLowerCase().includes(q.toLowerCase())
  );

  const save = async (form) => {
    setBusy(true);
    try {
      if (edit.id) { await api.updPatient(edit.id, form); push("Данные пациента обновлены"); }
      else { await api.addPatient(form); push("Пациент добавлен"); }
      setEdit(null);
      reload();
    } catch (e) { push(e.message, "err"); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await api.delPatient(del.id); push("Пациент удалён"); setDel(null); reload(); }
    catch (e) { push(e.message, "err"); } finally { setBusy(false); }
  };

  return (
    <>
      <div className="section-head">
        <h2>Пациенты <span className="muted" style={{ fontWeight: 400 }}>· {patients.length}</span></h2>
        <div className="toolbar">
          <div className="search">{I.search}<input className="input" placeholder="Поиск по имени, телефону…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={() => setEdit({})}>{I.plus} Добавить пациента</button>
        </div>
      </div>

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Пациент</th><th>Телефон</th><th>Email</th><th>Дата рождения</th><th>Адрес</th><th style={{ textAlign: "right" }}>Действия</th></tr></thead>
          {loading ? (
            <TableSkeleton cols={6} />
          ) : (
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan="6">
                  <Empty icon={I.users} title={q ? "Ничего не найдено" : "Картотека пуста"} text={q ? "Измените запрос поиска." : "Добавьте первого пациента в картотеку."}
                    action={!q && <button className="btn btn-primary" onClick={() => setEdit({})}>{I.plus} Добавить пациента</button>} />
                </td></tr>
              ) : (
                list.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="row-name">
                        <span className="avatar" style={{ background: colorFor(p.first_name) + "1f", color: colorFor(p.first_name) }}>{initials(p.first_name, p.last_name)}</span>
                        <div><b>{p.first_name} {p.last_name}</b><small>ID {p.id}</small></div>
                      </div>
                    </td>
                    <td className="tnum">{p.phone || "—"}</td>
                    <td className="muted">{p.email || "—"}</td>
                    <td>{fmtDate(p.birth_date)}</td>
                    <td className="muted" style={{ fontSize: 13, maxWidth: 200 }}>{p.address || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="iconbtn" onClick={() => setEdit(p)} title="Редактировать">{I.edit}</button>
                        <button className="iconbtn danger" onClick={() => setDel(p)} title="Удалить">{I.trash}</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {edit && <PatientForm patient={edit} onSave={save} onClose={() => setEdit(null)} busy={busy} />}
      {del && <Confirm text={`${del.first_name} ${del.last_name}`} onYes={remove} onClose={() => setDel(null)} busy={busy} />}
    </>
  );
}
