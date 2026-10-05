import React, { useState } from 'react';
import type { MaamulatTask } from '../types';
import { Check, Info, X, ExternalLink, FileText, Pencil } from 'lucide-react';
import { TilawatMeasureModal } from './TilawatMeasureModal';

interface MaamulatTaskRowProps {
  task: MaamulatTask;
  onToggle: (id: string) => void;
  onUpdateMeasure?: (taskId: string, measure: string) => void;
  showPop: boolean;
}

export const MaamulatTaskRow: React.FC<MaamulatTaskRowProps> = ({
  task,
  onToggle,
  onUpdateMeasure,
  showPop,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMeasureModal, setShowMeasureModal] = useState(false);

  const handleSelectMeasure = (newMeasure: string) => {
    if (onUpdateMeasure) {
      onUpdateMeasure(task.id, newMeasure);
    }
  };

  return (
    <div className="relative">
      <div
        onClick={() => onToggle(task.id)}
        role="checkbox"
        aria-checked={task.completed}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onToggle(task.id);
          }
        }}
        className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none tap-bounce ${task.completed
          ? 'bg-sage-50/70 dark:bg-sage-950/60 border-sage-300 dark:border-sage-800 shadow-soft-sm'
          : 'bg-white dark:bg-ink-850 border-paper-200 dark:border-ink-700/80 hover:border-paper-400 dark:hover:border-ink-600'
          }`}
      >
        {/* Left side: Checkbox + Urdu & English Titles + Link */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {/* Custom tactile checkbox */}
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${task.completed
              ? 'bg-sage-600 dark:bg-sage-600 text-white scale-100 shadow-sm'
              : 'border-2 border-paper-300 dark:border-ink-600 bg-paper-50 dark:bg-ink-800 group-hover:border-sage-400 dark:group-hover:border-sage-500'
              }`}
          >
            {task.completed && <Check className="w-4 h-4 stroke-[2.8]" />}
          </div>

          {/* Text Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-x-1.5 gap-y-0 flex-wrap">
              <span className="text-sm select-none">{task.emoji}</span>
              <span
                className={`arabic-text text-base font-bold leading-snug transition-colors ${task.completed
                  ? 'text-sage-900 dark:text-sage-200 line-through opacity-85'
                  : 'text-ink-900 dark:text-white'
                  }`}
              >
                {task.urduTitle}
              </span>
              <span
                className={`text-xs font-medium leading-tight truncate ${task.completed
                  ? 'text-sage-700/70 dark:text-sage-400/70'
                  : 'text-ink-500 dark:text-ink-400'
                  }`}
              >
                ({task.englishTitle})
              </span>

              {/* Little (i) info icon button */}
              {task.infoTooltip && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(prev => !prev);
                  }}
                  className="p-1 rounded-full text-sage-700 dark:text-sage-300 hover:bg-sage-100 dark:hover:bg-sage-900/50 transition-colors tap-bounce"
                  title="Click for details & guidance"
                  aria-label="Guidance info"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Editable measure button for Tilawat */}
              {onUpdateMeasure && (task.customMeasure !== undefined || task.id === 'tilawat_paao') && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMeasureModal(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-white bg-sage-50 dark:bg-sage-950/60 px-2 py-0.5 rounded-md border border-sage-200/90 dark:border-sage-800 transition-colors tap-bounce ml-0.5"
                  title="Change Tilawat measure / مقدار تبدیل کریں"
                >
                  <Pencil className="w-2.5 h-2.5" />
                  <span className="arabic-text text-xs">تبدیل</span>
                </button>
              )}
            </div>

            {task.description && (
              <p
                className={`text-[11px] mt-0.5 line-clamp-1 ${task.completed
                  ? 'text-sage-700/70 dark:text-sage-400/60'
                  : 'text-ink-500 dark:text-ink-400'
                  }`}
              >
                {task.description}
              </p>
            )}

            {/* External Resource / PDF Link */}
            {task.linkUrl && (
              <div className="mt-1.5">
                <a
                  href={task.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white transition-colors tap-bounce"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="font-sans font-semibold text-[11px] leading-none pt-0.5">
                    {task.linkLabel}
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-70 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Hasanat Reward Pill & Floating Pop */}
        <div className="relative flex items-center flex-shrink-0">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${task.completed
              ? 'bg-sage-200/80 dark:bg-sage-900/80 text-sage-800 dark:text-sage-200'
              : 'bg-paper-100 dark:bg-ink-750 text-ink-600 dark:text-ink-300'
              }`}
          >
            +{task.hasanat} H
          </span>

          {/* Floating "+Hasanat" animation pop */}
          {showPop && (
            <span className="absolute -top-3 right-0 pointer-events-none text-xs font-bold text-amberGold-600 dark:text-amberGold-400 animate-float-up">
              +{task.hasanat} ✨
            </span>
          )}
        </div>
      </div>

      {/* Info Tooltip Popover */}
      {showTooltip && task.infoTooltip && (
        <div className="mt-1.5 p-3.5 rounded-xl bg-paper-100 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 text-xs text-ink-800 dark:text-ink-200 shadow-soft-sm animate-fadeIn flex items-start justify-between gap-2.5">
          <div className="arabic-text leading-relaxed text-right flex-1 whitespace-pre-line">
            <span className="font-bold block text-sm mb-1.5 text-sage-800 dark:text-sage-300">
              {task.urduTitle} — طریقہ، فضیلت و رہنمائی:
            </span>
            {task.infoTooltip}
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="p-1 rounded-md text-ink-400 hover:text-ink-700 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-ink-700"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tilawat Measure Customization Modal */}
      <TilawatMeasureModal
        isOpen={showMeasureModal}
        onClose={() => setShowMeasureModal(false)}
        currentMeasure={task.customMeasure || 'ایک پاؤ'}
        onSelectMeasure={handleSelectMeasure}
      />
    </div>
  );
};
