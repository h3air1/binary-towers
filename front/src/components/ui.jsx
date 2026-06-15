import { useEffect } from "react";
import { I } from "./icons.jsx";
import { STATUS_RU } from "../lib/format.js";

// Модальное окно с затемнением, закрытием по Esc и клику вне.
export function Modal({ title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Закрыть">
            {I.x}
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// Поле формы с подписью и пометкой обязательности.
export function Field({ label, req, children }) {
  return (
    <div className="field">
      <label>
        {label}
        {req && <span className="req"> *</span>}
      </label>
      {children}
    </div>
  );
}

// Окно подтверждения удаления.
export function Confirm({ text, onYes, onClose, busy }) {
  return (
    <Modal
      title="Подтвердите удаление"
      subtitle={text}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn"
            style={{ background: "var(--rose)", color: "#fff" }}
            disabled={busy}
            onClick={onYes}
          >
            {busy ? "Удаление…" : "Удалить"}
          </button>
        </>
      }
    >
      <p className="muted" style={{ margin: 0, fontSize: 14 }}>
        Это действие необратимо. Запись будет удалена из базы данных.
      </p>
    </Modal>
  );
}

// Заглушка-скелет на время загрузки таблицы.
export function TableSkeleton({ cols = 4, rows = 5 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c}>
              <div className="skel" style={{ width: c === 0 ? "60%" : "75%" }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// Пустое состояние с иконкой, текстом и действием.
export function Empty({ icon, title, text, action }) {
  return (
    <div className="empty">
      <div className="ico">{icon}</div>
      <h3>{title}</h3>
      <p style={{ maxWidth: 340, margin: "0 auto 16px" }}>{text}</p>
      {action}
    </div>
  );
}

// Цветной значок статуса визита.
export function StatusPill({ s }) {
  return (
    <span className={"pill pill-" + s}>
      <span className="dot" />
      {STATUS_RU[s] || s}
    </span>
  );
}
