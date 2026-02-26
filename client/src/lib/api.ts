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
  uploadLogo: async (examId: number, file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    const res = await fetch(`${API_BASE}/exams/${examId}/logo`, { method: "POST", body: formData });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
  },
  removeLogo: (examId: number) => request<any>(`/exams/${examId}/logo`, { method: "DELETE" }),
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
    uploadFile: async (file: File, examId: number) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("examId", String(examId));
      const res = await fetch(`${API_BASE}/candidates/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(error.message || `HTTP ${res.status}`);
      }
      return res.json();
    },
    uploadPhotos: async (files: FileList | File[]) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("photos", file));
      const res = await fetch(`${API_BASE}/candidates/upload-photos`, { method: "POST", body: formData });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(error.message || `HTTP ${res.status}`);
      }
      return res.json();
    },
    downloadTemplate: () => {
      window.open(`${API_BASE}/candidates/template`, "_blank");
    },
    listByCentre: (centreCode: string, examId?: number) => 
      request<any[]>("/candidates/by-centre/" + centreCode + (examId ? "?examId=" + examId : "")),
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
    syncAll: (examId?: number) => request<any>("/devices/sync-all", { method: "POST", body: JSON.stringify({ examId }) }),
    logoutAll: (examId?: number) => request<any>("/devices/logout-all", { method: "POST", body: JSON.stringify({ examId }) }),
    releaseMdm: (examId?: number, deviceId?: number) => request<any>("/devices/release-mdm", { method: "POST", body: JSON.stringify({ examId, deviceId }) }),
    syncOne: (id: number) => request<any>(`/devices/${id}/sync`, { method: "POST" }),
    logoutOne: (id: number) => request<any>(`/devices/${id}/logout`, { method: "POST" }),
  },
  apkBuilds: {
    list: (examId?: number) => request<any[]>(`/apk-builds${examId ? `?examId=${examId}` : ""}`),
    create: (data: any) => request<any>("/apk-builds", { method: "POST", body: JSON.stringify(data) }),
    batchCreate: (examIds: number[], features: any) => request<any>("/apk-builds/batch", { method: "POST", body: JSON.stringify({ examIds, features }) }),
    downloadConfig: (id: number) => { window.open(`${API_BASE}/apk-builds/${id}/config`, "_blank"); },
    downloadApk: (id: number) => { window.open(`${API_BASE}/apk-builds/${id}/download`, "_blank"); },
    downloadAndroidProject: (id: number) => { window.open(`${API_BASE}/apk-builds/${id}/android-project`, "_blank"); },
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
    stats: (examId?: number) => request<any>(`/dashboard/stats${examId ? `?examId=${examId}` : ""}`),
  },
  client: {
    exams: (username: string) => request<any[]>(`/client/exams?username=${encodeURIComponent(username)}`),
    dashboard: (examId?: number) => request<any>(`/client/dashboard${examId ? `?examId=${examId}` : ""}`),
    operators: (examId?: number) => request<any[]>(`/client/operators${examId ? `?examId=${examId}` : ""}`),
    candidates: (examId?: number) => request<any[]>(`/client/candidates${examId ? `?examId=${examId}` : ""}`),
  },
};
