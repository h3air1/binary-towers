import { useState } from "react";
import { I } from "../components/icons.jsx";
import { TableSkeleton, Empty, Confirm } from "../components/ui.jsx";
import { DoctorForm } from "../components/forms/DoctorForm.jsx";
import { colorFor, initials, money } from "../lib/format.js";
import { useToast } from "../context/ToastContext.jsx";

export function Doctors({ api, doctors, reload, loading }) {
  const push = useToast();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null); // null | {} | doctor
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const list = doctors.filter((d) =>
    `${d.first_name} ${d.last_name} ${d.specialization}`.toLowerCase().includes(q.toLowerCase())
  );

  const save = async (form) => {
    setBusy(true);
    try {
      if (edit.id) { await api.updDoctor(edit.id, form); push("Данные врача обновлены"); }
      else { await api.addDoctor(form); push("Врач добавлен"); }
      setEdit(null);
      reload();
    } catch (e) { push(e.message, "err"); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await api.delDoctor(del.id); push("Врач удалён"); setDel(null); reload(); }
    catch (e) { push(e.message, "err"); } finally { setBusy(false); }
  };

  return (
    <>
      <div className="section-head">
        <h2>Врачи <span className="muted" style={{ fontWeight: 400 }}>· {doctors.length}</span></h2>
        <div className="toolbar">
          <div className="search">{I.search}<input className="input" placeholder="Поиск врача…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={() => setEdit({})}>{I.plus} Добавить врача</button>
        </div>
      </div>

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Врач</th><th>Специализация</th><th>Контакты</th><th>Приём</th><th style={{ textAlign: "right" }}>Действия</th></tr></thead>
          {loading ? (
            <TableSkeleton cols={5} />
          ) : (
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan="5">
                  <Empty icon={I.stetho} title={q ? "Ничего не найдено" : "Пока нет врачей"} text={q ? "Измените запрос поиска." : "Добавьте первого врача в команду клиники."}
                    action={!q && <button className="btn btn-primary" onClick={() => setEdit({})}>{I.plus} Добавить врача</button>} />
                </td></tr>
              ) : (
                list.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="row-name">
                        <span className="avatar" style={{ background: colorFor(d.first_name) + "1f", color: colorFor(d.first_name) }}>{initials(d.first_name, d.last_name)}</span>
                        <div><b>{d.first_name} {d.last_name}</b><small>ID {d.id}</small></div>
                      </div>
                    </td>
                    <td>{d.specialization}</td>
                    <td className="muted" style={{ fontSize: 13 }}>{d.phone || "—"}{d.email && <div style={{ fontSize: 12 }}>{d.email}</div>}</td>
                    <td className="price-tag">{money(d.price)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="iconbtn" onClick={() => setEdit(d)} title="Редактировать">{I.edit}</button>
                        <button className="iconbtn danger" onClick={() => setDel(d)} title="Удалить">{I.trash}</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {edit && <DoctorForm doctor={edit} onSave={save} onClose={() => setEdit(null)} busy={busy} />}
      {del && <Confirm text={`${del.first_name} ${del.last_name}`} onYes={remove} onClose={() => setDel(null)} busy={busy} />}
    </>
  );
}
