// Клиент REST API. Все эндпоинты бэкенда собраны в одном месте.
// onAuthFail вызывается при 401/403 — чтобы разлогинить пользователя.

export function makeApi(base, token, onAuthFail) {
  const url = (p) => base.replace(/\/$/, "") + p;

  const req = async (method, path, body) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;

    let res;
    try {
      res = await fetch(url(path), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error("Нет связи с сервером. Проверьте адрес API и что бэкенд запущен.");
    }

    if (res.status === 401 || res.status === 403) onAuthFail && onAuthFail();

    let data = null;
    try {
      data = await res.json();
    } catch {
      /* пустой ответ — это нормально */
    }

    if (!res.ok) throw new Error((data && data.error) || `Ошибка ${res.status}`);
    return data;
  };

  return {
    health: () => req("GET", "/api/health"),
    stats: () => req("GET", "/api/stats"),

    login: (b) => req("POST", "/api/auth/login", b),
    register: (b) => req("POST", "/api/auth/register", b),

    doctors: () => req("GET", "/api/doctors"),
    addDoctor: (b) => req("POST", "/api/doctors", b),
    updDoctor: (id, b) => req("PUT", `/api/doctors/${id}`, b),
    delDoctor: (id) => req("DELETE", `/api/doctors/${id}`),

    patients: () => req("GET", "/api/patients"),
    addPatient: (b) => req("POST", "/api/patients", b),
    updPatient: (id, b) => req("PUT", `/api/patients/${id}`, b),
    delPatient: (id) => req("DELETE", `/api/patients/${id}`),

    appointments: () => req("GET", "/api/appointments"),
    addAppt: (b) => req("POST", "/api/appointments", b),
    updAppt: (id, b) => req("PUT", `/api/appointments/${id}`, b),
    setApptStatus: (id, s) => req("PATCH", `/api/appointments/${id}/status`, { status: s }),
    delAppt: (id) => req("DELETE", `/api/appointments/${id}`),
  };
}
