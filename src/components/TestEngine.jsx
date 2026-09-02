import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, RotateCcw, Award, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export default function TestEngine({ chapterId, testData }) {
  const { testScores, recordTestResult } = useStudy();

  if (!testData || !testData.questions || testData.questions.length === 0) {
    return (
      <div className="academic-card p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto my-6 border border-slate-200 dark:border-[#1E2E46] flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#142238] flex items-center justify-center text-3xl border border-slate-200/60 dark:border-[#1E2E46] shadow-2xs">
          🧪
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#315E8C] dark:text-[#4FA19B]">
            Test
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Coming Soon
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#9AA9BC] max-w-xs leading-relaxed font-medium">
          Chapter test will be available here soon.
        </p>
      </div>
    );
  }

  const [testState, setTestState] = useState('intro'); // 'intro' | 'active' | 'review'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((testData.durationMinutes || 10) * 60);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Live Timer Countdown Hook during test execution
  useEffect(() => {
    let timer = null;
    if (testState === 'active' && !showSubmitConfirm) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            calculateAndSaveScore();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [testState, showSubmitConfirm]);

  const handleStartTest = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeftSeconds(testData.durationMinutes * 60);
    setShowSubmitConfirm(false);
    setTestState('active');
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateAndSaveScore = () => {
    let correctCount = 0;
    const questions = testData.questions;

    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercent >= testData.passingScore;

    const result = {
      score: scorePercent,
      correctCount,
      totalQuestions: questions.length,
      passed,
      selectedAnswers
    };

    recordTestResult(chapterId, result);
    setSubmittedResult(result);
    setShowSubmitConfirm(false);
    setTestState('review');
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const previousResult = testScores[chapterId];

  // 1. INTRO / START SCREEN
  if (testState === 'intro') {
    return (
      <div className="academic-card p-6 sm:p-8 space-y-6 text-center max-w-xl mx-auto border border-slate-200 dark:border-[#1E2E46]">
        <div className="w-14 h-14 bg-slate-100 dark:bg-[#142238] rounded-2xl flex items-center justify-center mx-auto text-[#315E8C] dark:text-[#4FA19B] border border-slate-200/60 dark:border-[#1E2E46]">
          <Award className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {testData.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9AA9BC] mt-1 font-medium">
            Chapter Assessment • Board Pattern MCQs
          </p>
        </div>

        {previousResult && (
          <div className={`p-4 rounded-xl border text-left flex items-center justify-between ${
            previousResult.passed 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200' 
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
          }`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9AA9BC]">Your Saved High Score</p>
              <p className="text-lg font-bold">
                {previousResult.score}% ({previousResult.correctCount}/{previousResult.totalQuestions} Correct)
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
              previousResult.passed ? 'bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100' : 'bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100'
            }`}>
              {previousResult.passed ? 'PASSED' : 'NEEDS RETRY'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 pt-2 text-center">
          <div className="bg-slate-50 dark:bg-[#08111F]/60 p-3 rounded-xl border border-slate-200/60 dark:border-[#1E2E46]">
            <span className="text-[11px] text-slate-500 dark:text-[#9AA9BC] font-medium block">Questions</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{testData.totalQuestions}</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#08111F]/60 p-3 rounded-xl border border-slate-200/60 dark:border-[#1E2E46]">
            <span className="text-[11px] text-slate-500 dark:text-[#9AA9BC] font-medium block">Time Limit</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{testData.durationMinutes} mins</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#08111F]/60 p-3 rounded-xl border border-slate-200/60 dark:border-[#1E2E46]">
            <span className="text-[11px] text-slate-500 dark:text-[#9AA9BC] font-medium block">Passing</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">{testData.passingScore}%</span>
          </div>
        </div>

        <button
          onClick={handleStartTest}
          className="w-full py-3.5 bg-[#315E8C] dark:bg-[#3B76B2] text-white rounded-xl text-sm font-semibold hover:bg-[#25496F] dark:hover:bg-[#25496F] transition-transform active:scale-[0.99]"
        >
          {previousResult ? 'Retake Practice Test' : 'Start Practice Test'}
        </button>
      </div>
    );
  }

  // 2. ACTIVE TEST RUNNER
  if (testState === 'active') {
    const currentQ = testData.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === testData.questions.length - 1;
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
      <div className="space-y-4 max-w-xl mx-auto relative">
        {/* Submit Confirmation Overlay Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-[#08111F]/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#101C2D] border border-slate-200 dark:border-[#1E2E46] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-center">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-200/60 dark:border-amber-800/40">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Submit Test Now?</h4>
                <p className="text-xs text-slate-500 dark:text-[#9AA9BC] mt-1">
                  You have answered <span className="font-bold text-slate-900 dark:text-slate-100">{answeredCount}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{testData.questions.length}</span> questions.
                  {answeredCount < testData.questions.length && (
                    <span className="block text-amber-600 dark:text-amber-400 font-semibold mt-1">
                      Warning: {testData.questions.length - answeredCount} unanswered question(s) will be marked incorrect.
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2E46] text-xs font-semibold text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-50 dark:hover:bg-[#142238]"
                >
                  Continue Test
                </button>
                <button
                  onClick={calculateAndSaveScore}
                  className="flex-1 py-2.5 rounded-xl bg-[#315E8C] dark:bg-[#3B76B2] text-white text-xs font-semibold hover:bg-[#25496F]"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Header with Timer */}
        <div className="academic-card p-3 flex items-center justify-between gap-3 border border-slate-200 dark:border-[#1E2E46]">
          <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
            <Clock className={`w-4 h-4 ${timeLeftSeconds < 120 ? 'text-red-500 animate-pulse' : 'text-slate-500 dark:text-[#9AA9BC]'}`} />
            <span className={timeLeftSeconds < 120 ? 'text-red-600 dark:text-red-400' : ''}>
              {formatTimer(timeLeftSeconds)}
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-500 dark:text-[#9AA9BC]">
            Question {currentQuestionIndex + 1} of {testData.questions.length}
          </span>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="px-3 py-1 bg-[#315E8C] dark:bg-[#3B76B2] text-white rounded-lg text-xs font-semibold hover:bg-[#25496F]"
          >
            Submit Test
          </button>
        </div>

        {/* Question Stepper Indicator Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {testData.questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCurrent = currentQuestionIndex === idx;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`flex-1 min-w-[32px] py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isCurrent
                    ? 'bg-[#315E8C] dark:bg-[#3B76B2] text-white'
                    : isAnswered
                    ? 'bg-[#3E7C78]/10 dark:bg-[#4FA19B]/20 text-[#3E7C78] dark:text-[#4FA19B] border border-[#3E7C78]/30 dark:border-[#4FA19B]/30'
                    : 'bg-slate-100 dark:bg-[#142238] text-slate-600 dark:text-[#9AA9BC] hover:bg-slate-200 dark:hover:bg-[#1E2E46]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="academic-card p-5 sm:p-6 space-y-5 border border-slate-200 dark:border-[#1E2E46]">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug">
            {currentQ.question}
          </h4>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-[#315E8C] dark:bg-[#3B76B2] text-white border-[#315E8C] dark:border-[#3B76B2] shadow-xs'
                      : 'bg-white dark:bg-[#101C2D] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#1E2E46] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg font-bold text-[11px] flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-[#142238] text-slate-700 dark:text-slate-300'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Question Navigation */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#1E2E46] pt-4 mt-6">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((i) => i - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E2E46] text-xs font-semibold text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-50 dark:hover:bg-[#142238] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-4 py-2 bg-[#3E7C78] dark:bg-[#4FA19B] text-white rounded-xl text-xs font-bold hover:bg-[#315E8C] shadow-xs"
              >
                Submit Test ({answeredCount}/{testData.questions.length})
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                className="flex items-center gap-1 px-4 py-2 bg-[#315E8C] dark:bg-[#3B76B2] text-white rounded-xl text-xs font-semibold hover:bg-[#25496F]"
              >
                Next Question <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. SCORE RESULT & DETAILED ANSWER REVIEW
  if (testState === 'review' && submittedResult) {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Score Header */}
        <div className={`academic-card p-6 text-center space-y-3 ${
          submittedResult.passed 
            ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30' 
            : 'border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
            submittedResult.passed ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
          }`}>
            <Award className="w-6 h-6" />
          </div>

          <div>
            <span className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-md ${
              submittedResult.passed ? 'bg-emerald-200 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200' : 'bg-amber-200 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200'
            }`}>
              {submittedResult.passed ? 'Test Passed!' : 'Needs Revision'}
            </span>

            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              {submittedResult.score}%
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#9AA9BC] font-medium">
              You answered {submittedResult.correctCount} out of {submittedResult.totalQuestions} questions correctly.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleStartTest}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#315E8C] dark:bg-[#3B76B2] text-white rounded-xl text-xs font-semibold hover:bg-[#25496F]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry Test
            </button>
          </div>
        </div>

        {/* Detailed Solutions Section */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#315E8C] dark:text-[#3B76B2]" /> Answer Key & Explanations
          </h4>

          {testData.questions.map((q, idx) => {
            const userChoice = submittedResult.selectedAnswers[q.id];
            const isAnswered = userChoice !== undefined;
            const isCorrect = isAnswered && userChoice === q.correctIndex;

            return (
              <div key={q.id} className="academic-card p-5 space-y-3 border border-slate-200 dark:border-[#1E2E46]">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-[#9AA9BC]">
                    Q{idx + 1}.
                  </span>
                  {!isAnswered ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-[#9AA9BC] bg-slate-100 dark:bg-[#142238] border border-slate-200 dark:border-[#1E2E46] px-2 py-0.5 rounded-md">
                      Unanswered
                    </span>
                  ) : isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 px-2 py-0.5 rounded-md">
                      <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" /> Incorrect
                    </span>
                  )}
                </div>

                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                  {q.question}
                </p>

                <div className="space-y-1.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isUserPick = userChoice === optIdx;
                    const isCorrectOpt = q.correctIndex === optIdx;

                    let optionBg = 'bg-slate-50 dark:bg-[#08111F]/60 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-[#1E2E46]';
                    if (isCorrectOpt) {
                      optionBg = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 font-semibold';
                    } else if (isUserPick && !isCorrect) {
                      optionBg = 'bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800 font-semibold';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${optionBg}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                        {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        {isUserPick && !isCorrect && <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="bg-slate-50 dark:bg-[#08111F]/60 p-3 rounded-lg border border-slate-200/60 dark:border-[#1E2E46] text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">Explanation:</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
