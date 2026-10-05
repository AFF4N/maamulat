import React, { useState } from 'react';
import type { CategoryConfig, MaamulatTask } from '../../types';
import {
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';
import { CustomizerTaskRow } from './CustomizerTaskRow';

const QUICK_TEMPLATES = [
  { label: 'Tahajjud (تہجد)', emoji: '🌙', english: 'Tahajjud Prayer', urdu: 'تہجد', hasanat: 35 },
  { label: 'Ishraq (اشراق)', emoji: '🌅', english: 'Ishraq Prayer', urdu: 'اشراق', hasanat: 25 },
  { label: 'Surah Mulk (سورۃ الملک)', emoji: '📖', english: 'Surah Mulk', urdu: 'سورۃ الملک', hasanat: 30 },
  { label: 'Surah Yaseen (سورۃ یٰسین)', emoji: '📖', english: 'Surah Yaseen', urdu: 'سورۃ یٰس', hasanat: 30 },
  { label: 'Darood 100x (درود شریف)', emoji: '📿', english: 'Darood Sharif 100x', urdu: 'درود شریف ۱۰۰ مرتبہ', hasanat: 25 },
  { label: 'Muraqaba (مراقبہ)', emoji: '🧘', english: 'Muraqaba Death & Akhirah', urdu: 'مراقبہ موت و آخرت', hasanat: 25 },
];

interface CustomizerSectionCardProps {
  cat: CategoryConfig;
  catIndex: number;
  totalCategories: number;
  isExpanded: boolean;
  catTasks: MaamulatTask[];
  expandedTaskDetails: Record<string, boolean>;
  onToggleExpand: () => void;
  onUpdateCategory: (updates: Partial<CategoryConfig>) => void;
  onMoveCategory: (direction: 'up' | 'down') => void;
  onToggleCategoryVisibility: () => void;
  onDeleteCategory: () => void;
  onUpdateTask: (taskId: string, updates: Partial<MaamulatTask>) => void;
  onToggleTaskDetails: (taskId: string) => void;
  onToggleTaskVisibility: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: (catId: string, english: string, urdu: string, emoji: string, hasanat: number) => void;
}

export const CustomizerSectionCard: React.FC<CustomizerSectionCardProps> = ({
  cat,
  catIndex,
  totalCategories,
  isExpanded,
  catTasks,
  expandedTaskDetails,
  onToggleExpand,
  onUpdateCategory,
  onMoveCategory,
  onToggleCategoryVisibility,
  onDeleteCategory,
  onUpdateTask,
  onToggleTaskDetails,
  onToggleTaskVisibility,
  onDeleteTask,
  onCreateTask,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskEnglish, setNewTaskEnglish] = useState('');
  const [newTaskUrdu, setNewTaskUrdu] = useState('');
  const [newTaskEmoji, setNewTaskEmoji] = useState('🔹');
  const [newTaskHasanat, setNewTaskHasanat] = useState(25);

  const handleApplyTemplate = (tpl: (typeof QUICK_TEMPLATES)[0]) => {
    setNewTaskEnglish(tpl.english);
    setNewTaskUrdu(tpl.urdu);
    setNewTaskEmoji(tpl.emoji);
    setNewTaskHasanat(tpl.hasanat);
  };

  const handleQuickAddSubmit = () => {
    const english = newTaskEnglish.trim() || newTaskUrdu.trim();
    const urdu = newTaskUrdu.trim() || newTaskEnglish.trim();
    if (!english && !urdu) return;

    onCreateTask(cat.id, english, urdu, newTaskEmoji, newTaskHasanat);
    setNewTaskEnglish('');
    setNewTaskUrdu('');
    setNewTaskEmoji('🔹');
    setNewTaskHasanat(25);
    setIsAddingTask(false);
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        cat.hidden
          ? 'bg-paper-100/60 dark:bg-ink-900/40 border-dashed border-paper-300 dark:border-ink-800 opacity-65'
          : 'bg-white dark:bg-ink-850 border-paper-300 dark:border-ink-700/80 shadow-soft-sm'
      }`}
    >
      {/* Section Header */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2.5 border-b border-paper-200/80 dark:border-ink-700/60 bg-paper-50/50 dark:bg-ink-800/40">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <input
            type="text"
            value={cat.emoji}
            onChange={(e) => onUpdateCategory({ emoji: e.target.value })}
            className="w-8 h-8 rounded-lg bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700 text-center text-base focus:outline-none focus:ring-1 focus:ring-sage-500 flex-shrink-0"
            title="Section Emoji"
          />

          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={cat.english}
              onChange={(e) => onUpdateCategory({ english: e.target.value })}
              placeholder="Section Name (English)"
              className="text-xs sm:text-sm font-semibold bg-transparent border-b border-transparent hover:border-paper-300 focus:border-sage-500 focus:outline-none text-ink-900 dark:text-white px-1"
            />
            <input
              type="text"
              value={cat.urdu}
              onChange={(e) => onUpdateCategory({ urdu: e.target.value })}
              placeholder="سیکشن کا نام (Urdu)"
              className="arabic-text text-left text-sm sm:text-base font-bold bg-transparent border-b border-transparent hover:border-paper-300 focus:border-sage-500 focus:outline-none text-ink-700 dark:text-ink-300 px-1"
            />
          </div>
        </div>

        {/* Section Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            disabled={catIndex === 0}
            onClick={() => onMoveCategory('up')}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 disabled:opacity-30 transition-colors"
            title="Move section up"
          >
            <MoveUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={catIndex === totalCategories - 1}
            onClick={() => onMoveCategory('down')}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 disabled:opacity-30 transition-colors"
            title="Move section down"
          >
            <MoveDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleCategoryVisibility}
            className={`p-1.5 rounded-lg transition-colors ${
              cat.hidden
                ? 'text-amberGold-600 bg-amberGold-50 dark:bg-amberGold-950/40'
                : 'text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
            }`}
            title={cat.hidden ? 'Show Section on Sheet' : 'Hide Section from Sheet'}
          >
            {cat.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onDeleteCategory}
            className="p-1.5 rounded-lg text-ink-400 hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
            title={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Accordion Body: Task Rows */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-2.5">
          {catTasks.length === 0 ? (
            <p className="text-xs text-ink-400 text-center py-3 italic">
              No tasks in this section yet. Tap below to add one.
            </p>
          ) : (
            catTasks.map((task) => (
              <CustomizerTaskRow
                key={task.id}
                task={task}
                isDetailsOpen={expandedTaskDetails[task.id] ?? false}
                onToggleDetails={() => onToggleTaskDetails(task.id)}
                onUpdate={(updates) => onUpdateTask(task.id, updates)}
                onToggleVisibility={() => onToggleTaskVisibility(task.id)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))
          )}

          {/* Quick Add Task Form */}
          {isAddingTask ? (
            <div className="p-3 rounded-xl border border-sage-200 dark:border-sage-800 bg-sage-50/50 dark:bg-sage-950/20 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sage-900 dark:text-sage-300">
                  Add New Task in {cat.english}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="text-[11px] text-ink-400 hover:text-ink-600"
                >
                  Cancel
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:border-sage-400 transition-colors"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newTaskEmoji}
                    onChange={(e) => setNewTaskEmoji(e.target.value)}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-ink-850 border border-sage-300 dark:border-sage-700 text-center text-xs focus:outline-none"
                    title="Emoji"
                  />
                  <input
                    type="text"
                    value={newTaskEnglish}
                    onChange={(e) => setNewTaskEnglish(e.target.value)}
                    placeholder="Task Name (English)"
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-sage-300 dark:border-sage-700 bg-white dark:bg-ink-850 focus:outline-none text-ink-900 dark:text-white"
                  />
                </div>
                <input
                  type="text"
                  value={newTaskUrdu}
                  onChange={(e) => setNewTaskUrdu(e.target.value)}
                  placeholder="ٹاسک کا نام (اردو)"
                  className="arabic-text text-left text-xs px-2.5 py-1.5 rounded-lg border border-sage-300 dark:border-sage-700 bg-white dark:bg-ink-850 focus:outline-none text-ink-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400">
                  <span>Hasanat:</span>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={newTaskHasanat}
                    onChange={(e) => setNewTaskHasanat(Number(e.target.value) || 0)}
                    className="w-12 text-center text-xs px-1.5 py-1 rounded-md border border-sage-300 dark:border-sage-700 bg-white dark:bg-ink-850 text-ink-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleQuickAddSubmit}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-sage-600 hover:bg-sage-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors tap-bounce"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingTask(true)}
              className="w-full py-2 border border-dashed border-paper-300 dark:border-ink-700 hover:border-sage-500 rounded-xl text-xs font-semibold text-sage-700 dark:text-sage-400 flex items-center justify-center gap-1.5 hover:bg-sage-50/50 dark:hover:bg-sage-950/20 transition-all tap-bounce"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Task to {cat.english}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
