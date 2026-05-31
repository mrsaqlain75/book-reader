import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

function SettingsModal({ isOpen, onClose }) {
  const {
    font, setFont, fontOptions,
    fontSize, setFontSize,
    bgColor, setBgColor, bgColors,
    textColor, setTextColor, textColors,
  } = useSettings();

  const [localFontSize, setLocalFontSize] = useState(fontSize);

  if (!isOpen) return null;

  const handleFontSizeChange = (value) => {
    const newSize = parseFloat(value);
    setLocalFontSize(newSize);
    setFontSize(newSize);
  };

  const isDark = bgColor.class.includes('1a1a1a') || bgColor.class.includes('0a0a0a');
  const label = 'block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2.5';

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="absolute top-0 left-0 right-0 max-w-md mx-auto bg-white rounded-b-2xl shadow-2xl"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Reading Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400 text-xl">close</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto" style={{ maxHeight: '72vh' }}>
          <div className="px-5 pt-5 pb-2 space-y-6">

            {/* ── Font Style ── */}
            <section>
              <span className={label}>Font Style</span>
              <div className="grid grid-cols-3 gap-2">
                {fontOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFont(option)}
                    className={`py-2.5 rounded-xl text-sm transition-all ${option.class} ${
                      font.id === option.id
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </section>

            {/* ── Font Size ── */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <span className={label.replace('mb-2.5', 'mb-0')}>Font Size</span>
                <span className="text-sm font-bold text-amber-500 tabular-nums">
                  {Math.round(localFontSize * 16)}px
                </span>
              </div>
              {/* Live preview */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-3">
                <p
                  className={`text-gray-800 leading-relaxed text-center ${font.class}`}
                  style={{ fontSize: `${localFontSize}rem` }}
                >
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.6"
                step="0.02"
                value={localFontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: '#f59e0b' }}
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>A</span>
                <span className="text-base font-medium">A</span>
              </div>
            </section>

            {/* ── Background ── */}
            <section>
              <span className={label}>Background</span>
              <div className="grid grid-cols-3 gap-2">
                {bgColors.map((color) => {
                  const isColorDark = color.class.includes('1a1a1a') || color.class.includes('0a0a0a');
                  return (
                    <button
                      key={color.id}
                      onClick={() => setBgColor(color)}
                      className={`h-12 rounded-xl border-2 flex items-center justify-center transition-all ${color.class} ${
                        bgColor.id === color.id
                          ? 'border-amber-500 shadow-md scale-[1.03]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: isColorDark ? '#999' : '#4b5563' }}
                      >
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Text Color ── */}
            <section>
              <span className={label}>Text Color</span>
              <div className="grid grid-cols-2 gap-2">
                {textColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setTextColor(color)}
                    className={`px-3 py-2.5 rounded-xl text-sm transition-all border ${
                      textColor.id === color.id
                        ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    } ${color.class}`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
              {isDark && (
                <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2">
                  💡 Dark/Night mode auto-adjusts text for readability.
                </p>
              )}
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pt-3 pb-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors active:scale-[0.98] text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;