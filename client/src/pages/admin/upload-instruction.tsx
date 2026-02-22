import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UploadInstruction() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Upload Instruction</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700">Upload Guidelines & Instructions</h3>
        </div>
        <CardContent className="p-6">
          <p className="text-slate-600 mb-4">Please upload candidate data following these instructions:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Ensure the file is in .xlsx or .xls format.</li>
            <li>Do not modify the headers of the sample template.</li>
            <li>Center codes must exactly match the Center Master records.</li>
            <li>Date of Birth should be in YYYY-MM-DD format.</li>
            <li>Maximum 50,000 rows allowed per file upload.</li>
          </ul>
          <div className="mt-6">
            <Button className="bg-[#1cc88a] hover:bg-[#17a673]">Download Sample Template</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}