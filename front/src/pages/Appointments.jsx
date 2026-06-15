import { useState } from "react";
import { I } from "../components/icons.jsx";
import { TableSkeleton, Empty, Confirm } from "../components/ui.jsx";
import { ApptForm } from "../components/forms/ApptForm.jsx";
import { colorFor, initials, fmtDate, fmtTime, STATUS_RU } from "../lib/format.js";
import { useToast } from "../context/ToastContext.jsx";

export function Appointments({ api, appts, doctors, patients, reload, loading }) {
  const push = useToast();
  const [filter, setFilter] = useState("all");
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const list = appts.filter((a) => (filter === "all" ? true : a.status === filter));

  const save = async (form) => {
    setBusy(true);
    try {
      if (edit.id) { await api.updAppt(edit.id, form); push("Визит обновлён"); }
      else { await api.addAppt(form); push("Визит запланирован"); }
      setEdit(null);
      reload();
    } catch (e) { push(e.message, "err"); } finally { setBusy(false); }
  };

  const setStatus = async (a, s) => {
    try { await api.setApptStatus(a.id, s); push("Статус: " + STATUS_RU[s]); reload(); }
    catch (e) { push(e.message, "err"); }
  };

  const remove = async () => {
    setBusy(true);
    try { await api.delAppt(del.id); push("Визит удалён"); setDel(null); reload(); }
    catch (e) { push(e.message, "err"); } finally { setBusy(false); }
  };

  const filters = [["all", "Все"], ["scheduled", "Запланированы"], ["completed", "Завершены"], ["cancelled", "Отменены"]];
  const canPlan = doctors.length > 0 && patients.length > 0;

  return (
    <>
      <div className="section-head">
        <h2>Визиты <span className="muted" style={{ fontWeight: 400 }}>· {appts.length}</span></h2>
        <div className="toolbar">
          <div className="seg">
            {filters.map(([k, l]) => (
              <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          <button className="btn btn-primary" disabled={!canPlan} onClick={() => setEdit({})}>{I.plus} Новый визит</button>
        </div>
      </div>

      {!canPlan && !loading && (
        <div className="card" style={{ padding: "14px 18px", marginBottom: 16, fontSize: 13.5, color: "var(--muted)", borderLeft: "3px solid var(--accent)" }}>
          Чтобы планировать визиты, сначала добавьте хотя бы одного врача и одного пациента.
        </div>
      )}

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Дата и время</th><th>Пациент</th><th>Врач</th><th>Заметки</th><th>Статус</th><th style={{ textAlign: "right" }}>Действия</th></tr></thead>
          {loading ? (
            <TableSkeleton cols={6} />
          ) : (
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan="6">
                  <Empty icon={I.cal} title="Визитов нет" text={filter === "all" ? "Запланируйте первый визит пациента к врачу." : "Нет визитов с таким статусом."}
                    action={filter === "all" && canPlan && <button className="btn btn-primary" onClick={() => setEdit({})}>{I.plus} Новый визит</button>} />
                </td></tr>
              ) : (
                list.map((a) => (
                  <tr key={a.id}>
                    <td><b className="tnum">{fmtTime(a.appointment_time)}</b><div className="muted" style={{ fontSize: 12.5 }}>{fmtDate(a.appointment_date)}</div></td>
                    <td>
                      <div className="row-name">
                        <span className="avatar" style={{ background: colorFor(a.patient_name || "P") + "1f", color: colorFor(a.patient_name || "P"), width: 32, height: 32, fontSize: 12 }}>
                          {initials(a.patient_name, a.patient_surname)}
                        </span>
                        <b>{a.patient_name} {a.patient_surname}</b>
                      </div>
                    </td>
                    <td className="muted">{a.doctor_name} {a.doctor_surname}</td>
                    <td className="muted" style={{ fontSize: 13, maxWidth: 200 }}>{a.notes || "—"}</td>
                    <td>
                      <select
                        className="input"
                        style={{ padding: "5px 8px", width: "auto", fontWeight: 600, fontSize: 12.5, color: a.status === "completed" ? "#1f6e4c" : a.status === "cancelled" ? "#9c3245" : "#2c558a" }}
                        value={a.status}
                        onChange={(e) => setStatus(a, e.target.value)}
                      >
                        <option value="scheduled">Запланирован</option>
                        <option value="completed">Завершён</option>
                        <option value="cancelled">Отменён</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="iconbtn" onClick={() => setEdit(a)} title="Редактировать">{I.edit}</button>
                        <button className="iconbtn danger" onClick={() => setDel(a)} title="Удалить">{I.trash}</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {edit && <ApptForm appt={edit} doctors={doctors} patients={patients} onSave={save} onClose={() => setEdit(null)} busy={busy} />}
      {del && <Confirm text={`Визит ${fmtDate(del.appointment_date)} ${fmtTime(del.appointment_time)}`} onYes={remove} onClose={() => setDel(null)} busy={busy} />}
    </>
  );
}
