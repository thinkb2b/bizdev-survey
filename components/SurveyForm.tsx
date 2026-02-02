import React, { useState, useEffect } from 'react';
import { SURVEY_BLOCKS } from '../constants';
import { PersonalInfo, SurveySubmission, SurveyBlock } from '../types';
import { Save, ChevronRight, ChevronLeft, User, LayoutList } from 'lucide-react';

interface SurveyFormProps {
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

const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit, onOpenAdmin }) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    position: '',
    yearsInCompany: '',
    workingYears: ''
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Load draft from local storage
  useEffect(() => {
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
  }, []);

  // Save draft on change
  useEffect(() => {
    localStorage.setItem('survey_draft', JSON.stringify({ 
        personalInfo, 
        answers,
        step: currentStepIndex
    }));
  }, [personalInfo, answers, currentStepIndex]);

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validation for Personal Info (Step 0)
    if (currentStepIndex === 0) {
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
    const submission: SurveySubmission = {
      id: generateId(),
      timestamp: Date.now(),
      personalInfo,
      answers
    };

    onSubmit(submission);
    
    // Clear form and draft
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

      {/* Header / Intro (Only visible on Step 0) */}
      {currentStepIndex === 0 && (
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
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
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
                         className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                         value={personalInfo.firstName}
                         onChange={(e) => handleInfoChange('firstName', e.target.value)}
                         autoFocus
                     />
                 </div>
                 <div className="space-y-2">
                     <label className="block text-sm font-medium text-slate-700">Nachname <span className="text-red-500">*</span></label>
                     <input 
                         type="text" 
                         className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                         value={personalInfo.lastName}
                         onChange={(e) => handleInfoChange('lastName', e.target.value)}
                     />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                     <label className="block text-sm font-medium text-slate-700">Rolle / Position</label>
                     <input 
                         type="text" 
                         className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                         value={personalInfo.position}
                         onChange={(e) => handleInfoChange('position', e.target.value)}
                     />
                 </div>
                 <div className="space-y-2">
                     <label className="block text-sm font-medium text-slate-700">Zeit im Unternehmen</label>
                     <input 
                         type="text" 
                         placeholder="z.B. 3 Jahre oder 6 Monate"
                         className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                         value={personalInfo.yearsInCompany}
                         onChange={(e) => handleInfoChange('yearsInCompany', e.target.value)}
                     />
                 </div>
                 <div className="space-y-2">
                     <label className="block text-sm font-medium text-slate-700">Berufserfahrung (Gesamt)</label>
                     <input 
                         type="text" 
                         placeholder="z.B. 10 Jahre"
                         className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                                    placeholder="Deine Antwort..."
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
                    Antworten speichern
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