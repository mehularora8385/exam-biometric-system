const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<any>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  },
  exams: {
    list: () => request<any[]>("/exams"),
    get: (id: number) => request<any>(`/exams/${id}`),
    create: (data: any) => request<any>("/exams", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/exams/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/exams/${id}`, { method: "DELETE" }),
  },
  centers: {
    list: (examId?: number) => request<any[]>(`/centers${examId ? `?examId=${examId}` : ""}`),
    get: (id: number) => request<any>(`/centers/${id}`),
    create: (data: any) => request<any>("/centers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/centers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/centers/${id}`, { method: "DELETE" }),
  },
  operators: {
    list: () => request<any[]>("/operators"),
    get: (id: number) => request<any>(`/operators/${id}`),
    create: (data: any) => request<any>("/operators", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/operators/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/operators/${id}`, { method: "DELETE" }),
  },
  candidates: {
    list: (examId?: number) => request<any[]>(`/candidates${examId ? `?examId=${examId}` : ""}`),
    get: (id: number) => request<any>(`/candidates/${id}`),
    create: (data: any) => request<any>("/candidates", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/candidates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/candidates/${id}`, { method: "DELETE" }),
  },
  departments: {
    list: () => request<any[]>("/departments"),
    create: (data: any) => request<any>("/departments", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/departments/${id}`, { method: "DELETE" }),
  },
  designations: {
    list: () => request<any[]>("/designations"),
    create: (data: any) => request<any>("/designations", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/designations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/designations/${id}`, { method: "DELETE" }),
  },
  slots: {
    list: (examId?: number) => request<any[]>(`/slots${examId ? `?examId=${examId}` : ""}`),
    create: (data: any) => request<any>("/slots", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/slots/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/slots/${id}`, { method: "DELETE" }),
  },
  centerOperatorMaps: {
    list: () => request<any[]>("/center-operator-maps"),
    create: (data: any) => request<any>("/center-operator-maps", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/center-operator-maps/${id}`, { method: "DELETE" }),
  },
  devices: {
    list: () => request<any[]>("/devices"),
    create: (data: any) => request<any>("/devices", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/devices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/devices/${id}`, { method: "DELETE" }),
  },
  apkBuilds: {
    list: (examId?: number) => request<any[]>(`/apk-builds${examId ? `?examId=${examId}` : ""}`),
    create: (data: any) => request<any>("/apk-builds", { method: "POST", body: JSON.stringify(data) }),
  },
  auditLogs: {
    list: () => request<any[]>("/audit-logs"),
    create: (data: any) => request<any>("/audit-logs", { method: "POST", body: JSON.stringify(data) }),
  },
  alerts: {
    list: () => request<any[]>("/alerts"),
    create: (data: any) => request<any>("/alerts", { method: "POST", body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) => request<any>(`/alerts/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },
  globalTech: {
    get: (examId: number) => request<any>(`/global-tech-settings/${examId}`),
    update: (data: any) => request<any>("/global-tech-settings", { method: "PUT", body: JSON.stringify(data) }),
  },
  dashboard: {
    stats: () => request<any>("/dashboard/stats"),
  },
};
