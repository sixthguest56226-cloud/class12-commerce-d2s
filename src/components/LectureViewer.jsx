import React, { useState } from 'react';
import { CheckCircle2, Clock, Tv, ExternalLink, PlayCircle } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

function extractYoutubeId(lectureItem) {
  if (!lectureItem) return '';
  if (lectureItem.youtubeId) return lectureItem.youtubeId;
  const url = lectureItem.youtubeUrl || '';
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0].split('&')[0];
  }
  if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1].split('&')[0];
  }
  return '';
}

export default function LectureViewer({ chapterId, lectureData }) {
  const { completedLectures, markLectureCompleted } = useStudy();
  const isCompleted = !!completedLectures[chapterId];

  // Support both single lecture object and multi-lecture array (for exercise-wise videos)
  const isMultiLecture = Array.isArray(lectureData?.lectures);
  const lecturesList = isMultiLecture ? lectureData.lectures : (lectureData ? [lectureData] : []);
  const hasLectures = lecturesList.length > 0;

  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeLecture = hasLectures ? lecturesList[selectedIndex] : null;

  const handleToggleComplete = () => {
    markLectureCompleted(chapterId, !isCompleted);
  };

  const videoId = extractYoutubeId(activeLecture);
  const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : '';
  const watchUrl = activeLecture?.youtubeUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#');
  const provider = activeLecture?.provider || lectureData?.channel || 'YouTube Lecture';

  return (
    <div className="space-y-4">
      {/* Exercise-wise Video Selection Bar (when multiple lectures/exercises are present) */}
      {isMultiLecture && hasLectures && (
        <div className="academic-card p-2 flex items-center gap-2 overflow-x-auto bg-slate-100 dark:bg-[#08111F] border-slate-200 dark:border-[#1E2E46] text-xs">
          <span className="font-semibold text-slate-500 dark:text-[#9AA9BC] px-2 shrink-0">
            Exercises:
          </span>
          {lecturesList.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const hasVideo = !!item.youtubeUrl;

            return (
              <button
                key={item.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`shrink-0 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-[#315E8C] dark:bg-[#3B76B2] text-white shadow-2xs'
                    : hasVideo
                    ? 'bg-white dark:bg-[#142238] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2E46] border border-slate-200/60 dark:border-[#1E2E46]'
                    : 'bg-slate-200/60 dark:bg-[#142238]/50 text-slate-400 dark:text-slate-500 hover:text-slate-700'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>{item.title || item.exerciseNumber}</span>
                {!hasVideo && (
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-300 dark:bg-[#1E2E46] text-slate-600 dark:text-slate-400 font-bold">
                    Pending
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Video Container (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video bg-[#08111F] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-[#1E2E46]">
        {videoId ? (
          <iframe
            src={embedUrl}
            title={activeLecture?.title || 'Video Lecture'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#101C2D] border border-[#1E2E46] flex items-center justify-center text-slate-500">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-200">
                {!hasLectures ? 'No Green Board lectures added yet.' : 'Video not added yet'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-0.5 leading-relaxed">
                {!hasLectures
                  ? 'Verified Green Board lecture links for this chapter have not been added to the database yet.'
                  : `Verified Green Board link for ${activeLecture?.exerciseNumber || activeLecture?.title} has not been added to the database yet.`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lecture Meta & Action */}
      <div className="academic-card p-4.5 space-y-3 border border-slate-200 dark:border-[#1E2E46]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#315E8C]/10 dark:bg-[#3B76B2]/20 text-[#315E8C] dark:text-[#4FA19B] border border-[#315E8C]/20 dark:border-[#3B76B2]/30">
                {provider}
              </span>
              {activeLecture?.exerciseNumber && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#142238] text-slate-700 dark:text-[#9AA9BC] border border-slate-200/60 dark:border-[#1E2E46]">
                  {activeLecture.exerciseNumber}
                </span>
              )}
            </div>

            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg mt-1 leading-snug">
              {activeLecture?.title || lectureData?.title || 'Chapter Video Lectures'}
            </h3>
          </div>

          <button
            onClick={handleToggleComplete}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-2xs ${
              isCompleted
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                : 'bg-[#315E8C] dark:bg-[#3B76B2] text-white hover:bg-[#25496F] dark:hover:bg-[#25496F]'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} />
            <span>{isCompleted ? 'Completed' : 'Mark as Completed'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#9AA9BC] font-medium pt-2 border-t border-slate-100 dark:border-[#1E2E46]">
          {activeLecture?.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Duration: {activeLecture.duration}</span>
            </div>
          )}

          {watchUrl !== '#' && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#315E8C] dark:text-[#4FA19B] hover:underline font-medium ml-auto"
            >
              <span>Open on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {(activeLecture?.description || lectureData?.description) && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#08111F]/60 p-3 rounded-lg border border-slate-100 dark:border-[#1E2E46]">
            {activeLecture?.description || lectureData?.description}
          </p>
        )}
      </div>
    </div>
  );
}
