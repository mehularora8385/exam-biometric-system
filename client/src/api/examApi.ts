import api from "../services/api";

export const getExams = () => api.get("/exams");

export const createExam = (data:any) => api.post("/exams", data);

export const updateExam = (id:string, data:any) =>
  api.put(`/exams/${id}`, data);

export const deleteExam = (id:string) =>
  api.delete(`/exams/${id}`);

export const startExam = (id:string) =>
  api.patch(`/exams/${id}/start`);

export const stopExam = (id:string) =>
  api.patch(`/exams/${id}/stop`);
