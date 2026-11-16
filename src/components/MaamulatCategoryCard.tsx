import React from 'react';
import type { MaamulatTask, TaskCategory, CategoryConfig } from '../types';
import { CATEGORY_INFO } from '../utils/defaultTasks';
import { MaamulatTaskRow } from './MaamulatTaskRow';
import { TakbeerOolaStepper } from './TakbeerOolaStepper';

interface MaamulatCategoryCardProps {
  category: TaskCategory;
  categoryConfig?: CategoryConfig;
  tasks: MaamulatTask[];
  onToggleTask: (id: string) => void;
  onUpdateTaskMeasure?: (taskId: string, measure: string) => void;
  recentHasanatPopId: string | null;
  hasanatMultiplier?: number;
  // Specific for salah category:
  takbeerOola?: number;
  onAdjustTakbeerOola?: (delta: number) => void;
  animationDelayMs?: number;
}

export const MaamulatCategoryCard: React.FC<MaamulatCategoryCardProps> = ({
  category,
  categoryConfig,
  tasks,
  onToggleTask,
  onUpdateTaskMeasure,
  recentHasanatPopId,
  hasanatMultiplier = 1,
  takbeerOola,
  onAdjustTakbeerOola,
  animationDelayMs,
}) => {
  const info = categoryConfig || CATEGORY_INFO[category] || {
    urdu: category,
    english: category,
    emoji: '✨',
    accent: 'border-paper-200 bg-white'
  };

  const visibleTasks = tasks.filter(t => !t.hidden);

  if (visibleTasks.length === 0) {
    return null;
  }

  return (
    <section
      style={animationDelayMs ? { animationDelay: `${animationDelayMs}ms` } : undefined}
      className="rounded-2xl p-3.5 sm:p-4 bg-white dark:bg-ink-800 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm space-y-3 animate-section-enter card-hover"
    >
      {/* Category Header */}
      <div className="flex items-center gap-2 border-b border-paper-200/80 dark:border-ink-700/60 pb-2.5">
        <span className="text-lg flex-shrink-0 select-none">{info.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-row-reverse items-baseline justify-between gap-2">
            <h2 className="arabic-text text-lg sm:text-xl font-bold text-ink-900 dark:text-white leading-tight">
              {info.urdu}
            </h2>
            <span className="text-xs text-ink-500 dark:text-ink-400 font-medium">
              {info.english}
            </span>
          </div>
        </div>
      </div>

      {/* Task Rows List */}
      <div className="space-y-2">
        {visibleTasks.map((task) => (
          <MaamulatTaskRow
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onUpdateMeasure={onUpdateTaskMeasure}
            showPop={recentHasanatPopId === task.id}
            hasanatMultiplier={hasanatMultiplier}
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
