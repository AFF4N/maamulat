import React, { useState } from 'react';

interface TilawatMeasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMeasure: string;
  onSelectMeasure: (measure: string) => void;
}

const TILAWAT_PRESETS = [
  { label: 'ایک رکوع', english: '1 Ruku' },
  { label: 'ایک پاؤ', english: '1 Paao (1/4 Juz)' },
  { label: 'آدھا پارہ', english: 'Half Juz (1/2)' },
  { label: '1 پارہ', english: '1 Juz' },
  { label: '2 پارے', english: '2 Juz' },
  { label: '3 پارے', english: '3 Juz' },
];

export const TilawatMeasureModal: React.FC<TilawatMeasureModalProps> = ({
  isOpen,
  onClose,
  currentMeasure,
  onSelectMeasure,
}) => {
  const [measureInput, setMeasureInput] = useState(currentMeasure || 'ایک پاؤ');

  if (!isOpen) return null;

  const handleSelect = (measure: string) => {
    onSelectMeasure(measure);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Set Tilawat Measure"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-ink-800 rounded-2xl max-w-sm w-full p-4 sm:p-5 border border-paper-300 dark:border-ink-700 shadow-xl space-y-3.5"
      >
        <div className="flex items-center justify-between border-b border-paper-200 dark:border-ink-700 pb-2">
          <h4 className="arabic-text text-base font-bold text-ink-900 dark:text-white">
            تلاوت کی مقدار متعین کریں
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 dark:hover:text-white text-sm p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-ink-600 dark:text-ink-400">
          ہر شخص اپنی ہمت کے مطابق روزانہ تلاوت مقرر کر سکتا ہے (Select a preset or enter your custom daily goal):
        </p>

        {/* Quick preset chips */}
        <div className="grid grid-cols-2 gap-2">
          {TILAWAT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelect(preset.label)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all tap-bounce ${
                (currentMeasure || 'ایک پاؤ') === preset.label
                  ? 'bg-sage-100 dark:bg-sage-900/60 border-sage-500 text-sage-900 dark:text-sage-200 shadow-sm'
                  : 'bg-paper-50 dark:bg-ink-850 border-paper-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:border-sage-300 dark:hover:border-sage-700'
              }`}
            >
              <span className="arabic-text text-sm font-bold">{preset.label}</span>
              <span className="text-[10px] text-ink-500 dark:text-ink-400">{preset.english}</span>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="pt-1 space-y-1.5">
          <label className="text-[11px] font-semibold text-ink-700 dark:text-ink-300 block">
            اپنی مرضی کی مقدار لکھیں (Custom):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={measureInput}
              onChange={(e) => setMeasureInput(e.target.value)}
              placeholder="مثلاً: 2 پارے، 5 صفحات..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-850 text-xs text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
            <button
              type="button"
              onClick={() => handleSelect(measureInput)}
              className="px-3.5 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-semibold transition-colors tap-bounce"
            >
              محفوظ کریں
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
