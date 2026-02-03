import React, { useState, useEffect } from 'react';
import { SURVEY_BLOCKS } from '../constants';
import { PersonalInfo, SurveySubmission, SurveyBlock } from '../types';
import { Save, ChevronRight, ChevronLeft, User, LayoutList, Lock, Unlock } from 'lucide-react';

interface SurveyFormProps {
  initialData: SurveySubmission | null;
  onSubmit: (submission: SurveySubmission) => void;
  onOpenAdmin: () => void;
}

// Combine Personal Info as Step 0 and Blocks as Steps 1..N
type WizardStep = {
    type: 'personal';
    title: string;
} | {
    type: 'block';
    data: SurveyBlock;
};

const STEPS: WizardStep[] = [
    { type: 'personal', title: 'Persönliche Angaben' },
    ...SURVEY_BLOCKS.map(b => ({ type: 'block' as const, data: b }))
];

// Safer random ID generator that works in all contexts (including non-secure HTTP)
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const SurveyForm: React.FC<SurveyFormProps> = ({ initialData, onSubmit, onOpenAdmin }) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    position: '',
    yearsInCompany: '',
    workingYears: ''
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Logic for Edit Mode
  // If initialData exists, we start in read-only mode.
  const [isReadOnly, setIsReadOnly] = useState<boolean>(!!initialData);

  // Initialize form with existing data or load draft
  useEffect(() => {
    if (initialData) {
        // Load existing submission
        setPersonalInfo(initialData.personalInfo);
        setAnswers(initialData.answers);
        setIsReadOnly(true);
        setCurrentStepIndex(0);
    } else {
        // Load draft from local storage ONLY if not editing an existing record
        const saved = localStorage.getItem('survey_draft');
        if (saved) {
            try {
                const { personalInfo: savedPi, answers: savedAns, step } = JSON.parse(saved);
                if (savedPi) setPersonalInfo(savedPi);
                if (savedAns) setAnswers(savedAns);
                if (typeof step === 'number') setCurrentStepIndex(step);
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }
  }, [initialData]);

  // Save draft on change (only if NEW survey)
  useEffect(() => {
    if (!initialData) {
        localStorage.setItem('survey_draft', JSON.stringify({ 
            personalInfo, 
            answers,
            step: currentStepIndex
        }));
    }
  }, [personalInfo, answers, currentStepIndex, initialData]);

  const handleAnswerChange = (id: string, value: string) => {
    if (isReadOnly) return;
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleInfoChange = (field: keyof PersonalInfo, value: string) => {
    if (isReadOnly) return;
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validation for Personal Info (Step 0)
    // Only validate if editing is enabled (if readonly, we assume data is valid)
    if (!isReadOnly && currentStepIndex === 0) {
        if (!personalInfo.firstName.trim() || !personalInfo.lastName.trim()) {
            alert("Bitte gib zumindest Vor- und Nachname an.");
            return;
        }
    }

    if (currentStepIndex < STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        window.scrollTo(0, 0);
    } else {
        handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
        setCurrentStepIndex(prev => prev - 1);
        window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    // In ReadOnly mode, "Save" just closes/finishes, but ideally we shouldn't even show "Save" unless edited?
    // For simplicity, let's allow re-saving (updating) if not read-only.
    
    if (isReadOnly) {
        // If simply viewing, clicking "Finish" effectively just calls submit with same data
        // or we could just alert. But better UX: if ReadOnly, maybe button says "Close"?
        // Current requirement: "Overwrite/Change via checkbox". 
        // We will stick to submit logic.
    }

    const submission: SurveySubmission = {
      // Keep ID if editing, else generate new
      id: initialData?.id || generateId(),
      // Update timestamp if editing? Let's keep original timestamp or update to now? 
      // Usually "Last Modified" is better, but for simplicity let's update timestamp so it bubbles to top of lists if sorted.
      timestamp: Date.now(),
      personalInfo,
      answers
    };

    onSubmit(submission);
    
    // Clear form and draft only if it was a new submission
    if (!initialData) {
        setPersonalInfo({
            firstName: '',
            lastName: '',
            position: '',
            yearsInCompany: '',
            workingYears: ''
        });
        setAnswers({});
        localStorage.removeItem('survey_draft');
        setCurrentStepIndex(0);
    }
    window.scrollTo(0,0);
  };

  const currentStep = STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      {/* Top Bar with Admin Link */}
      <div className="flex justify-between items-center text-sm text-slate-500">
        <div>Business Development Survey</div>
        <button type="button" onClick={onOpenAdmin} className="hover:text-blue-600 underline">
            Admin / Export
        </button>
      </div>

      {/* Edit Mode Toggle Banner */}
      {initialData && (
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${isReadOnly ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              <div className="flex items-center gap-3">
                  {isReadOnly ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  <div>
                    <div className="font-bold">
                        {isReadOnly ? 'Ansichtsmodus (Read-only)' : 'Bearbeitungsmodus aktiv'}
                    </div>
                    <div className="text-sm opacity-80">
                        {isReadOnly ? 'Um Daten zu ändern, aktiviere die Bearbeitung.' : 'Änderungen werden beim Speichern am Ende übernommen.'}
                    </div>
                  </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50">
                  <input 
                    type="checkbox" 
                    checked={!isReadOnly}
                    onChange={(e) => setIsReadOnly(!e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Bearbeitung aktivieren</span>
              </label>
          </div>
      )}

      {/* Header / Intro (Only visible on Step 0 AND if not editing) */}
      {currentStepIndex === 0 && !initialData && (
          <div className="space-y-4 text-center md:text-left animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Business Development &<br className="md:hidden"/> Produktinnovation
            </h1>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg text-blue-800 text-sm md:text-base leading-relaxed">
              <p className="font-semibold mb-2">Hinweis:</p>
              Dieser Fragebogen dient nicht der Bewertung einzelner Personen, sondern dem Aufbau eines gemeinsamen, wirksamen Business-Development- und Innovationsbereichs.
              Bitte beantworte die Fragen offen und ehrlich. Stichpunkte sind völlig ausreichend.
            </div>
          </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Schritt {currentStepIndex + 1} von {STEPS.length}</span>
            <span>{currentStep.type === 'personal' ? currentStep.title : currentStep.data.title}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content Area */}
      <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden min-h-[400px] flex flex-col transition-opacity ${isReadOnly ? 'opacity-90' : 'opacity-100'}`}>
        {/* Step Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${currentStep.type === 'personal' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                {currentStep.type === 'personal' ? <User size={20} /> : <LayoutList size={20} />}
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    {currentStep.type === 'personal' ? currentStep.title : currentStep.data.title}
                </h2>
                {currentStep.type === 'block' && currentStep.data.description && (
                    <p className="text-sm text-slate-500 mt-1">{currentStep.data.description}</p>
                )}
            </div>
        </div>

        {/* Step Body */}
        <div className="p-6 md:p-8 grow animate-fade-in">
            {currentStep.type === 'personal' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                     <label className="block text-sm font-medium text-slate-700">Vorname <span className="text-red-500">*</span></label>
                     <input 
                         type="text" 
                         disabled={isReadOnly}
                         className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                         value={personalInfo.firstName}
                         onChange={(e) => handleInfoChange('firstName', e.target.value)}
                         autoFocus={!isReadOnly}
                     />
                 </div>
                 <div className="space-y-2">
                     <label className="block text-sm font-medium text-slate-700">Nachname <span className="text-red-500">*</span></label>
                     <input 
                         type="text" 
                         disabled={isReadOnly}
                         className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                         value={personalInfo.lastName}
                         onChange={(e) => handleInfoChange('lastName', e.target.value)}
                     />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                     <label className="block text-sm font-medium text-slate-700">Rolle / Position</label>
                     <input 
                         type="text" 
                         disabled={isReadOnly}
                         className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                         value={personalInfo.position}
                         onChange={(e) => handleInfoChange('position', e.target.value)}
                     />
                 </div>
                 <div className="space-y-2">
                     <label className="block text-sm font-medium text-slate-700">Zeit im Unternehmen</label>
                     <input 
                         type="text" 
                         disabled={isReadOnly}
                         placeholder="z.B. 3 Jahre oder 6 Monate"
                         className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                         value={personalInfo.yearsInCompany}
                         onChange={(e) => handleInfoChange('yearsInCompany', e.target.value)}
                     />
                 </div>
                 <div className="space-y-2">
                     <label className="block text-sm font-medium text-slate-700">Berufserfahrung (Gesamt)</label>
                     <input 
                         type="text" 
                         disabled={isReadOnly}
                         placeholder="z.B. 10 Jahre"
                         className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                         value={personalInfo.workingYears}
                         onChange={(e) => handleInfoChange('workingYears', e.target.value)}
                     />
                 </div>
               </div>
            ) : (
                <div className="space-y-8">
                    {currentStep.data.questions.map((q) => {
                         if (q.type === 'header') {
                            return (
                                <div key={q.id} className="pt-6 border-t border-slate-100 first:border-0 first:pt-0">
                                    <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                        {q.text}
                                    </h3>
                                </div>
                            );
                        }
        
                        return (
                          <div key={q.id} className="space-y-3 group">
                            <label className="block text-base font-medium text-slate-800 group-hover:text-blue-700 transition-colors">
                              {q.text}
                            </label>
                            {q.helperText && (
                              <p className="text-sm text-slate-500 italic">{q.helperText}</p>
                            )}
                            
                            {q.type === 'select' ? (
                                <select
                                    disabled={isReadOnly}
                                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200 appearance-none' : 'bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                >
                                    <option value="">Bitte wählen...</option>
                                    {q.options?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <textarea
                                    disabled={isReadOnly}
                                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all min-h-[100px] ${isReadOnly ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                                    placeholder={isReadOnly ? "Keine Antwort" : "Deine Antwort..."}
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                />
                            )}
                          </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 z-50 flex items-center justify-between shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)]">
        <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStepIndex === 0 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
            <ChevronLeft className="w-5 h-5" />
            Zurück
        </button>

        <button
            type="button"
            onClick={handleNext}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-lg transform transition-all hover:-translate-y-0.5 ${
                currentStepIndex === STEPS.length - 1
                ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-200'
            }`}
        >
            {currentStepIndex === STEPS.length - 1 ? (
                <>
                    <Save className="w-5 h-5" />
                    {isReadOnly ? 'Schließen / Speichern' : 'Antworten speichern'}
                </>
            ) : (
                <>
                    Weiter
                    <ChevronRight className="w-5 h-5" />
                </>
            )}
        </button>
      </div>
    </div>
  );
};

export default SurveyForm;