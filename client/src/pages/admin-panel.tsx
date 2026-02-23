import React, { useState } from "react";
import AdminLayout from "@/pages/admin/layout";
import Dashboard from "@/pages/admin/dashboard";
import DepartmentMaster from "@/pages/admin/department";
import DesignationMaster from "@/pages/admin/designation";
import ExamMaster from "@/pages/admin/exam";
import SlotMaster from "@/pages/admin/slot";
import CenterMaster from "@/pages/admin/center";
import OperatorMaster from "@/pages/admin/operator";
import CenterOperatorMap from "@/pages/admin/center-operator-map";
import UploadCandidate from "@/pages/admin/upload-candidate";
import Reports from "@/pages/admin/reports";
import UploadInstruction from "@/pages/admin/upload-instruction";
import OmrSetup from "@/pages/admin/omr-setup";
import DeviceMapping from "@/pages/admin/device-mapping";
import Candidates from "@/pages/admin/candidate";
import GenerateAPK from "@/pages/admin/apk";
import AICommandCenter from "@/pages/admin/ai-command-center";
import FraudAnalytics from "@/pages/admin/fraud-analytics";
import BiometricIntegrity from "@/pages/admin/biometric-integrity";
import GlobalSurveillance from "@/pages/admin/global-surveillance";

export default function AdminPanel() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch(activePage) {
      case "dashboard": return <Dashboard />;
      case "department": return <DepartmentMaster />;
      case "designation": return <DesignationMaster />;
      case "exam": return <ExamMaster setActivePage={setActivePage} />;
      case "slot": return <SlotMaster />;
      case "center": return <CenterMaster />;
      case "operator": return <OperatorMaster />;
      case "candidates": return <Candidates />;
      case "center-operator-map": return <CenterOperatorMap />;
      case "upload-candidate": return <UploadCandidate />;
      case "apk": return <GenerateAPK />;
      case "reports": return <Reports />;
      case "ai-command": return <AICommandCenter />;
      case "fraud-analytics": return <FraudAnalytics />;
      case "biometric-integrity": return <BiometricIntegrity />;
      case "global-surveillance": return <GlobalSurveillance />;
      case "upload-instruction": return <UploadInstruction />;
      case "omr-setup": return <OmrSetup />;
      case "device-mapping": return <DeviceMapping />;
      default: return <Dashboard />;
    }
  };

  return (
    <AdminLayout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </AdminLayout>
  );
}
