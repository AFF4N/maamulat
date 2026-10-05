import React, { useState } from 'react';
import type { CategoryConfig, MaamulatTask } from '../types';
import { ArrowLeft, RotateCcw, Check, Save } from 'lucide-react';
import { CustomizerSectionCard } from './customizer/CustomizerSectionCard';
import { NewCategoryCard } from './customizer/NewCategoryCard';

interface TaskCustomizerScreenProps {
  initialCategories: CategoryConfig[];
  initialTasks: MaamulatTask[];
  onSave: (categories: CategoryConfig[], tasks: MaamulatTask[]) => void;
  onResetToDefault: () => void;
  onBackToHome: () => void;
}

/** Reusable Save Action Button */
interface SaveActionButtonProps {
  onSave: () => void;
  isSaved: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export const SaveActionButton: React.FC<SaveActionButtonProps> = ({
  onSave,
  isSaved,
  label = 'Save Changes',
  size = 'sm',
}) => {
  const sizeClasses = size === 'md' ? 'px-5 py-2.5 shadow-md' : 'px-4 py-1.5 shadow-sm';
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={isSaved}
      className={`inline-flex items-center gap-1.5 text-xs font-bold text-white rounded-xl transition-all tap-bounce ${sizeClasses} ${
        isSaved
          ? 'bg-emerald-600 dark:bg-emerald-600 scale-[1.02]'
          : 'bg-sage-600 hover:bg-sage-700 dark:bg-sage-700 dark:hover:bg-sage-600'
      }`}
    >
      {isSaved ? (
        <>
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{size === 'md' ? 'Saved! Returning to sheet...' : 'Saved!'}</span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

/** Reusable Floating Success Toast */
export const SaveSuccessToast: React.FC<{ message?: string }> = ({
  message = 'Changes saved! Returning to sheet...',
}) => (
  <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-700 text-white shadow-xl border border-emerald-500/80 animate-in fade-in slide-in-from-top-4 duration-200">
    <Check className="w-4 h-4 stroke-[3] flex-shrink-0" />
    <span className="text-xs font-bold whitespace-nowrap">{message}</span>
  </div>
);

/** Reusable Reset Confirmation Modal */
interface ResetConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm Reset"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="bg-white dark:bg-ink-800 rounded-2xl max-w-sm w-full p-5 border border-paper-300 dark:border-ink-700 shadow-xl space-y-3">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-ink-900 dark:text-white">
            Reset to Original Defaults?
          </h4>
        </div>
        <p className="text-xs text-ink-600 dark:text-ink-400 leading-relaxed">
          Are you sure you want to reset all sections and tasks back to the original traditional Tazkiyah defaults? Any custom added sections will be cleared.
        </p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-ink-500 hover:text-ink-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-terracotta-600 hover:bg-terracotta-700 text-white"
          >
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );
};

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

  const handleCreateCategory = (english: string, urdu: string, emoji: string) => {
    const newId = `cat_${Date.now()}`;
    const newCategory: CategoryConfig = {
      id: newId,
      urdu,
      english,
      emoji: emoji || '✨',
      accent: 'sage',
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

  const handleCreateTask = (
    catId: string,
    english: string,
    urdu: string,
    emoji: string,
    hasanat: number
  ) => {
    const newId = `task_${Date.now()}`;
    const newTask: MaamulatTask = {
      id: newId,
      category: catId,
      urduTitle: urdu,
      englishTitle: english,
      emoji: emoji || '🔹',
      hasanat: Number(hasanat) || 20,
      completed: false,
      hidden: false,
    };

    setTasks(prev => [...prev, newTask]);
  };

  // Save all changes with instant feedback and smooth return to home
  const handleSaveAll = () => {
    onSave(categories, tasks);
    setSaveSuccessToast(true);
    setTimeout(() => {
      onBackToHome();
    }, 700);
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
    <div className="min-h-screen bg-paper-50 dark:bg-[#121514] text-ink-900 dark:text-[#E8ECE9] py-5 standalone:pt-[calc(1.25rem+env(safe-area-inset-top,0px))] px-3.5 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-paper-200 dark:border-ink-800 pb-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white px-3 py-1.5 rounded-xl bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700 shadow-soft-sm transition-colors tap-bounce"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta-600 dark:text-terracotta-400 hover:bg-terracotta-50 dark:hover:bg-terracotta-950/40 px-3 py-1.5 rounded-xl border border-terracotta-200 dark:border-terracotta-900/60 transition-colors tap-bounce"
              title="Reset all tasks and sections to original defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <SaveActionButton
              onSave={handleSaveAll}
              isSaved={saveSuccessToast}
              label="Save Changes"
              size="sm"
            />
          </div>
        </div>

        {/* Fixed Floating Success Toast (always visible at top of viewport) */}
        {saveSuccessToast && <SaveSuccessToast />}

        {/* Screen Header */}
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
              Customize Maamulat
            </h1>
            <span className="arabic-text text-left text-sm sm:text-base font-semibold text-sage-700 dark:text-sage-400">
              (معمولات کی تخصیص و سیٹنگز)
            </span>
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
            return (
              <CustomizerSectionCard
                key={cat.id}
                cat={cat}
                catIndex={catIndex}
                totalCategories={categories.length}
                isExpanded={expandedSections[cat.id] ?? true}
                catTasks={catTasks}
                expandedTaskDetails={expandedTaskDetails}
                onToggleExpand={() => toggleSectionExpand(cat.id)}
                onUpdateCategory={(updates) => handleUpdateCategory(cat.id, updates)}
                onMoveCategory={(dir) => handleMoveCategory(catIndex, dir)}
                onToggleCategoryVisibility={() => handleToggleCategoryVisibility(cat.id)}
                onDeleteCategory={() => handleDeleteCategory(cat.id)}
                onUpdateTask={handleUpdateTask}
                onToggleTaskDetails={toggleTaskDetails}
                onToggleTaskVisibility={handleToggleTaskVisibility}
                onDeleteTask={handleDeleteTask}
                onCreateTask={handleCreateTask}
              />
            );
          })}
        </div>

        {/* Create New Section Block */}
        <NewCategoryCard onCreateCategory={handleCreateCategory} />

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="text-xs font-semibold text-ink-500 hover:text-ink-800 dark:hover:text-ink-300 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Discard & Return</span>
          </button>

          <SaveActionButton
            onSave={handleSaveAll}
            isSaved={saveSuccessToast}
            label="Save All Changes"
            size="md"
          />
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
};

export default TaskCustomizerScreen;
