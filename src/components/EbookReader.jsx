import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, Globe, Info } from 'lucide-react';

export default function EbookReader({ ebookData }) {
  const ncertTitle = ebookData?.ncertBook || 'NCERT Accountancy — Class XII';
  const portalUrl = ebookData?.readOnlineUrl || ebookData?.portalUrl || 'https://ncert.nic.in/textbook.php';
  const partNumber = ncertTitle.includes('Part II') ? 'Part II' : 'Part I';
  const coverageScope = partNumber === 'Part II' 
    ? 'Company Accounts, Issue of Share Capital & Debentures, Financial Statement Analysis, and Cash Flow Statement.'
    : 'Partnership Accounts, Basic Concepts, Admission, Retirement/Death, and Dissolution of Partnership Firm.';

  return (
    <div className="space-y-5">
      {/* Official NCERT Copyright Compliant Resource Card */}
      <div className="academic-card p-6 sm:p-8 border-l-4 border-l-[#315E8C] dark:border-l-[#3B76B2] bg-white dark:bg-[#101C2D] border border-slate-200 dark:border-[#1E2E46] space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#315E8C]/10 dark:bg-[#3B76B2]/20 text-[#315E8C] dark:text-[#4FA19B] border border-[#315E8C]/20 dark:border-[#3B76B2]/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Official NCERT Textbook
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#142238] text-slate-600 dark:text-[#9AA9BC] border border-slate-200/60 dark:border-[#1E2E46]">
                Source: ncert.nic.in
              </span>
            </div>

            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-2xl pt-1">
              NCERT Textbook Reader
            </h3>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {ncertTitle}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#315E8C]/10 dark:bg-[#3B76B2]/20 text-[#315E8C] dark:text-[#4FA19B] flex items-center justify-center shrink-0 border border-[#315E8C]/20 dark:border-[#3B76B2]/30">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Chapter Mapping Scope */}
        <div className="bg-slate-50 dark:bg-[#08111F]/60 p-4 rounded-xl border border-slate-200/60 dark:border-[#1E2E46] text-xs text-slate-600 dark:text-[#9AA9BC] space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
            <Info className="w-4 h-4 text-[#315E8C] dark:text-[#3B76B2]" />
            <span>Curriculum Mapping</span>
          </div>
          <p>
            This chapter is covered under <strong className="text-slate-800 dark:text-slate-200">{ncertTitle}</strong> ({coverageScope}).
          </p>
        </div>

        {/* Copyright Notice Banner */}
        <p className="text-xs text-slate-500 dark:text-[#9AA9BC] leading-relaxed italic">
          Note: To comply with official NCERT copyright guidelines, textbook pages are not stored, reproduced, or embedded inside this application. All textbook materials belong to NCERT and can be accessed directly on the official portal.
        </p>

        {/* Direct Action Button */}
        <div className="pt-2">
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-[#315E8C] dark:bg-[#3B76B2] text-white rounded-xl text-xs font-bold hover:bg-[#25496F] dark:hover:bg-[#25496F] transition-transform active:scale-95 shadow-2xs"
          >
            <Globe className="w-4 h-4" />
            <span>Visit NCERT Textbook Portal →</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
}
