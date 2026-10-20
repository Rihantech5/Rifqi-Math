import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Upload,
  Download,
  Search,
  CheckCircle2,
  Image as ImageIcon,
  BookOpen,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  ZoomIn,
} from 'lucide-react';
import { GradeLevel, Question, Subject } from '../types/game';
import { compressImageFile } from '../utils/imageCompressor';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

interface QuestionManagerModalProps {
  isOpen: boolean;
  questions: Question[];
  activeTopic: string;
  onUpdateQuestions: (newQuestions: Question[]) => void;
  onPlayTopic: (topic: string) => void;
  onClose: () => void;
  onOpenLightbox: (url: string, caption?: string) => void;
}

type TabType = 'list' | 'add_edit' | 'ai_generator' | 'import_export';

export const QuestionManagerModal: React.FC<QuestionManagerModalProps> = ({
  isOpen,
  questions,
  activeTopic,
  onUpdateQuestions,
  onPlayTopic,
  onClose,
  onOpenLightbox,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTopic, setFilterTopic] = useState('Semua');

  // Edit / Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSubject, setFormSubject] = useState<Subject>('Numerasi');
  const [formGrade, setFormGrade] = useState<GradeLevel>('Kelas 7');
  const [formTopic, setFormTopic] = useState('Aljabar');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageCaption, setFormImageCaption] = useState('');
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [formError, setFormError] = useState('');

  // AI Generator state
  const [aiSubject, setAiSubject] = useState<Subject>('Numerasi');
  const [aiGrade, setAiGrade] = useState<GradeLevel>('Kelas 8');
  const [aiTopic, setAiTopic] = useState('Geometri & Bangun Datar');
  const [aiCount, setAiCount] = useState<number>(3);
  const [aiDifficulty, setAiDifficulty] = useState<'Mudah' | 'Sedang' | 'Sulit (HOTS)'>('Sedang');
  const [aiPromptCustom, setAiPromptCustom] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<Question[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonImportRef = useRef<HTMLInputElement | null>(null);
  const csvImportRef = useRef<HTMLInputElement | null>(null);

  // In-app confirmation & toast notification states (Eliminates window.confirm/alert issues in iframes)
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((curr) => (curr?.text === text ? null : curr));
    }, 3500);
  };

  if (!isOpen) return null;

  const topicsList = ['Semua', ...Array.from(new Set(questions.map((q) => q.topic))).filter(Boolean)];

  // Filtered question list
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = filterTopic === 'Semua' || q.topic === filterTopic;
    return matchesSearch && matchesTopic;
  });

  const resetForm = () => {
    setEditingId(null);
    setFormSubject('Numerasi');
    setFormGrade('Kelas 7');
    setFormTopic('Aljabar');
    setFormQuestionText('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormImageUrl('');
    setFormImageCaption('');
    setFormError('');
  };

  const handleStartEdit = (q: Question) => {
    setEditingId(q.id);
    setFormSubject(q.subject);
    setFormGrade(q.grade);
    setFormTopic(q.topic);
    setFormQuestionText(q.questionText);
    setFormOptions([...q.options]);
    setFormCorrectIndex(q.correctIndex);
    setFormExplanation(q.explanation || '');
    setFormImageUrl(q.imageUrl || '');
    setFormImageCaption(q.imageCaption || '');
    setFormError('');
    setActiveTab('add_edit');
  };

  const handleDeleteRequest = (q: Question) => {
    if (questions.length <= 1) {
      showToast('Minimal harus ada 1 pertanyaan dalam bank soal.', 'error');
      return;
    }
    setDeleteTarget(q);
  };

  const executeDelete = () => {
    if (!deleteTarget) return;
    const next = questions.filter((q) => q.id !== deleteTarget.id);
    onUpdateQuestions(next);
    showToast('Pertanyaan berhasil dihapus dari bank soal.', 'success');
    setDeleteTarget(null);
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingImage(true);
      const compressedDataUrl = await compressImageFile(file, 800, 600, 0.85);
      setFormImageUrl(compressedDataUrl);
      if (!formImageCaption) {
        setFormImageCaption(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch {
      showToast('Gagal mengunggah dan mengompresi gambar.', 'error');
    } finally {
      setIsCompressingImage(false);
    }
  };

  // Save question (Add or Edit)
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestionText.trim()) {
      setFormError('Teks pertanyaan wajib diisi.');
      return;
    }
    if (formOptions.some((opt) => !opt.trim())) {
      setFormError('Semua 4 opsi jawaban (A, B, C, D) wajib diisi.');
      return;
    }

    const newQuestion: Question = {
      id: editingId || `custom-${Date.now()}`,
      subject: formSubject,
      grade: formGrade,
      topic: formTopic.trim() || formSubject,
      questionText: formQuestionText.trim(),
      options: formOptions.map((o) => o.trim()),
      correctIndex: formCorrectIndex,
      explanation: formExplanation.trim(),
      imageUrl: formImageUrl.trim() || undefined,
      imageCaption: formImageCaption.trim() || undefined,
    };

    if (editingId) {
      const next = questions.map((q) => (q.id === editingId ? newQuestion : q));
      onUpdateQuestions(next);
    } else {
      onUpdateQuestions([newQuestion, ...questions]);
    }

    resetForm();
    setActiveTab('list');
  };

  // AI Generator via server API endpoint `/api/gemini/generate-questions`
  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiSubject,
          grade: aiGrade,
          topic: aiTopic,
          count: aiCount,
          difficulty: aiDifficulty,
          instructions: aiPromptCustom,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted: Question[] = data.questions.map((q: Partial<Question>, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          subject: q.subject || aiSubject,
          grade: q.grade || aiGrade,
          topic: q.topic || aiTopic,
          questionText: q.questionText || '',
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
          correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
          explanation: q.explanation || 'Pembahasan langkah demi langkah terverifikasi.',
          imageUrl: q.imageUrl,
          imageCaption: q.imageCaption,
        }));
        setAiGeneratedQuestions(formatted);
      } else {
        throw new Error('Tidak ada format soal yang valid diterima dari AI.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Gagal menghubungi server Gemini AI.';
      setAiError(errMsg);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyAIGenerated = (playImmediately = false) => {
    if (aiGeneratedQuestions.length === 0) return;
    const next = [...aiGeneratedQuestions, ...questions];
    onUpdateQuestions(next);
    const targetTopic = aiGeneratedQuestions[0].topic;
    setAiGeneratedQuestions([]);
    if (playImmediately) {
      onPlayTopic(targetTopic);
      onClose();
    } else {
      setActiveTab('list');
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bank_soal_tarik_tambang_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['id', 'subject', 'grade', 'topic', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctIndex', 'explanation', 'imageUrl', 'imageCaption'];
    const rows = questions.map((q) => [
      q.id,
      q.subject,
      q.grade,
      q.topic,
      `"${q.questionText.replace(/"/g, '""')}"`,
      `"${q.options[0]?.replace(/"/g, '""') || ''}"`,
      `"${q.options[1]?.replace(/"/g, '""') || ''}"`,
      `"${q.options[2]?.replace(/"/g, '""') || ''}"`,
      `"${q.options[3]?.replace(/"/g, '""') || ''}"`,
      q.correctIndex,
      `"${(q.explanation || '').replace(/"/g, '""')}"`,
      `"${(q.imageUrl || '').replace(/"/g, '""')}"`,
      `"${(q.imageCaption || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `bank_soal_tarik_tambang_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onUpdateQuestions(parsed);
          showToast(`Berhasil mengimpor ${parsed.length} soal dari JSON!`, 'success');
          setActiveTab('list');
        } else {
          showToast('Format JSON tidak sesuai array soal.', 'error');
        }
      } catch {
        showToast('File JSON tidak valid atau rusak.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default questions
  const handleResetDefaults = () => {
    setIsResetConfirmOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Tabs */}
        <div className="flex flex-col gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Kelola Bank Soal &amp; Generator AI</h2>
                <p className="text-xs text-slate-500">
                  Total {questions.length} soal aktif • Literasi &amp; Numerasi SMP
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {[
              { id: 'list' as TabType, label: `Daftar Soal (${questions.length})`, icon: BookOpen },
              { id: 'add_edit' as TabType, label: editingId ? 'Edit Soal' : 'Tambah Soal Manual', icon: Plus },
              { id: 'ai_generator' as TabType, label: 'Generator Soal AI (Gemini)', icon: Sparkles },
              { id: 'import_export' as TabType, label: 'Impor & Ekspor', icon: Download },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'add_edit' && !editingId) resetForm();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: DAFTAR SOAL AKTIF */}
        {activeTab === 'list' && (
          <div className="flex flex-col gap-3 overflow-hidden flex-1">
            {/* Search & Topic Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kata kunci soal, topik, atau pembahasan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="w-full sm:w-44 px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {topicsList.map((t) => (
                  <option key={t} value={t}>
                    Topik: {t}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('add_edit');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Soal</span>
              </button>
            </div>

            {/* Questions List scroll container */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[58vh]">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-semibold">Tidak ada pertanyaan yang sesuai dengan filter.</p>
                  <p className="text-xs mt-1">Coba ubah kata kunci pencarian atau tambah soal baru.</p>
                </div>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          {q.subject}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {q.grade}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {q.topic}
                        </span>
                        {q.imageUrl && (
                          <span
                            onClick={() => onOpenLightbox(q.imageUrl!, q.imageCaption)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 cursor-pointer hover:bg-emerald-200"
                            title="Klik untuk melihat gambar"
                          >
                            <ImageIcon className="w-3 h-3" /> Bergambar
                          </span>
                        )}
                      </div>

                      <p className="text-xs md:text-sm font-semibold text-slate-800 line-clamp-2">
                        {q.questionText}
                      </p>

                      <div className="text-[11px] text-slate-500 mt-1 font-medium">
                        Kunci: <strong className="text-emerald-700">{['A', 'B', 'C', 'D'][q.correctIndex]}. {q.options[q.correctIndex]}</strong>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                      <button
                        onClick={() => {
                          onPlayTopic(q.topic);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                        title="Mainkan topik ini di arena"
                      >
                        <Play className="w-3 h-3 fill-emerald-600" />
                        <span>Mainkan Topik</span>
                      </button>

                      <button
                        onClick={() => handleStartEdit(q)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        title="Edit Soal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(q)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Hapus Soal Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: TAMBAH / EDIT SOAL MANUAL */}
        {activeTab === 'add_edit' && (
          <form onSubmit={handleSaveQuestion} className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[64vh]">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Subject, Grade, Topic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mata Pelajaran:</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value as Subject)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Numerasi">Numerasi</option>
                  <option value="Literasi">Literasi</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jenjang Kelas:</label>
                <select
                  value={formGrade}
                  onChange={(e) => setFormGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Kelas 7">Kelas 7 (SMP)</option>
                  <option value="Kelas 8">Kelas 8 (SMP)</option>
                  <option value="Kelas 9">Kelas 9 (SMP)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Topik / Materi:</label>
                <input
                  type="text"
                  placeholder="Contoh: Geometri, Aljabar..."
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Teks Pertanyaan:</label>
              <textarea
                rows={3}
                placeholder="Tuliskan pertanyaan lengkap di sini..."
                value={formQuestionText}
                onChange={(e) => setFormQuestionText(e.target.value)}
                className="w-full p-3 text-xs md:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Image Attachment (Upload / URL) */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Gambar / Diagram Ilustrasi Soal (Opsional):</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Upload Area */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressingImage}
                    className="w-full py-3 px-4 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl bg-white text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isCompressingImage ? 'Mengompres...' : 'Unggah File Gambar'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400 block mt-1">PNG, JPG, SVG, WebP (Kompresi Otomatis)</span>
                </div>

                {/* URL Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Atau tempel tautan URL gambar (https://...)"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Keterangan / Caption gambar (misal: Gambar 1: Prisma Segitiga)"
                    value={formImageCaption}
                    onChange={(e) => setFormImageCaption(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white mt-1.5 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Image Preview thumbnail if available */}
              {formImageUrl && (
                <div className="flex items-center gap-3 pt-1 border-t border-slate-200">
                  <img
                    src={formImageUrl}
                    alt="Pratinjau"
                    className="w-16 h-16 object-contain rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-slate-700 block">Gambar Terpasang</span>
                    <span className="text-[11px] text-slate-500 block truncate">{formImageCaption || 'Tanpa keterangan'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormImageUrl('');
                      setFormImageCaption('');
                    }}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Hapus Gambar
                  </button>
                </div>
              )}
            </div>

            {/* Options A, B, C, D */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Opsi Pilihan Ganda (Tandai radio bulat pada jawaban yang BENAR):
              </label>

              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <div key={letter} className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formCorrectIndex === idx}
                      onChange={() => setFormCorrectIndex(idx)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center ${
                        formCorrectIndex === idx ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {letter}
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder={`Teks pilihan jawaban ${letter}...`}
                    value={formOptions[idx]}
                    onChange={(e) => {
                      const updated = [...formOptions];
                      updated[idx] = e.target.value;
                      setFormOptions(updated);
                    }}
                    className={`flex-1 px-3 py-2 text-xs md:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                      formCorrectIndex === idx ? 'border-emerald-400 focus:ring-emerald-500' : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Pembahasan Langkah Demi Langkah (Step-by-Step Solution):
              </label>
              <textarea
                rows={2}
                placeholder="Jelaskan cara pengerjaan atau alasan jawaban benar..."
                value={formExplanation}
                onChange={(e) => setFormExplanation(e.target.value)}
                className="w-full p-2.5 text-xs md:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambahkan ke Bank Soal'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: GENERATOR SOAL AI (GEMINI) */}
        {activeTab === 'ai_generator' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[64vh]">
            <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-violet-50/80 border border-indigo-200/80 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">Generator Soal Otomatis (Gemini AI)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buat sekumpulan soal literasi dan numerasi berkualitas tinggi berstandar Kurikulum Merdeka &amp; AKM SMP dengan kunci jawaban terverifikasi dan pembahasan langkah demi langkah.
              </p>
            </div>

            {aiError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Error: {aiError}</span>
              </div>
            )}

            {/* AI Generation Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mata Pelajaran:</label>
                <select
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value as Subject)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Numerasi">Numerasi</option>
                  <option value="Literasi">Literasi</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jenjang Kelas:</label>
                <select
                  value={aiGrade}
                  onChange={(e) => setAiGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Kelas 7">Kelas 7 SMP</option>
                  <option value="Kelas 8">Kelas 8 SMP</option>
                  <option value="Kelas 9">Kelas 9 SMP</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jumlah Soal:</label>
                <select
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value={3}>3 Soal</option>
                  <option value={5}>5 Soal</option>
                  <option value={8}>8 Soal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tingkat Kesulitan:</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Mudah">Mudah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Sulit (HOTS)">Sulit (HOTS)</option>
                </select>
              </div>
            </div>

            {/* Custom Topic / Instruction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Topik Utama:</label>
                <input
                  type="text"
                  placeholder="Contoh: Geometri, Aljabar, Teorema Pythagoras, Teks Informasi..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Instruksi Khusus Guru (Opsional):</label>
                <input
                  type="text"
                  placeholder="Misal: Buat soal kontekstual tentang belanja kebutuhan hari raya..."
                  value={aiPromptCustom}
                  onChange={(e) => setAiPromptCustom(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingAI ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAI ? 'Gemini AI sedang merumuskan soal...' : 'Generate Soal Sekarang via Gemini AI'}</span>
            </button>

            {/* Preview Generated Questions */}
            {aiGeneratedQuestions.length > 0 && (
              <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Berhasil Menghasilkan {aiGeneratedQuestions.length} Soal:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplyAIGenerated(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                    >
                      Simpan ke Bank Soal
                    </button>
                    <button
                      onClick={() => handleApplyAIGenerated(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Mainkan Topik Ini Sekarang</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {aiGeneratedQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs">
                      <div className="font-bold text-slate-800 mb-1">
                        {idx + 1}. {q.questionText}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-slate-600 font-medium">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-1.5 rounded-lg ${
                              optIdx === q.correctIndex ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-white'
                            }`}
                          >
                            {['A', 'B', 'C', 'D'][optIdx]}. {opt}
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 italic">
                        Pembahasan: {q.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: IMPOR & EKSPOR */}
        {activeTab === 'import_export' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[64vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ekspor Box */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Cadangkan / Ekspor Soal</span>
                </div>
                <p className="text-xs text-slate-500">
                  Simpan set soal aktif ke file lokal di komputer Anda untuk dibagikan ke kelas lain atau disimpan sebagai arsip.
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                  >
                    <FileCode className="w-4 h-4 text-indigo-500" />
                    <span>Ekspor Format JSON (.json)</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Ekspor Format Tabel CSV (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Impor Box */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Pemuatan / Impor Soal</span>
                </div>
                <p className="text-xs text-slate-500">
                  Muat bank soal dari file JSON yang telah disiapkan sebelumnya.
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <input
                    type="file"
                    ref={jsonImportRef}
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                  <button
                    onClick={() => jsonImportRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pilih &amp; Impor File JSON</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Reset to standard preset */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-900 block">Kembalikan Soal Bawaan</span>
                <span className="text-[11px] text-amber-700 block">
                  Reset bank soal ke {DEFAULT_QUESTIONS.length} pertanyaan kurikulum standar bawaan SMP.
                </span>
              </div>
              <button
                onClick={handleResetDefaults}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Soal Standar</span>
              </button>
            </div>
          </div>
        )}

        {/* In-app Toast Banner */}
        {toastMessage && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-70 px-4 py-2.5 rounded-2xl shadow-lg border flex items-center gap-2 text-xs font-bold animate-fadeIn transition-all ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* In-app Confirmation Modal for Deleting Question */}
        {deleteTarget && (
          <div
            className="absolute inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setDeleteTarget(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center flex flex-col items-center gap-3.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Pertanyaan?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Soal berikut akan dihapus secara permanen dari bank soal:
                </p>
                <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium text-left line-clamp-3">
                  "{deleteTarget.questionText}"
                </div>
              </div>
              <div className="flex items-center justify-center gap-2.5 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Soal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-app Confirmation Modal for Resetting to Defaults */}
        {isResetConfirmOpen && (
          <div
            className="absolute inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setIsResetConfirmOpen(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center flex flex-col items-center gap-3.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                <RotateCcw className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Kembalikan Soal Bawaan?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Seluruh bank soal saat ini akan digantikan dengan {DEFAULT_QUESTIONS.length} butir pertanyaan standar bawaan kurikulum SMP.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateQuestions(DEFAULT_QUESTIONS);
                    setIsResetConfirmOpen(false);
                    showToast('Bank soal berhasil direset ke soal standar kurikulum SMP.', 'success');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
