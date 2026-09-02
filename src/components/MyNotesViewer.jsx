import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Trash2, Eye, FileText, Image as ImageIcon, Video, Mic, 
  Play, Pause, Edit3, X, Plus, AlertCircle, Check, Volume2, Film 
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { saveFileLocally, getFileLocally } from '../utils/localDB';

export default function MyNotesViewer({ chapterId, chapterTitle }) {
  const { userNotes, saveUserNote, deleteUserNote, renameUserNote } = useStudy();
  const fileInputRef = useRef(null);

  const [activeAccept, setActiveAccept] = useState('image/*,.pdf,video/*,audio/*');
  const [activePreviewNote, setActivePreviewNote] = useState(null);
  const [renamingNote, setRenamingNote] = useState(null);
  const [newTitleText, setNewTitleText] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [loadedFiles, setLoadedFiles] = useState({});

  const audioRefs = useRef({});

  const chapterNotes = userNotes[chapterId] || [];

  useEffect(() => {
    // Asynchronously load note media from device-local IndexedDB
    chapterNotes.forEach((note) => {
      if (!loadedFiles[note.id]) {
        if (note.fileData) {
          setLoadedFiles((prev) => ({ ...prev, [note.id]: note.fileData }));
        } else {
          getFileLocally(note.id).then((data) => {
            if (data) {
              setLoadedFiles((prev) => ({ ...prev, [note.id]: data }));
            }
          });
        }
      }
    });
  }, [chapterNotes]);

  const handleUploadClick = (acceptFormat = 'image/*,.pdf,video/*,audio/*') => {
    setActiveAccept(acceptFormat);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 50);
  };

  const detectFileType = (file) => {
    const mime = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/.test(name)) return 'image';
    if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
    if (mime.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/.test(name)) return 'video';
    if (mime.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg)$/.test(name)) return 'audio';
    return 'pdf';
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorMessage(null);

    files.forEach((file) => {
      // 5MB browser storage safety cap per file
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setErrorMessage(
          `"${file.name}" exceeds the 5MB local storage limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please select a smaller file or compressed media.`
        );
        return;
      }

      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const fileData = event.target.result;
          const fileType = detectFileType(file);
          const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

          // Save binary payload to device-local IndexedDB
          await saveFileLocally(noteId, fileData);

          const newNote = {
            id: noteId,
            chapterId,
            fileName: file.name,
            displayName: file.name,
            fileType,
            uploadedAt: new Date().toLocaleString([], {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          };

          setLoadedFiles((prev) => ({ ...prev, [noteId]: fileData }));
          saveUserNote(chapterId, newNote);
        } catch (err) {
          setErrorMessage('Error saving file locally on device. Please check free space.');
        }
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Audio Playback Handler
  const toggleAudioPlay = (noteId) => {
    const audioEl = audioRefs.current[noteId];
    if (!audioEl) return;

    if (playingAudioId === noteId) {
      audioEl.pause();
      setPlayingAudioId(null);
    } else {
      // Pause any currently playing audio
      if (playingAudioId && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId].pause();
      }
      audioEl.play();
      setPlayingAudioId(noteId);
    }
  };

  const handleAudioTimeUpdate = (noteId, e) => {
    const el = e.target;
    if (el.duration) {
      setAudioProgress((prev) => ({
        ...prev,
        [noteId]: {
          currentTime: el.currentTime,
          duration: el.duration,
          percent: Math.round((el.currentTime / el.duration) * 100)
        }
      }));
    }
  };

  const handleAudioEnded = (noteId) => {
    if (playingAudioId === noteId) {
      setPlayingAudioId(null);
    }
  };

  const formatAudioTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Rename Handlers
  const handleOpenRename = (note) => {
    setRenamingNote(note);
    setNewTitleText(note.displayName || note.fileName);
  };

  const handleSaveRename = () => {
    if (renamingNote && newTitleText.trim()) {
      renameUserNote(chapterId, renamingNote.id, newTitleText.trim());
      setRenamingNote(null);
      setNewTitleText('');
    }
  };

  return (
    <div className="space-y-5">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={activeAccept}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Storage Alert Error Banner */}
      {errorMessage && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 p-4 rounded-xl flex items-start justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Upload Action Header */}
      <div className="academic-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200 dark:border-[#1E2E46]">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Personal Chapter Notes
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9AA9BC] mt-0.5">
            Add Images, PDFs, Videos, or Voice Notes for <span className="font-medium text-slate-700 dark:text-slate-300">{chapterTitle}</span>.
          </p>
        </div>

        {/* Quick Upload Button & Format Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleUploadClick('image/*,.pdf,video/*,audio/*')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-[#315E8C] dark:bg-[#3B76B2] text-white rounded-xl text-xs font-semibold hover:bg-[#25496F] transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Notes</span>
          </button>
        </div>
      </div>

      {/* Format Category Quick Pickers */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => handleUploadClick('image/*')}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E2E46] bg-white dark:bg-[#101C2D] text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-50 dark:hover:bg-[#142238] flex items-center gap-1.5 font-semibold shrink-0"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#315E8C] dark:text-[#3B76B2]" /> + Image
        </button>
        <button
          onClick={() => handleUploadClick('.pdf')}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E2E46] bg-white dark:bg-[#101C2D] text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-50 dark:hover:bg-[#142238] flex items-center gap-1.5 font-semibold shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-rose-500" /> + PDF
        </button>
        <button
          onClick={() => handleUploadClick('video/*')}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E2E46] bg-white dark:bg-[#101C2D] text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-50 dark:hover:bg-[#142238] flex items-center gap-1.5 font-semibold shrink-0"
        >
          <Film className="w-3.5 h-3.5 text-purple-500" /> + Video
        </button>
        <button
          onClick={() => handleUploadClick('audio/*')}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E2E46] bg-white dark:bg-[#101C2D] text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-50 dark:hover:bg-[#142238] flex items-center gap-1.5 font-semibold shrink-0"
        >
          <Mic className="w-3.5 h-3.5 text-[#3E7C78] dark:text-[#4FA19B]" /> + Voice / Audio
        </button>
      </div>

      {/* Main Notes Grid / Empty State */}
      {chapterNotes.length === 0 ? (
        <div className="academic-card p-8 sm:p-12 text-center space-y-3 max-w-md mx-auto my-4 border border-slate-200 dark:border-[#1E2E46]">
          <div className="w-14 h-14 bg-slate-100 dark:bg-[#142238] text-slate-500 dark:text-[#9AA9BC] rounded-2xl flex items-center justify-center mx-auto shadow-2xs border border-slate-200/60 dark:border-[#1E2E46]">
            <FileText className="w-7 h-7 text-[#315E8C] dark:text-[#4FA19B]" />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              No personal notes yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#9AA9BC] max-w-xs mx-auto leading-relaxed font-medium">
              Upload your handwritten images, PDFs, videos, or voice notes for this chapter.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleUploadClick('image/*,.pdf,video/*,audio/*')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#315E8C] dark:bg-[#3B76B2] text-white rounded-xl text-xs font-semibold hover:bg-[#25496F] shadow-xs"
            >
              <Plus className="w-4 h-4" /> Upload Notes
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {chapterNotes.map((note) => {
            const displayName = note.displayName || note.fileName;

            // Render Audio / Voice Note Card
            if (note.fileType === 'audio') {
              const isPlaying = playingAudioId === note.id;
              const prog = audioProgress[note.id] || { currentTime: 0, duration: 0, percent: 0 };

              return (
                <div
                  key={note.id}
                  className="academic-card p-4 space-y-3 flex flex-col justify-between border-l-4 border-l-[#3E7C78] dark:border-l-[#4FA19B] border-slate-200 dark:border-[#1E2E46]"
                >
                  <audio
                    ref={(el) => (audioRefs.current[note.id] = el)}
                    src={loadedFiles[note.id] || note.fileData}
                    onTimeUpdate={(e) => handleAudioTimeUpdate(note.id, e)}
                    onEnded={() => handleAudioEnded(note.id)}
                    className="hidden"
                  />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#3E7C78]/10 dark:bg-[#4FA19B]/20 text-[#3E7C78] dark:text-[#4FA19B] border border-[#3E7C78]/20 dark:border-[#4FA19B]/30 flex items-center gap-1">
                        <Mic className="w-3 h-3" /> Voice Note
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenRename(note)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#142238]"
                          title="Rename Note"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteUserNote(chapterId, note.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#142238]"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-xs leading-snug line-clamp-2" title={displayName}>
                      {displayName}
                    </h5>
                    <p className="text-[10px] text-slate-400 dark:text-[#9AA9BC] mt-0.5">
                      {note.uploadedAt}
                    </p>
                  </div>

                  {/* Audio Controls & Quick Play */}
                  <div className="bg-slate-50 dark:bg-[#08111F]/60 p-3 rounded-xl border border-slate-200/60 dark:border-[#1E2E46] space-y-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAudioPlay(note.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-transform active:scale-95 ${
                          isPlaying ? 'bg-[#3E7C78] hover:bg-[#315E8C]' : 'bg-[#315E8C] dark:bg-[#3B76B2] text-white'
                        }`}
                        title={isPlaying ? 'Pause Voice Note' : 'Play Voice Note'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="w-full bg-slate-200 dark:bg-[#142238] h-1.5 rounded-full overflow-hidden mb-1">
                          <div
                            className="bg-[#3E7C78] dark:bg-[#4FA19B] h-full transition-all duration-200"
                            style={{ width: `${prog.percent || 0}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-[#9AA9BC]">
                          <span>{formatAudioTime(prog.currentTime)}</span>
                          <span>{formatAudioTime(prog.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Render Standard Card for Image, PDF, and Video
            return (
              <div
                key={note.id}
                className="academic-card p-4 flex flex-col justify-between space-y-3 group hover:border-slate-300 dark:hover:border-[#1E2E46] transition-all border border-slate-200 dark:border-[#1E2E46]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      note.fileType === 'pdf'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        : note.fileType === 'video'
                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                        : 'bg-[#315E8C]/10 dark:bg-[#3B76B2]/20 text-[#315E8C] dark:text-[#4FA19B]'
                    }`}>
                      {note.fileType.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenRename(note)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#142238]"
                        title="Rename Note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteUserNote(chapterId, note.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#142238]"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail / Media Container */}
                  <div 
                    onClick={() => setActivePreviewNote(note)}
                    className="w-full h-36 bg-slate-100 dark:bg-[#08111F] rounded-xl overflow-hidden border border-slate-200 dark:border-[#1E2E46] flex items-center justify-center cursor-pointer relative group/thumb mb-3"
                  >
                    {note.fileType === 'image' ? (
                      <img
                        src={loadedFiles[note.id] || note.fileData}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
                      />
                    ) : note.fileType === 'video' ? (
                      <div className="w-full h-full relative bg-[#08111F] flex items-center justify-center">
                        <video src={loadedFiles[note.id] || note.fileData} className="w-full h-full object-cover opacity-60" />
                        <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500 dark:text-[#9AA9BC]">
                        <FileText className="w-10 h-10 text-rose-500 mb-1" />
                        <span className="text-[11px] font-semibold truncate max-w-[140px]">{displayName}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-[#08111F]/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]">
                      {note.fileType === 'video' ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{note.fileType === 'video' ? 'Play Video' : 'Open Note'}</span>
                    </div>
                  </div>

                  {/* Note Meta Title & Date */}
                  <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate" title={displayName}>
                    {displayName}
                  </h5>
                  <p className="text-[10px] text-slate-400 dark:text-[#9AA9BC] mt-0.5">
                    Uploaded {note.uploadedAt}
                  </p>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#1E2E46] flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActivePreviewNote(note)}
                    className="inline-flex items-center gap-1 font-semibold text-[#315E8C] dark:text-[#4FA19B] hover:underline"
                  >
                    {note.fileType === 'video' ? <Play className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{note.fileType === 'video' ? 'Play Video' : 'Open Note'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenRename(note)}
                    className="text-slate-500 dark:text-[#9AA9BC] hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    Rename
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rename Modal Overlay */}
      {renamingNote && (
        <div className="fixed inset-0 z-50 bg-[#08111F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101C2D] border border-slate-200 dark:border-[#1E2E46] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Rename Note</h4>
              <button
                onClick={() => setRenamingNote(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-[#9AA9BC]">Title / Display Name</label>
              <input
                type="text"
                value={newTitleText}
                onChange={(e) => setNewTitleText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                placeholder="Enter custom title..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#08111F] border border-slate-200 dark:border-[#1E2E46] rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#315E8C]"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setRenamingNote(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-[#1E2E46] text-xs font-semibold text-slate-700 dark:text-[#9AA9BC] hover:bg-slate-50 dark:hover:bg-[#142238]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="flex-1 py-2 rounded-xl bg-[#315E8C] dark:bg-[#3B76B2] text-white text-xs font-semibold hover:bg-[#25496F]"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen / Media Preview Modal */}
      {activePreviewNote && (
        <div className="fixed inset-0 z-50 bg-[#08111F]/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-[#101C2D] border border-slate-200 dark:border-[#1E2E46] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-[#1E2E46] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate max-w-md">
                  {activePreviewNote.displayName || activePreviewNote.fileName}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-[#9AA9BC] font-medium">
                  {activePreviewNote.fileType.toUpperCase()} • Uploaded {activePreviewNote.uploadedAt}
                </p>
              </div>

              <button
                onClick={() => setActivePreviewNote(null)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#142238]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 p-4 overflow-auto bg-slate-100 dark:bg-[#08111F] flex items-center justify-center min-h-[400px]">
              {activePreviewNote.fileType === 'image' ? (
                <img
                  src={loadedFiles[activePreviewNote.id] || activePreviewNote.fileData}
                  alt={activePreviewNote.displayName || activePreviewNote.fileName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
                />
              ) : activePreviewNote.fileType === 'video' ? (
                <video
                  src={loadedFiles[activePreviewNote.id] || activePreviewNote.fileData}
                  controls
                  autoPlay
                  className="max-w-full max-h-[70vh] rounded-lg shadow-sm"
                />
              ) : (
                <iframe
                  src={loadedFiles[activePreviewNote.id] || activePreviewNote.fileData}
                  title={activePreviewNote.displayName || activePreviewNote.fileName}
                  className="w-full h-[70vh] border-0 rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
