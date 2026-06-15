import { useState, useEffect } from "react";
import { I } from "../components/icons.jsx";
import { TableSkeleton, Empty, StatusPill } from "../components/ui.jsx";
import { colorFor, initials, fmtDate, fmtTime } from "../lib/format.js";

export function Dashboard({ api, appts, loading, goto }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todays = appts
    .filter((a) => a.appointment_date && a.appointment_date.slice(0, 10) === today)
    .sort((a, b) => (a.appointment_time || "").localeCompare(b.appointment_time || ""));

  const cards = [
    { key: "total_patients", lbl: "Пациенты", ico: I.users, c: "var(--primary)", soft: "var(--primary-soft)" },
    { key: "total_doctors", lbl: "Врачи", ico: I.stetho, c: "var(--blue)", soft: "var(--blue-soft)" },
    { key: "total_appointments", lbl: "Всего визитов", ico: I.cal, c: "var(--accent)", soft: "var(--accent-soft)" },
    { key: "today_appointments", lbl: "Сегодня", ico: I.clock, c: "var(--green)", soft: "var(--green-soft)" },
  ];

  return (
    <>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className="card stat" key={c.key}>
            <div className="bar" style={{ background: c.c }} />
            <div className="ico" style={{ background: c.soft, color: c.c }}>{c.ico}</div>
            <div className="num tnum">
              {stats ? stats[c.key] : <span className="skel" style={{ display: "inline-block", width: 40, height: 30 }} />}
            </div>
            <div className="lbl">{c.lbl}</div>
          </div>
        ))}
      </div>

      <div className="section-head">
        <div>
          <h2>Визиты на сегодня</h2>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: 13 }}>{fmtDate(today)}</p>
        </div>
        <button className="btn btn-soft" onClick={() => goto("appointments")}>Все визиты →</button>
      </div>

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Время</th><th>Пациент</th><th>Врач</th><th>Статус</th></tr></thead>
          {loading ? (
            <TableSkeleton cols={4} />
          ) : (
            <tbody>
              {todays.length === 0 ? (
                <tr><td colSpan="4">
                  <Empty icon={I.cal} title="На сегодня визитов нет" text="Свободный день — или самое время записать пациента."
                    action={<button className="btn btn-primary" onClick={() => goto("appointments")}>{I.plus} Новый визит</button>} />
                </td></tr>
              ) : (
                todays.map((a) => (
                  <tr key={a.id}>
                    <td className="tnum" style={{ fontWeight: 600 }}>{fmtTime(a.appointment_time)}</td>
                    <td>
                      <div className="row-name">
                        <span className="avatar" style={{ background: colorFor(a.patient_name || "P") + "1f", color: colorFor(a.patient_name || "P") }}>
                          {initials(a.patient_name, a.patient_surname)}
                        </span>
                        <b>{a.patient_name} {a.patient_surname}</b>
                      </div>
                    </td>
                    <td className="muted">{a.doctor_name} {a.doctor_surname}</td>
                    <td><StatusPill s={a.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
}
