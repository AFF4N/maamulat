import React from 'react';
import type { MaamulatTask } from '../../types';
import { Trash2, Eye, EyeOff, Info, FileText, FileX } from 'lucide-react';

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
  const isExcludedFromReport = Boolean(task.excludeFromReport);

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
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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

            {isExcludedFromReport && !task.hidden && (
              <div className="mt-1 flex items-center gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amberGold-50 dark:bg-amberGold-950/40 text-amberGold-700 dark:text-amberGold-400 border border-amberGold-200/80 dark:border-amberGold-800/60">
                  <FileX className="w-2.5 h-2.5" />
                  <span>Hidden from Report (صرف شیٹ پر)</span>
                </span>
              </div>
            )}
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

          {/* Include / Exclude from Printed Report */}
          <button
            type="button"
            onClick={() => onUpdate({ excludeFromReport: !isExcludedFromReport })}
            className={`p-1 rounded-lg transition-colors ${
              isExcludedFromReport
                ? 'text-amberGold-600 bg-amberGold-50 dark:bg-amberGold-950/40 border border-amberGold-200 dark:border-amberGold-800/60'
                : 'text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
            }`}
            title={
              isExcludedFromReport
                ? 'Excluded from Murrabi Report (Tap to include in report)'
                : 'Included in Murrabi Report (Tap to keep on sheet but exclude from report)'
            }
            aria-label={isExcludedFromReport ? 'Include task in report' : 'Exclude task from report'}
          >
            {isExcludedFromReport ? <FileX className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
          </button>

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
            title={task.hidden ? 'Show Task on Sheet' : 'Hide Task from Sheet'}
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
        <div className="mt-2.5 pt-2 border-t border-paper-200 dark:border-ink-700/80 space-y-2.5 text-xs">
          {/* Report Printing Toggle inside details */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-ink-850 border border-paper-200 dark:border-ink-700">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-ink-800 dark:text-ink-200 block">
                Print in Murrabi Report (رپورٹ میں شامل کریں)
              </span>
              <span className="text-[10px] text-ink-500 dark:text-ink-400 block">
                {isExcludedFromReport
                  ? 'Private on your sheet only — will NOT be printed in exported WhatsApp reports.'
                  : 'Task is printed in your exported WhatsApp report.'}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={!isExcludedFromReport}
              onClick={() => onUpdate({ excludeFromReport: !isExcludedFromReport })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                !isExcludedFromReport ? 'bg-sage-600' : 'bg-paper-300 dark:bg-ink-700'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  !isExcludedFromReport ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

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
