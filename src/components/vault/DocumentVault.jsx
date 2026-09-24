import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, FileText, Download, CheckCircle2, Lock, Eye, Sparkles } from 'lucide-react';

export const DocumentVault = () => {
  const { user, activeLoan } = useApp();
  const [selectedDoc, setSelectedDoc] = useState(null);

  const vaultDocs = [
    {
      id: "doc-1",
      name: "PAN Card Document (Verified)",
      type: "KYC ID Proof",
      date: "25 Jul 2026",
      status: "NSDL Verified",
      fileSize: "1.2 MB",
      icon: "FileText"
    },
    {
      id: "doc-2",
      name: "Aadhaar e-KYC Offline Certificate",
      type: "Address & Identity",
      date: "25 Jul 2026",
      status: "UIDAI Authenticated",
      fileSize: "2.4 MB",
      icon: "Shield"
    },
    {
      id: "doc-3",
      name: `Loan Sanction Letter — ${activeLoan.selectedNbfc?.name || 'Rupay91'}`,
      type: "Sanction Letter",
      date: "25 Jul 2026",
      status: "Active Approved",
      fileSize: "840 KB",
      icon: "FileText"
    },
    {
      id: "doc-4",
      name: "e-Signed Loan Agreement & KFS",
      type: "Legal Agreement",
      date: "25 Jul 2026",
      status: "e-Signed with Aadhaar OTP",
      fileSize: "3.1 MB",
      icon: "Lock"
    }
  ];

  const handleDownload = (docName) => {
    alert(`Downloading encrypted copy of "${docName}" (256-bit AES PDF format).`);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-paisa-light shadow-xl my-3 text-left space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-paisa-light text-paisa-primary flex items-center justify-center font-bold">
            <Lock className="w-5 h-5 text-paisa-primary" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-paisa-navy">Secure Document Vault</h2>
            <p className="text-xs text-paisa-secondaryText">Encrypted 256-bit storage for your KYC & loan contracts.</p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          RBI Compliant Vault
        </span>
      </div>

      {/* Document Items List */}
      <div className="space-y-3">
        {vaultDocs.map((doc) => (
          <div key={doc.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-paisa-light text-paisa-navy flex items-center justify-center font-bold flex-shrink-0">
                <FileText className="w-5 h-5 text-paisa-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-paisa-navy">{doc.name}</h4>
                <p className="text-[10px] text-paisa-secondaryText">{doc.type} • {doc.fileSize} • Uploaded {doc.date}</p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                  ✓ {doc.status}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setSelectedDoc(doc)}
                className="p-2 text-paisa-navy hover:bg-white rounded-xl transition"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDownload(doc.name)}
                className="p-2 bg-paisa-primary text-white rounded-xl font-bold text-xs hover:bg-paisa-navy transition"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <h3 className="text-sm font-extrabold text-paisa-navy">{selectedDoc.name}</h3>
            <div className="bg-slate-100 p-4 rounded-2xl text-center space-y-2 border border-slate-200">
              <FileText className="w-12 h-12 text-paisa-primary mx-auto" />
              <p className="text-xs font-bold text-paisa-navy">{selectedDoc.type}</p>
              <p className="text-[10px] text-paisa-secondaryText">Encrypted Digital Document • Verified by NSDL/UIDAI</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="flex-1 py-2 border border-slate-300 text-xs font-bold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => { handleDownload(selectedDoc.name); setSelectedDoc(null); }}
                className="flex-1 py-2 bg-paisa-primary text-white text-xs font-bold rounded-xl shadow"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
