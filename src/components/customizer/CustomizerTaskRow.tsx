import React from 'react';
import type { MaamulatTask } from '../../types';
import { Trash2, Eye, EyeOff, Info } from 'lucide-react';

interface CustomizerTaskRowProps {
  task: MaamulatTask;
  isDetailsOpen: boolean;
  onToggleDetails: () => void;
  onUpdate: (updates: Partial<MaamulatTask>) => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

export const CustomizerTaskRow: React.FC<CustomizerTaskRowProps> = ({
  task,
  isDetailsOpen,
  onToggleDetails,
  onUpdate,
  onToggleVisibility,
  onDelete,
}) => {
  return (
    <div
      className={`rounded-xl border p-2.5 sm:p-3 transition-colors ${
        task.hidden
          ? 'bg-paper-100/60 dark:bg-ink-900/40 border-dashed border-paper-300 dark:border-ink-800 opacity-60'
          : 'bg-paper-50/70 dark:bg-ink-800/60 border-paper-200 dark:border-ink-700/60'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Emoji */}
          <input
            type="text"
            value={task.emoji}
            onChange={(e) => onUpdate({ emoji: e.target.value })}
            className="w-7 h-7 rounded-lg bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 text-center text-sm focus:outline-none focus:ring-1 focus:ring-sage-500 flex-shrink-0"
            title="Task Emoji"
          />

          {/* Bilingual Titles */}
          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <input
              type="text"
              value={task.englishTitle}
              onChange={(e) => onUpdate({ englishTitle: e.target.value })}
              placeholder="Task Name (English)"
              className="text-xs font-medium bg-transparent border-b border-transparent hover:border-paper-300 focus:border-sage-500 focus:outline-none text-ink-900 dark:text-white"
            />
            <input
              type="text"
              value={task.urduTitle}
              onChange={(e) => onUpdate({ urduTitle: e.target.value })}
              placeholder="ٹاسک کا نام (Urdu)"
              className="arabic-text text-left text-sm font-bold bg-transparent border-b border-transparent hover:border-paper-300 focus:border-sage-500 focus:outline-none text-ink-700 dark:text-ink-300"
            />
          </div>
        </div>

        {/* Reward & Quick Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Hasanat reward input */}
          <div
            className="flex items-center gap-1 bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 px-1.5 py-0.5 rounded-lg text-[11px]"
            title="Reward Hasanat"
          >
            <span className="text-amberGold-600 font-bold">+</span>
            <input
              type="number"
              min="0"
              max="500"
              value={task.hasanat}
              onChange={(e) => onUpdate({ hasanat: Number(e.target.value) || 0 })}
              className="w-8 text-center bg-transparent focus:outline-none font-bold text-ink-900 dark:text-white text-[11px]"
            />
            <span className="text-[10px] text-ink-400">H</span>
          </div>

          {/* Advanced details expand button */}
          <button
            type="button"
            onClick={onToggleDetails}
            className={`p-1 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors ${
              isDetailsOpen ? 'bg-paper-200 dark:bg-ink-700 text-ink-800 dark:text-white' : ''
            }`}
            title="Edit links & guidance notes"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Hide/Show Task */}
          <button
            type="button"
            onClick={onToggleVisibility}
            className={`p-1 rounded-lg transition-colors ${
              task.hidden
                ? 'text-amberGold-600 bg-amberGold-50 dark:bg-amberGold-950/40'
                : 'text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
            }`}
            title={task.hidden ? 'Show Task' : 'Hide Task'}
          >
            {task.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Delete Task */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-lg text-ink-400 hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Details Form */}
      {isDetailsOpen && (
        <div className="mt-2.5 pt-2 border-t border-paper-200 dark:border-ink-700/80 space-y-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-ink-500 block mb-0.5">
                External Link Label (Optional):
              </label>
              <input
                type="text"
                value={task.linkLabel || ''}
                onChange={(e) => onUpdate({ linkLabel: e.target.value })}
                placeholder="e.g. Read PDF Dua"
                className="w-full text-xs px-2 py-1 rounded-md border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-850 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-ink-500 block mb-0.5">
                External URL (Optional):
              </label>
              <input
                type="url"
                value={task.linkUrl || ''}
                onChange={(e) => onUpdate({ linkUrl: e.target.value })}
                placeholder="https://..."
                className="w-full text-xs px-2 py-1 rounded-md border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-850 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-ink-500 block mb-0.5">
              Guidance Note / فضیلت و رہنمائی (Optional):
            </label>
            <textarea
              rows={2}
              value={task.infoTooltip || ''}
              onChange={(e) => onUpdate({ infoTooltip: e.target.value })}
              placeholder="Explanation or virtures of this ritual..."
              className="w-full text-xs px-2.5 py-1.5 rounded-md border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-850 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
