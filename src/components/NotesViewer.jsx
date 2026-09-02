import React, { useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';

export default function NotesViewer({ notesData }) {
  const [fontSize, setFontSize] = useState('base'); // 'sm', 'base', 'lg'
  const [viewMode, setViewMode] = useState('text'); // 'text' | 'pdf'

  if (!notesData || !notesData.sections || notesData.sections.length === 0) {
    return (
      <div className="academic-card p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto my-6 border border-slate-200 dark:border-[#1E2E46] flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#142238] flex items-center justify-center text-3xl border border-slate-200/60 dark:border-[#1E2E46] shadow-2xs">
          📝
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#315E8C] dark:text-[#4FA19B]">
            Notes
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Coming Soon
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#9AA9BC] max-w-xs leading-relaxed font-medium">
          Chapter notes will be available here soon.
        </p>
      </div>
    );
  }

  const fontSizeClasses = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-loose'
  };

  return (
    <div className="space-y-4">
      {/* Control Header */}
      <div className="academic-card p-3 flex items-center justify-between gap-3 border border-slate-200 dark:border-[#1E2E46]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'text'
                ? 'bg-[#315E8C] dark:bg-[#3B76B2] text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-[#142238] text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-200 dark:hover:bg-[#1E2E46]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reading Notes</span>
          </button>
          
          <button
            onClick={() => setViewMode('pdf')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'pdf'
                ? 'bg-[#315E8C] dark:bg-[#3B76B2] text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-[#142238] text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-200 dark:hover:bg-[#1E2E46]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>PDF Viewer</span>
          </button>
        </div>

        {/* Font size controls (Text mode only) */}
        {viewMode === 'text' && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#08111F] p-1 rounded-lg border border-slate-200/60 dark:border-[#1E2E46]">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                fontSize === 'sm' ? 'bg-white dark:bg-[#142238] text-[#315E8C] dark:text-[#4FA19B] shadow-2xs' : 'text-slate-500 dark:text-[#9AA9BC]'
              }`}
              title="Smaller font"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                fontSize === 'base' ? 'bg-white dark:bg-[#142238] text-[#315E8C] dark:text-[#4FA19B] shadow-2xs' : 'text-slate-500 dark:text-[#9AA9BC]'
              }`}
              title="Default font"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                fontSize === 'lg' ? 'bg-white dark:bg-[#142238] text-[#315E8C] dark:text-[#4FA19B] shadow-2xs' : 'text-slate-500 dark:text-[#9AA9BC]'
              }`}
              title="Larger font"
            >
              A+
            </button>
          </div>
        )}
      </div>

      {/* Main Content View */}
      {viewMode === 'text' ? (
        <div className="academic-card p-5 sm:p-6 space-y-6 border border-slate-200 dark:border-[#1E2E46]">
          <div className="border-b border-slate-100 dark:border-[#1E2E46] pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {notesData.title}
            </h2>
            <p className="text-xs text-slate-400 dark:text-[#9AA9BC] mt-1 font-medium">
              Class 12 Academic Notes • CBSE / State Board Compliant
            </p>
          </div>

          {notesData.sections.map((sec, idx) => (
            <section key={idx} className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#315E8C] dark:bg-[#3B76B2] rounded-full inline-block" />
                {sec.heading}
              </h3>
              
              <div 
                className={`text-slate-700 dark:text-slate-300 font-normal whitespace-pre-line ${fontSizeClasses[fontSize]}`}
              >
                {sec.content}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="academic-card p-4 space-y-3 border border-slate-200 dark:border-[#1E2E46]">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#9AA9BC]">
            <span className="font-semibold">Official Board Notes PDF</span>
            {notesData.pdfUrl && (
              <a
                href={notesData.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#315E8C] dark:text-[#4FA19B] hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </a>
            )}
          </div>

          <div className="w-full h-[550px] bg-slate-100 dark:bg-[#08111F] rounded-xl overflow-hidden border border-slate-200 dark:border-[#1E2E46] flex items-center justify-center">
            {notesData.pdfUrl ? (
              <iframe
                src={notesData.pdfUrl}
                title="Notes PDF Viewer"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="text-center p-6 text-slate-500 dark:text-[#9AA9BC]">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                <p className="text-sm font-medium">PDF preview container. Add your custom PDF link in data JSON.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
