import { useState } from "react";
import { Modal, Field } from "../ui.jsx";

export function PatientForm({ patient, onSave, onClose, busy }) {
  const [f, setF] = useState({
    first_name: patient.first_name || "",
    last_name: patient.last_name || "",
    phone: patient.phone || "",
    email: patient.email || "",
    birth_date: (patient.birth_date || "").slice(0, 10),
    address: patient.address || "",
  });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const ok = f.first_name && f.last_name && f.phone;
  const submit = () => {
    if (!ok) return;
    onSave({ ...f, birth_date: f.birth_date || null });
  };

  return (
    <Modal
      title={patient.id ? "Редактировать пациента" : "Новый пациент"}
      subtitle="Карточка пациента"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!ok || busy} onClick={submit}>
            {busy ? "Сохранение…" : patient.id ? "Сохранить" : "Добавить"}
          </button>
        </>
      }
    >
      <div className="grid2">
        <Field label="Имя" req><input className="input" value={f.first_name} onChange={set("first_name")} autoFocus /></Field>
        <Field label="Фамилия" req><input className="input" value={f.last_name} onChange={set("last_name")} /></Field>
        <Field label="Телефон" req><input className="input" value={f.phone} onChange={set("phone")} placeholder="+7 …" /></Field>
        <Field label="Email"><input className="input" type="email" value={f.email} onChange={set("email")} /></Field>
        <Field label="Дата рождения"><input className="input" type="date" value={f.birth_date} onChange={set("birth_date")} /></Field>
        <Field label="Адрес"><input className="input" value={f.address} onChange={set("address")} /></Field>
      </div>
    </Modal>
  );
}
