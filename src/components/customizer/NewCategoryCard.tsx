import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface NewCategoryCardProps {
  onCreateCategory: (english: string, urdu: string, emoji: string) => void;
}

const CATEGORY_PRESETS = [
  { urdu: 'مطالعہ کتب و علم', english: 'Book Reading & Study', emoji: '📚', label: '📚 Book Reading (مطالعہ کتب)' },
  { urdu: 'صدقہ و سخاوت', english: 'Daily Sadaqah & Giving', emoji: '🤲', label: '🤲 Daily Sadaqah (صدقہ و خیرات)' },
  { urdu: 'مراقبہ و محاسبہ', english: 'Muraqabah & Reflection', emoji: '🕯️', label: '🕯️ Muraqabah (مراقبہ و محاسبہ)' },
  { urdu: 'صلہ رحمی و والدین', english: 'Family Ties & Parents', emoji: '🏡', label: '🏡 Family Ties (صلہ رحمی)' },
  { urdu: 'ورزش و حفظانِ صحت', english: 'Health & Physical Routine', emoji: '🌱', label: '🌱 Health & Fitness (ورزش و صحت)' },
];

export const NewCategoryCard: React.FC<NewCategoryCardProps> = ({ onCreateCategory }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEnglish, setNewEnglish] = useState('');
  const [newUrdu, setNewUrdu] = useState('');
  const [newEmoji, setNewEmoji] = useState('✨');

  const handleApplyPreset = (preset: (typeof CATEGORY_PRESETS)[0]) => {
    onCreateCategory(preset.english, preset.urdu, preset.emoji);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const english = newEnglish.trim() || newUrdu.trim();
    const urdu = newUrdu.trim() || newEnglish.trim();
    if (!english && !urdu) return;

    onCreateCategory(english, urdu, newEmoji);
    setNewEnglish('');
    setNewUrdu('');
    setNewEmoji('✨');
    setIsAdding(false);
  };

  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700/80 shadow-soft-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sage-100 dark:bg-sage-950 text-sage-700 dark:text-sage-300">
            <Plus className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-ink-900 dark:text-white">
            Add New Section (+ نیا سیکشن شامل کریں)
          </h3>
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs font-bold text-sage-700 dark:text-sage-300 hover:underline"
          >
            + Create Section
          </button>
        )}
      </div>

      {/* Preset Suggestions */}
      <div className="pt-1">
        <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block mb-2">
          Quick Tazkiyah Templates:
        </span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs px-2.5 py-1 rounded-xl bg-paper-100 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 hover:border-sage-400 text-ink-700 dark:text-ink-300 transition-colors tap-bounce"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Section Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="pt-2 border-t border-paper-200 dark:border-ink-700 space-y-2.5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={newEnglish}
              onChange={(e) => setNewEnglish(e.target.value)}
              placeholder="Section title in English (e.g. Daily Study)"
              className="text-xs px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 focus:outline-none focus:ring-1 focus:ring-sage-500 text-ink-900 dark:text-white"
            />
            <input
              type="text"
              value={newUrdu}
              onChange={(e) => setNewUrdu(e.target.value)}
              placeholder="سیکشن کا نام اردو میں (e.g. مطالعہ کتب)"
              className="arabic-text text-left text-xs px-3 py-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 focus:outline-none focus:ring-1 focus:ring-sage-500 text-ink-900 dark:text-white"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-500">Emoji Icon:</span>
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-8 h-8 text-center rounded-lg border border-paper-300 dark:border-ink-700 bg-white dark:bg-ink-800 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-ink-500 hover:text-ink-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-sage-600 hover:bg-sage-700 text-white shadow-sm transition-colors tap-bounce"
              >
                Create Section
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
