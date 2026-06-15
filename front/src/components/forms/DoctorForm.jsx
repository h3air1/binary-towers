import { useState } from "react";
import { Modal, Field } from "../ui.jsx";

export function DoctorForm({ doctor, onSave, onClose, busy }) {
  const [f, setF] = useState({
    first_name: doctor.first_name || "",
    last_name: doctor.last_name || "",
    specialization: doctor.specialization || "",
    phone: doctor.phone || "",
    email: doctor.email || "",
    price: doctor.price ?? "",
  });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const ok = f.first_name && f.last_name && f.specialization;
  const submit = () => {
    if (!ok) return;
    onSave({ ...f, price: f.price === "" ? null : Number(f.price) });
  };

  return (
    <Modal
      title={doctor.id ? "Редактировать врача" : "Новый врач"}
      subtitle="Профиль специалиста клиники"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" disabled={!ok || busy} onClick={submit}>
            {busy ? "Сохранение…" : doctor.id ? "Сохранить" : "Добавить"}
          </button>
        </>
      }
    >
      <div className="grid2">
        <Field label="Имя" req><input className="input" value={f.first_name} onChange={set("first_name")} autoFocus /></Field>
        <Field label="Фамилия" req><input className="input" value={f.last_name} onChange={set("last_name")} /></Field>
        <Field label="Специализация" req><input className="input full" value={f.specialization} onChange={set("specialization")} placeholder="Терапевт, кардиолог…" /></Field>
        <Field label="Телефон"><input className="input" value={f.phone} onChange={set("phone")} placeholder="+7 …" /></Field>
        <Field label="Email"><input className="input" type="email" value={f.email} onChange={set("email")} /></Field>
        <Field label="Стоимость приёма, ₽"><input className="input" type="number" min="0" value={f.price} onChange={set("price")} placeholder="2500" /></Field>
      </div>
    </Modal>
  );
}
