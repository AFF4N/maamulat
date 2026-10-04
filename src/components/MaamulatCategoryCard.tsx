import React from 'react';
import type { MaamulatTask, TaskCategory } from '../types';
import { CATEGORY_INFO } from '../utils/defaultTasks';
import { MaamulatTaskRow } from './MaamulatTaskRow';
import { TakbeerOolaStepper } from './TakbeerOolaStepper';

interface MaamulatCategoryCardProps {
  category: TaskCategory;
  tasks: MaamulatTask[];
  onToggleTask: (id: string) => void;
  onUpdateTaskMeasure?: (taskId: string, measure: string) => void;
  recentHasanatPopId: string | null;
  // Specific for salah category:
  takbeerOola?: number;
  onAdjustTakbeerOola?: (delta: number) => void;
}

export const MaamulatCategoryCard: React.FC<MaamulatCategoryCardProps> = ({
  category,
  tasks,
  onToggleTask,
  onUpdateTaskMeasure,
  recentHasanatPopId,
  takbeerOola,
  onAdjustTakbeerOola,
}) => {
  const info = CATEGORY_INFO[category] || {
    urdu: category,
    english: category,
    emoji: '✨',
    accent: 'border-paper-200 bg-white'
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const isCategoryComplete = completedCount === tasks.length && tasks.length > 0;

  return (
    <section className="rounded-2xl p-3.5 sm:p-4 bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm space-y-3">
      {/* Category Header */}
      <div className="flex items-center justify-between gap-2 border-b border-paper-200/80 dark:border-ink-700/60 pb-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-lg flex-shrink-0 select-none">{info.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="arabic-text text-lg sm:text-xl font-bold text-ink-900 dark:text-white leading-tight">
                {info.urdu}
              </h2>
              <span className="text-xs text-ink-500 dark:text-ink-400 font-medium">
                {info.english}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 tabular-nums ${isCategoryComplete
            ? 'bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300'
            : 'bg-paper-100 dark:bg-ink-750 text-ink-500 dark:text-ink-400'
            }`}
        >
          {completedCount}&nbsp;/&nbsp;{tasks.length}
        </span>
      </div>

      {/* Task Rows List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <MaamulatTaskRow
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onUpdateMeasure={onUpdateTaskMeasure}
            showPop={recentHasanatPopId === task.id}
          />
        ))}

        {/* If category is Salah, display Takbeer-e-Oola stepper */}
        {category === 'salah' && takbeerOola !== undefined && onAdjustTakbeerOola && (
          <div className="pt-1">
            <TakbeerOolaStepper
              value={takbeerOola}
              max={5}
              onChange={onAdjustTakbeerOola}
            />
          </div>
        )}
      </div>
    </section>
  );
};
