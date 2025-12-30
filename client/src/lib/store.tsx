import React, { createContext, useContext, useState, useEffect } from "react";
import { format } from "date-fns";

// Types
export type Operator = {
  id: string;
  name: string;
  mobile: string;
  aadhaar: string;
  photoUrl: string;
};

export type Exam = {
  id: string;
  name: string;
  date: string;
  type: "MOCK" | "LIVE";
  centerCode: string;
  roomDetails: string;
};

export type Candidate = {
  applicationNo: string;
  rollNo: string;
  name: string;
  photoUrl?: string;
  examId: string;
};

export type Attendance = {
  applicationNo: string;
  timestamp: string;
  operatorId: string;
  status: "PRESENT" | "ABSENT";
};

export type Registration = {
  applicationNo: string;
  photoUrl: string;
  fingerprintHash: string;
  omrCode: string;
  timestamp: string;
  operatorId: string;
  roomId: string;
};

type AppState = {
  operator: Operator | null;
  exams: Exam[];
  selectedExam: Exam | null;
  candidates: Candidate[];
  attendance: Attendance[];
  registrations: Registration[];
  isDownloaded: boolean;
};

type AppContextType = {
  state: AppState;
  login: (operator: Operator) => void;
  logout: () => void;
  downloadData: (examId: string) => Promise<void>;
  markAttendance: (applicationNo: string) => Promise<void>;
  registerCandidate: (data: Registration) => Promise<void>;
  selectExam: (exam: Exam) => void;
  syncData: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Data
const MOCK_EXAMS: Exam[] = [
  {
    id: "EX-2025-001",
    name: "National Entrance Test 2025",
    date: "2025-05-15",
    type: "LIVE",
    centerCode: "DL-015",
    roomDetails: "Block A, Room 101-110",
  },
  {
    id: "EX-MOCK-001",
    name: "System Trial Run (Mock)",
    date: format(new Date(), "yyyy-MM-dd"),
    type: "MOCK",
    centerCode: "DL-015",
    roomDetails: "Test Lab 1",
  },
];

const MOCK_CANDIDATES: Candidate[] = [
  { applicationNo: "APP001", rollNo: "2025001", name: "Rahul Sharma", photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop" },
  { applicationNo: "APP002", rollNo: "2025002", name: "Priya Singh", photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
  { applicationNo: "APP003", rollNo: "2025003", name: "Amit Kumar", photoUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop" },
  { applicationNo: "APP004", rollNo: "2025004", name: "Sneha Patel", photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop" },
  { applicationNo: "APP005", rollNo: "2025005", name: "Vikram Malhotra" }, // No photo
].map(c => ({ ...c, examId: "EX-2025-001" }));

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    operator: null,
    exams: MOCK_EXAMS,
    selectedExam: null,
    candidates: [],
    attendance: [],
    registrations: [],
    isDownloaded: false,
  });

  const login = (operator: Operator) => {
    setState(prev => ({ ...prev, operator }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, operator: null, selectedExam: null }));
  };

  const selectExam = (exam: Exam) => {
    setState(prev => ({ ...prev, selectedExam: exam }));
  };

  const downloadData = async (examId: string) => {
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 2000));
    setState(prev => ({
      ...prev,
      candidates: MOCK_CANDIDATES,
      isDownloaded: true,
    }));
  };

  const markAttendance = async (applicationNo: string) => {
    if (!state.operator) return;
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if already marked
    if (state.attendance.find(a => a.applicationNo === applicationNo)) {
      throw new Error("Already marked present");
    }

    const newRecord: Attendance = {
      applicationNo,
      timestamp: new Date().toISOString(),
      operatorId: state.operator.id,
      status: "PRESENT",
    };

    setState(prev => ({
      ...prev,
      attendance: [...prev.attendance, newRecord],
    }));
  };

  const registerCandidate = async (data: Registration) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check duplication
    if (state.registrations.find(r => r.applicationNo === data.applicationNo)) {
      throw new Error("Candidate already registered");
    }
    if (state.registrations.find(r => r.omrCode === data.omrCode)) {
      throw new Error("OMR Code already used");
    }

    setState(prev => ({
      ...prev,
      registrations: [...prev.registrations, data],
    }));
  };

  const syncData = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Simulate sync success
  };

  return (
    <AppContext.Provider value={{ state, login, logout, downloadData, markAttendance, registerCandidate, selectExam, syncData }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
};
