import { useState } from "react";
import { Modal, Field } from "../ui.jsx";
import { fmtTime } from "../../lib/format.js";

export function ApptForm({ appt, doctors, patients, onSave, onClose, busy }) {
  const [f, setF] = useState({
    patient_id: appt.patient_id || "",
    doctor_id: appt.doctor_id || "",
    appointment_date: (appt.appointment_date || "").slice(0, 10),
    appointment_time: appt.appointment_time ? fmtTime(appt.appointment_time) : "",
    notes: appt.notes || "",
    status: appt.status || "scheduled",
  });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const ok = f.patient_id && f.doctor_id && f.appointment_date && f.appointment_time;
  const submit = () => {
    if (!ok) return;
    onSave({ ...f, patient_id: Number(f.patient_id), doctor_id: Number(f.doctor_id) });
  };

  return (
    <Modal
      title={appt.id ? "Редактировать визит" : "Новый визит"}
      subtitle="Запись пациента на приём"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!ok || busy} onClick={submit}>
            {busy ? "Сохранение…" : appt.id ? "Сохранить" : "Запланировать"}
          </button>
        </>
      }
    >
      <div className="grid2">
        <Field label="Пациент" req>
          <select className="input" value={f.patient_id} onChange={set("patient_id")}>
            <option value="">— выберите —</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
            ))}
          </select>
        </Field>
        <Field label="Врач" req>
          <select className="input" value={f.doctor_id} onChange={set("doctor_id")}>
            <option value="">— выберите —</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.first_name} {d.last_name} · {d.specialization}</option>
            ))}
          </select>
        </Field>
        <Field label="Дата" req><input className="input" type="date" value={f.appointment_date} onChange={set("appointment_date")} /></Field>
        <Field label="Время" req><input className="input" type="time" value={f.appointment_time} onChange={set("appointment_time")} /></Field>
        {appt.id && (
          <Field label="Статус">
            <select className="input" value={f.status} onChange={set("status")}>
              <option value="scheduled">Запланирован</option>
              <option value="completed">Завершён</option>
              <option value="cancelled">Отменён</option>
            </select>
          </Field>
        )}
        <div className="field full" style={{ gridColumn: "1/-1" }}>
          <label>Заметки</label>
          <textarea className="input" value={f.notes} onChange={set("notes")} placeholder="Жалобы, повод визита, комментарии…" />
        </div>
      </div>
    </Modal>
  );
}
