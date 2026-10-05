import React, { useState } from 'react';
import type { CategoryConfig, MaamulatTask } from '../types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  Info,
  Check,
  MoveUp,
  MoveDown
} from 'lucide-react';

interface TaskCustomizerScreenProps {
  initialCategories: CategoryConfig[];
  initialTasks: MaamulatTask[];
  onSave: (categories: CategoryConfig[], tasks: MaamulatTask[]) => void;
  onResetToDefault: () => void;
  onBackToHome: () => void;
}

export const TaskCustomizerScreen: React.FC<TaskCustomizerScreenProps> = ({
  initialCategories,
  initialTasks,
  onSave,
  onResetToDefault,
  onBackToHome,
}) => {
  const [categories, setCategories] = useState<CategoryConfig[]>(() =>
    JSON.parse(JSON.stringify(initialCategories))
  );
  const [tasks, setTasks] = useState<MaamulatTask[]>(() =>
    JSON.parse(JSON.stringify(initialTasks))
  );

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    initialCategories.forEach(c => {
      initial[c.id] = true;
    });
    return initial;
  });

  const [expandedTaskDetails, setExpandedTaskDetails] = useState<Record<string, boolean>>({});
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // New task quick-form state per category
  const [addingTaskInCat, setAddingTaskInCat] = useState<string | null>(null);
  const [newTaskUrdu, setNewTaskUrdu] = useState('');
  const [newTaskEnglish, setNewTaskEnglish] = useState('');
  const [newTaskEmoji, setNewTaskEmoji] = useState('🔹');
  const [newTaskHasanat, setNewTaskHasanat] = useState(25);

  // New category form state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatUrdu, setNewCatUrdu] = useState('');
  const [newCatEnglish, setNewCatEnglish] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('✨');

  // Toggle category collapsed/expanded
  const toggleSectionExpand = (catId: string) => {
    setExpandedSections(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Toggle task details expanded
  const toggleTaskDetails = (taskId: string) => {
    setExpandedTaskDetails(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // --- Category Actions ---
  const handleUpdateCategory = (catId: string, updates: Partial<CategoryConfig>) => {
    setCategories(prev =>
      prev.map(c => (c.id === catId ? { ...c, ...updates } : c))
    );
  };

  const handleToggleCategoryVisibility = (catId: string) => {
    setCategories(prev =>
      prev.map(c => (c.id === catId ? { ...c, hidden: !c.hidden } : c))
    );
  };

  const handleDeleteCategory = (catId: string) => {
    if (window.confirm('Are you sure you want to remove this whole section and its tasks?')) {
      setCategories(prev => prev.filter(c => c.id !== catId));
      setTasks(prev => prev.filter(t => t.category !== catId));
    }
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setCategories(reordered);
  };

  const handleCreateCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatUrdu.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newCategory: CategoryConfig = {
      id: newId,
      urdu: newCatUrdu.trim(),
      english: newCatEnglish.trim() || newCatUrdu.trim(),
      emoji: newCatEmoji.trim() || '✨',
      accent: 'border-sage-300 dark:border-sage-700/60 bg-sage-50/40 dark:bg-sage-900/10',
      hidden: false,
    };

    setCategories(prev => [...prev, newCategory]);
    setExpandedSections(prev => ({ ...prev, [newId]: true }));
    setNewCatUrdu('');
    setNewCatEnglish('');
    setNewCatEmoji('✨');
    setIsAddingCategory(false);
  };

  // Preset quick-add category templates
  const addCategoryPreset = (urdu: string, english: string, emoji: string) => {
    const newId = `custom_${Date.now()}`;
    const newCategory: CategoryConfig = {
      id: newId,
      urdu,
      english,
      emoji,
      accent: 'border-sage-300 dark:border-sage-700/60 bg-sage-50/40 dark:bg-sage-900/10',
      hidden: false,
    };
    setCategories(prev => [...prev, newCategory]);
    setExpandedSections(prev => ({ ...prev, [newId]: true }));
  };

  // --- Task Actions ---
  const handleUpdateTask = (taskId: string, updates: Partial<MaamulatTask>) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const handleToggleTaskVisibility = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, hidden: !t.hidden } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleCreateTask = (catId: string) => {
    if (!newTaskUrdu.trim()) return;
    const newId = `task_${Date.now()}`;
    const newTask: MaamulatTask = {
      id: newId,
      category: catId,
      urduTitle: newTaskUrdu.trim(),
      englishTitle: newTaskEnglish.trim() || newTaskUrdu.trim(),
      emoji: newTaskEmoji || '🔹',
      hasanat: Number(newTaskHasanat) || 20,
      completed: false,
      hidden: false,
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskUrdu('');
    setNewTaskEnglish('');
    setNewTaskEmoji('🔹');
    setNewTaskHasanat(25);
    setAddingTaskInCat(null);
  };

  // Save all changes
  const handleSaveAll = () => {
    onSave(categories, tasks);
    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
    }, 2500);
  };

  // Reset to original default tasks
  const handleConfirmReset = () => {
    onResetToDefault();
    setShowResetConfirm(false);
    onBackToHome();
  };

  const totalActiveTasks = tasks.filter(t => !t.hidden).length;
  const totalActiveCategories = categories.filter(c => !c.hidden).length;

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-[#121514] text-ink-900 dark:text-[#E8ECE9] py-5 px-3.5 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-paper-200 dark:border-ink-800 pb-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white px-3 py-1.5 rounded-xl bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700 shadow-soft-sm transition-colors tap-bounce"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>معمولات شیٹ (Back to Sheet)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta-600 dark:text-terracotta-400 hover:bg-terracotta-50 dark:hover:bg-terracotta-950/40 px-3 py-1.5 rounded-xl border border-terracotta-200 dark:border-terracotta-900/60 transition-colors tap-bounce"
              title="Reset all tasks and sections to original defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-sage-600 hover:bg-sage-700 dark:bg-sage-700 dark:hover:bg-sage-600 px-4 py-1.5 rounded-xl shadow-sm transition-colors tap-bounce"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes (محفوظ کریں)</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {saveSuccessToast && (
          <div className="p-3 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>All changes saved successfully! (تمام ترامیم محفوظ کر لی گئیں)</span>
            </div>
            <button
              onClick={onBackToHome}
              className="text-[11px] underline underline-offset-2 hover:opacity-90 font-semibold"
            >
              Open Sheet Now →
            </button>
          </div>
        )}

        {/* Screen Header */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h1 className="arabic-text text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">
              معمولات کی تخصیص و سیٹنگز
            </h1>
          </div>
          <p className="text-xs text-ink-600 dark:text-ink-400 leading-relaxed">
            Customize your daily spiritual checklist: add custom sections, edit task names, change Hasanat rewards, or hide items you are not practicing right now.
          </p>
          <div className="flex items-center gap-3 pt-1 text-[11px] text-ink-500">
            <span>Active Sections: <strong>{totalActiveCategories}</strong></span>
            <span>•</span>
            <span>Active Tasks: <strong>{totalActiveTasks}</strong></span>
          </div>
        </div>

        {/* List of Section Blocks */}
        <div className="space-y-3.5">
          {categories.map((cat, catIndex) => {
            const catTasks = tasks.filter(t => t.category === cat.id);
            const isExpanded = expandedSections[cat.id] ?? true;

            return (
              <div
                key={cat.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${cat.hidden
                  ? 'bg-paper-100/60 dark:bg-ink-900/40 border-dashed border-paper-300 dark:border-ink-800 opacity-65'
                  : 'bg-white dark:bg-ink-850 border-paper-300 dark:border-ink-700/80 shadow-soft-sm'
                  }`}
              >
                {/* Section Header Block */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2.5 border-b border-paper-200/80 dark:border-ink-700/60 bg-paper-50/50 dark:bg-ink-800/40">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {/* Emoji input/pill */}
                    <input
                      type="text"
                      value={cat.emoji}
                      onChange={(e) => handleUpdateCategory(cat.id, { emoji: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700 text-center text-base focus:outline-none focus:ring-1 focus:ring-sage-500 flex-shrink-0"
                      title="Section Emoji"
                    />

                    {/* Section Titles */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cat.urdu}
                        onChange={(e) => handleUpdateCategory(cat.id, { urdu: e.target.value })}
                        placeholder="سیکشن کا نام (Urdu)"
                        className="arabic-text text-sm sm:text-base font-bold bg-transparent border-b border-transparent hover:border-paper-300 focus:border-sage-500 focus:outline-none text-ink-900 dark:text-white px-1"
                      />
                      <input
                        type="text"
                        value={cat.english}
                        onChange={(e) => handleUpdateCategory(cat.id, { english: e.target.value })}
                        placeholder="Section Name (English)"
                        className="text-xs font-medium bg-transparent border-b border-transparent hover:border-paper-300 focus:border-sage-500 focus:outline-none text-ink-600 dark:text-ink-400 px-1"
                      />
                    </div>
                  </div>

                  {/* Section Controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Reorder Up / Down */}
                    <button
                      type="button"
                      disabled={catIndex === 0}
                      onClick={() => handleMoveCategory(catIndex, 'up')}
                      className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 disabled:opacity-30 transition-colors"
                      title="Move section up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={catIndex === categories.length - 1}
                      onClick={() => handleMoveCategory(catIndex, 'down')}
                      className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 disabled:opacity-30 transition-colors"
                      title="Move section down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Hide / Show Section */}
                    <button
                      type="button"
                      onClick={() => handleToggleCategoryVisibility(cat.id)}
                      className={`p-1.5 rounded-lg transition-colors ${cat.hidden
                        ? 'text-amberGold-600 bg-amberGold-50 dark:bg-amberGold-950/40'
                        : 'text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
                        }`}
                      title={cat.hidden ? 'Show Section on Sheet' : 'Hide Section from Sheet'}
                    >
                      {cat.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete Section */}
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg text-ink-400 hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Collapse / Expand */}
                    <button
                      type="button"
                      onClick={() => toggleSectionExpand(cat.id)}
                      className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Tasks List inside Section */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 space-y-2.5">
                    {catTasks.length === 0 ? (
                      <p className="text-xs text-ink-400 italic py-2 text-center">
                        No tasks in this section yet. Click "+ Add Task" below.
                      </p>
                    ) : (
                      catTasks.map((task) => {
                        const isTaskDetailsOpen = expandedTaskDetails[task.id] || false;

                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl border transition-all ${task.hidden
                              ? 'bg-paper-100/50 dark:bg-ink-900/30 border-dashed border-paper-300 dark:border-ink-800 opacity-60'
                              : 'bg-white dark:bg-ink-800 border-paper-200 dark:border-ink-700/80 shadow-soft-sm'
                              }`}
                          >
                            {/* Main Task Block Row */}
                            <div className="flex items-center justify-between gap-2.5">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {/* Emoji */}
                                <input
                                  type="text"
                                  value={task.emoji}
                                  onChange={(e) => handleUpdateTask(task.id, { emoji: e.target.value })}
                                  className="w-7 h-7 rounded-md bg-paper-50 dark:bg-ink-750 border border-paper-200 dark:border-ink-700 text-center text-sm focus:outline-none flex-shrink-0"
                                  title="Task Emoji"
                                />

                                {/* Urdu & English Titles */}
                                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={task.urduTitle}
                                    onChange={(e) => handleUpdateTask(task.id, { urduTitle: e.target.value })}
                                    placeholder="ٹاسک کا نام (Urdu)"
                                    className="arabic-text text-sm font-bold bg-transparent border-b border-transparent hover:border-paper-300 focus:border-sage-500 focus:outline-none text-ink-900 dark:text-white"
                                  />
                                  <input
                                    type="text"
                                    value={task.englishTitle}
                                    onChange={(e) => handleUpdateTask(task.id, { englishTitle: e.target.value })}
                                    placeholder="Task Title (English)"
                                    className="text-xs bg-transparent border-b border-transparent hover:border-paper-300 focus:border-sage-500 focus:outline-none text-ink-600 dark:text-ink-400"
                                  />
                                </div>
                              </div>

                              {/* Task Points & Action Buttons */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {/* Hasanat Points */}
                                <div className="flex items-center gap-1 bg-paper-100 dark:bg-ink-750 px-2 py-1 rounded-lg">
                                  <span className="text-[10px] text-amberGold-600 font-bold">+</span>
                                  <input
                                    type="number"
                                    value={task.hasanat}
                                    onChange={(e) => handleUpdateTask(task.id, { hasanat: Number(e.target.value) })}
                                    className="w-8 text-xs font-bold text-ink-800 dark:text-ink-200 bg-transparent text-center focus:outline-none"
                                    title="Hasanat points"
                                  />
                                  <span className="text-[10px] text-ink-500">H</span>
                                </div>

                                {/* Details / Options Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleTaskDetails(task.id)}
                                  className="p-1 rounded-md text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
                                  title="Edit description, guidance & options"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>

                                {/* Hide / Show Task */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleTaskVisibility(task.id)}
                                  className={`p-1 rounded-md transition-colors ${task.hidden
                                    ? 'text-amberGold-600 bg-amberGold-50 dark:bg-amberGold-950/40'
                                    : 'text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
                                    }`}
                                  title={task.hidden ? 'Task is Hidden' : 'Hide Task'}
                                >
                                  {task.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>

                                {/* Delete Task */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 rounded-md text-ink-400 hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Expandable Task Metadata (Description, Guidance Tooltip, External Resource Link) */}
                            {isTaskDetailsOpen && (
                              <div className="mt-3 pt-2.5 border-t border-paper-200 dark:border-ink-700 space-y-2 text-xs animate-fadeIn">
                                <div>
                                  <label className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider block mb-0.5">
                                    Description / فضیلت کا خلاصہ:
                                  </label>
                                  <input
                                    type="text"
                                    value={task.description || ''}
                                    onChange={(e) => handleUpdateTask(task.id, { description: e.target.value })}
                                    placeholder="Brief note or spiritual reminder..."
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-850 text-xs focus:outline-none focus:ring-1 focus:ring-sage-500 text-ink-800 dark:text-ink-200"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider block mb-0.5">
                                    Info Tooltip (طریقہ و احادیثِ مبارکہ):
                                  </label>
                                  <textarea
                                    value={task.infoTooltip || ''}
                                    onChange={(e) => handleUpdateTask(task.id, { infoTooltip: e.target.value })}
                                    placeholder="Detailed guidance, Tareeqa, or Hadith shown in (i) info modal..."
                                    rows={2}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-850 text-xs focus:outline-none focus:ring-1 focus:ring-sage-500 text-ink-800 dark:text-ink-200"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider block mb-0.5">
                                      Resource Link URL (e.g. PDF Drive Link):
                                    </label>
                                    <input
                                      type="text"
                                      value={task.linkUrl || ''}
                                      onChange={(e) => handleUpdateTask(task.id, { linkUrl: e.target.value })}
                                      placeholder="https://..."
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-850 text-xs focus:outline-none focus:ring-1 focus:ring-sage-500 text-ink-800 dark:text-ink-200"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider block mb-0.5">
                                      Resource Link Label:
                                    </label>
                                    <input
                                      type="text"
                                      value={task.linkLabel || ''}
                                      onChange={(e) => handleUpdateTask(task.id, { linkLabel: e.target.value })}
                                      placeholder="e.g. Download File"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-850 text-xs focus:outline-none focus:ring-1 focus:ring-sage-500 text-ink-800 dark:text-ink-200"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Inline "+ Add Task" Block */}
                    {addingTaskInCat === cat.id ? (
                      <div className="p-3 rounded-xl border border-sage-300 dark:border-sage-800 bg-sage-50/50 dark:bg-sage-950/20 space-y-2.5 animate-fadeIn">
                        <div className="text-xs font-bold text-sage-900 dark:text-sage-200">
                          نواں ٹاسک شامل کریں (+ Add New Task)
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={newTaskUrdu}
                            onChange={(e) => setNewTaskUrdu(e.target.value)}
                            placeholder="ٹاسک کا نام (اردو)"
                            className="arabic-text text-xs px-2.5 py-1.5 rounded-lg border border-sage-300 dark:border-sage-700 bg-white dark:bg-ink-850 focus:outline-none text-ink-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={newTaskEnglish}
                            onChange={(e) => setNewTaskEnglish(e.target.value)}
                            placeholder="Task title (English)"
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-sage-300 dark:border-sage-700 bg-white dark:bg-ink-850 focus:outline-none text-ink-900 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-ink-500">Emoji:</span>
                            <input
                              type="text"
                              value={newTaskEmoji}
                              onChange={(e) => setNewTaskEmoji(e.target.value)}
                              className="w-7 h-7 text-center rounded-md border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 text-xs"
                            />
                            <span className="text-[11px] text-ink-500">Points:</span>
                            <input
                              type="number"
                              value={newTaskHasanat}
                              onChange={(e) => setNewTaskHasanat(Number(e.target.value))}
                              className="w-12 text-center rounded-md border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 text-xs font-bold"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setAddingTaskInCat(null)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-ink-500 hover:text-ink-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCreateTask(cat.id)}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-sage-600 hover:bg-sage-700 text-white"
                            >
                              Add Task
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingTaskInCat(cat.id)}
                        className="w-full py-2 rounded-xl border border-dashed border-paper-300 dark:border-ink-700 hover:border-sage-400 dark:hover:border-sage-600 text-xs font-semibold text-ink-500 hover:text-sage-700 dark:hover:text-sage-300 flex items-center justify-center gap-1.5 transition-colors tap-bounce"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task to {cat.english}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create New Section Block */}
        <div className="rounded-2xl p-4 bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sage-100 dark:bg-sage-950 text-sage-700 dark:text-sage-300">
                <Plus className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-ink-900 dark:text-white">
                نیا سیکشن شامل کریں (+ Add New Custom Section)
              </h3>
            </div>
            {!isAddingCategory && (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="text-xs font-bold text-sage-700 dark:text-sage-300 hover:underline"
              >
                + Create Section
              </button>
            )}
          </div>

          {/* Preset Quick Section Suggestions */}
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block mb-2">
              Quick Tazkiyah Templates:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addCategoryPreset('مطالعہ کتب و علم', 'Book Reading & Study', '📚')}
                className="text-xs px-2.5 py-1 rounded-xl bg-paper-100 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 hover:border-sage-400 text-ink-700 dark:text-ink-300 transition-colors tap-bounce"
              >
                📚 مطالعہ کتب (Reading)
              </button>
              <button
                type="button"
                onClick={() => addCategoryPreset('صدقہ و سخاوت', 'Daily Sadaqah & Giving', '🤲')}
                className="text-xs px-2.5 py-1 rounded-xl bg-paper-100 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 hover:border-sage-400 text-ink-700 dark:text-ink-300 transition-colors tap-bounce"
              >
                🤲 صدقہ و خیرات (Sadaqah)
              </button>
              <button
                type="button"
                onClick={() => addCategoryPreset('مراقبہ و محاسبہ', 'Muraqabah & Reflection', '🕯️')}
                className="text-xs px-2.5 py-1 rounded-xl bg-paper-100 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 hover:border-sage-400 text-ink-700 dark:text-ink-300 transition-colors tap-bounce"
              >
                🕯️ مراقبہ (Muraqabah)
              </button>
              <button
                type="button"
                onClick={() => addCategoryPreset('صلہ رحمی و والدین', 'Family Ties & Parents', '🏡')}
                className="text-xs px-2.5 py-1 rounded-xl bg-paper-100 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 hover:border-sage-400 text-ink-700 dark:text-ink-300 transition-colors tap-bounce"
              >
                🏡 صلہ رحمی (Kinship)
              </button>
              <button
                type="button"
                onClick={() => addCategoryPreset('ورزش و حفظانِ صحت', 'Health & Physical Routine', '🌱')}
                className="text-xs px-2.5 py-1 rounded-xl bg-paper-100 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 hover:border-sage-400 text-ink-700 dark:text-ink-300 transition-colors tap-bounce"
              >
                🌱 ورزش و صحت (Health)
              </button>
            </div>
          </div>

          {/* Custom Section Creator Form */}
          {isAddingCategory && (
            <form onSubmit={handleCreateCategory} className="pt-2 border-t border-paper-200 dark:border-ink-700 space-y-2.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newCatUrdu}
                  onChange={(e) => setNewCatUrdu(e.target.value)}
                  placeholder="سیکشن کا نام اردو میں (e.g. مطالعہ کتب)"
                  required
                  className="arabic-text text-xs px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 focus:outline-none focus:ring-1 focus:ring-sage-500 text-ink-900 dark:text-white"
                />
                <input
                  type="text"
                  value={newCatEnglish}
                  onChange={(e) => setNewCatEnglish(e.target.value)}
                  placeholder="Section title in English (e.g. Daily Study)"
                  className="text-xs px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 focus:outline-none focus:ring-1 focus:ring-sage-500 text-ink-900 dark:text-white"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-500">Emoji Icon:</span>
                  <input
                    type="text"
                    value={newCatEmoji}
                    onChange={(e) => setNewCatEmoji(e.target.value)}
                    className="w-8 h-8 text-center rounded-lg border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-ink-500 hover:text-ink-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-sage-600 hover:bg-sage-700 text-white transition-colors"
                  >
                    Save Section
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onBackToHome}
            className="text-xs font-semibold text-ink-500 hover:text-ink-800 dark:hover:text-ink-300 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Discard & Return</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-sage-600 hover:bg-sage-700 px-5 py-2.5 rounded-xl shadow-md transition-colors tap-bounce"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes (محفوظ کریں)</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-ink-800 rounded-2xl max-w-sm w-full p-5 border border-paper-300 dark:border-ink-700 shadow-xl space-y-3">
            <h4 className="arabic-text text-base font-bold text-ink-900 dark:text-white">
              اصل حالت پر بحال کریں؟
            </h4>
            <p className="text-xs text-ink-600 dark:text-ink-400 leading-relaxed">
              Are you sure you want to reset all sections and tasks back to the original traditional Tazkiyah defaults? Any custom added sections will be cleared.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-ink-500 hover:text-ink-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-terracotta-600 hover:bg-terracotta-700 text-white"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
