import React, { useState, useEffect } from 'react';
import { SurveySubmission } from '../types';
import { generateCSV } from '../services/csvService';
import { Download, Trash2, ArrowLeft, Eye } from 'lucide-react';

interface AdminDashboardProps {
  submissions: SurveySubmission[];
  onDelete: (ids: string[]) => void;
  onView: (submission: SurveySubmission) => void;
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ submissions, onDelete, onView, onBack }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selection if submissions change (e.g. after delete)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [submissions.length]);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (selectedIds.size === submissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(submissions.map(s => s.id)));
    }
  };

  const toggleSelectId = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleDeleteClick = () => {
    // If explicit selection exists, use it. Otherwise, assume "Delete All".
    const ids = selectedIds.size > 0 
        ? Array.from(selectedIds) 
        : submissions.map(s => s.id);

    if (ids.length === 0) return;

    const message = selectedIds.size > 0 
        ? `Möchtest du wirklich ${selectedIds.size} ausgewählte Einträge löschen?` 
        : 'Möchtest du wirklich ALLE gespeicherten Antworten löschen?';

    if (window.confirm(message)) {
      console.log("Triggering delete for IDs:", ids);
      onDelete(ids);
      // Selection reset is handled by useEffect when submissions prop changes
    }
  };

  const handleExportClick = () => {
    const toExport = selectedIds.size > 0 
        ? submissions.filter(s => selectedIds.has(s.id)) 
        : submissions;
    generateCSV(toExport);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Zurück zum Fragebogen
          </button>
          <h2 className="text-3xl font-bold text-slate-800">Admin Dashboard</h2>
          <p className="text-slate-500 mt-1">
            {submissions.length} {submissions.length === 1 ? 'Eintrag' : 'Einträge'} lokal gespeichert.
          </p>
        </div>
        
        <div className="flex gap-3">
            <button
            type="button"
            onClick={handleDeleteClick}
            disabled={submissions.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <Trash2 className="w-4 h-4" />
            {selectedIds.size > 0 ? `Auswahl löschen (${selectedIds.size})` : 'Alle löschen'}
            </button>
            <button
            type="button"
            onClick={handleExportClick}
            disabled={submissions.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <Download className="w-4 h-4" />
            {selectedIds.size > 0 ? `Auswahl exportieren (${selectedIds.size})` : 'Alle exportieren'}
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4 w-10 text-center">
                    <input 
                        type="checkbox" 
                        checked={submissions.length > 0 && selectedIds.size === submissions.length}
                        onChange={toggleSelectAll}
                        disabled={submissions.length === 0}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer align-middle"
                    />
                </th>
                <th className="p-4">Datum</th>
                <th className="p-4">Name</th>
                <th className="p-4">Position</th>
                <th className="p-4">Zeit im Unternehmen</th>
                <th className="p-4">Antworten (Preview)</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Noch keine Antworten vorhanden.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr 
                    key={sub.id} 
                    onClick={() => onView(sub)}
                    className={`hover:bg-blue-50/30 transition-colors cursor-pointer group ${selectedIds.has(sub.id) ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                            type="checkbox" 
                            checked={selectedIds.has(sub.id)}
                            onChange={(e) => { e.stopPropagation(); toggleSelectId(sub.id); }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer align-middle"
                        />
                    </td>
                    <td className="p-4 whitespace-nowrap">
                        {new Date(sub.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                        {sub.personalInfo.firstName} {sub.personalInfo.lastName}
                    </td>
                    <td className="p-4">{sub.personalInfo.position}</td>
                    <td className="p-4">{sub.personalInfo.yearsInCompany}</td>
                    <td className="p-4 text-xs text-slate-400 max-w-xs truncate">
                        {Object.keys(sub.answers).length} Fragen beantwortet
                    </td>
                    <td className="p-4 text-right">
                        <Eye className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;