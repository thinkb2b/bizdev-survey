import React, { useState, useEffect } from 'react';
import SurveyForm from './components/SurveyForm';
import AdminDashboard from './components/AdminDashboard';
import { SurveySubmission } from './types';
import { CheckCircle } from 'lucide-react';

// Robust ID generator
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default function App() {
  const [view, setView] = useState<'form' | 'admin' | 'success'>('form');
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);

  useEffect(() => {
    // Load existing submissions from local storage
    const stored = localStorage.getItem('survey_submissions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let hasChanges = false;
        
        // Ensure array
        const list = Array.isArray(parsed) ? parsed : [];

        // Sanitize: Add IDs if missing and ensure they are strings
        const sanitized = list.map((s: any) => {
            if (!s.id) {
                hasChanges = true;
                return { ...s, id: generateId() };
            }
            return { ...s, id: String(s.id) };
        });

        setSubmissions(sanitized);

        // If we modified data to add IDs, save it back immediately so IDs are persistent
        if (hasChanges) {
             localStorage.setItem('survey_submissions', JSON.stringify(sanitized));
        }
      } catch (e) {
        console.error("Could not parse submissions", e);
      }
    }
  }, []);

  const handleSubmission = (submission: SurveySubmission) => {
    const updated = [...submissions, submission];
    setSubmissions(updated);
    localStorage.setItem('survey_submissions', JSON.stringify(updated));
    setView('success');
  };

  const handleDelete = (idsToDelete: string[]) => {
    // Debug log
    console.log("Attempting to delete IDs:", idsToDelete);

    // Convert to Set for O(1) lookups
    const targets = new Set(idsToDelete.map(String));

    // Filter
    const updated = submissions.filter(sub => !targets.has(String(sub.id)));
    
    // Debug log
    console.log("Remaining submissions:", updated.length);

    // Update State
    setSubmissions(updated);
    
    // Update Storage
    if (updated.length > 0) {
        localStorage.setItem('survey_submissions', JSON.stringify(updated));
    } else {
        localStorage.removeItem('survey_submissions');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      
      {view === 'form' && (
        <SurveyForm 
            onSubmit={handleSubmission} 
            onOpenAdmin={() => setView('admin')} 
        />
      )}

      {view === 'success' && (
        <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full border border-slate-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Vielen Dank!</h2>
            <p className="text-slate-600 mb-8 text-lg">
              Deine Antworten wurden lokal gespeichert.
            </p>
            <div className="flex flex-col gap-3">
                <button 
                onClick={() => setView('form')}
                className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                Neue Antwort erfassen
                </button>
                <button 
                onClick={() => setView('admin')}
                className="w-full py-3 px-6 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                Zum Admin Dashboard (Export)
                </button>
            </div>
          </div>
        </div>
      )}

      {view === 'admin' && (
        <AdminDashboard 
          submissions={submissions}
          onDelete={handleDelete}
          onBack={() => setView('form')}
        />
      )}
    </div>
  );
}