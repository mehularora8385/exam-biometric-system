import React, { useState } from "react";
import AdminLayout from "./admin/layout";
import Dashboard from "./admin/dashboard";
import DepartmentMaster from "./admin/department";
import DesignationMaster from "./admin/designation";
import ExamMaster from "./admin/exam";
import SlotMaster from "./admin/slot";
import CenterMaster from "./admin/center";
import OperatorMaster from "./admin/operator";
import CenterOperatorMap from "./admin/center-operator-map";
import UploadCandidate from "./admin/upload-candidate";
import Reports from "./admin/reports";
import UploadInstruction from "./admin/upload-instruction";
import OmrSetup from "./admin/omr-setup";
import DeviceMapping from "./admin/device-mapping";

export default function AdminPanel() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch(activePage) {
      case "dashboard": return <Dashboard />;
      case "department": return <DepartmentMaster />;
      case "designation": return <DesignationMaster />;
      case "exam": return <ExamMaster />;
      case "slot": return <SlotMaster />;
      case "center": return <CenterMaster />;
      case "operator": return <OperatorMaster />;
      case "center-operator-map": return <CenterOperatorMap />;
      case "upload-candidate": return <UploadCandidate />;
      case "reports": return <Reports />;
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
