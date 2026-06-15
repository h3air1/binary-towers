// Утилиты форматирования и общие константы UI.

export const COLORS = [
  "#0E7C7B", "#3A6FB0", "#E29A2E", "#C24559", "#2E9266", "#7B5EA7", "#C2724A",
];

export const colorFor = (s = "") => COLORS[(s.charCodeAt(0) || 0) % COLORS.length];

export const initials = (a = "", b = "") =>
  ((a[0] || "") + (b[0] || "")).toUpperCase() || "—";

export const fmtDate = (d) => {
  if (!d) return "—";
  const x = new Date(d);
  return isNaN(x)
    ? d
    : x.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtTime = (t) => (t ? String(t).slice(0, 5) : "—");

export const money = (p) =>
  p === null || p === undefined || p === ""
    ? "—"
    : Number(p).toLocaleString("ru-RU") + " ₽";

export const STATUS_RU = {
  scheduled: "Запланирован",
  completed: "Завершён",
  cancelled: "Отменён",
};

export const ROLE_RU = {
  admin: "администратор",
  doctor: "врач",
  receptionist: "регистратор",
};
