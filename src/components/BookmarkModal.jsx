import React from 'react';

function BookmarkModal({ isOpen, onClose, onSave, currentPageIndex, totalPages, currentPageParagraphs }) {
  if (!isOpen) return null;

  const handleSave = () => {
    onSave();
    onClose();
  };

  // Preview: first ~140 chars of the first paragraph on the current page
  const previewText = currentPageParagraphs.length > 0
    ? currentPageParagraphs[0].substring(0, 140) + (currentPageParagraphs[0].length > 140 ? '…' : '')
    : 'No content on this page.';

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-2xl shadow-xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Save Bookmark</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Page badge */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 text-2xl">bookmark</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Page {currentPageIndex + 1}
                <span className="ml-2 text-xs font-normal text-gray-400">of {totalPages}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Your progress will be saved here.</p>
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-2">Preview — first lines on this page</p>
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 italic">
              "{previewText}"
            </p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(((currentPageIndex + 1) / totalPages) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 transition-colors active:scale-[0.98]"
          >
            Save Bookmark
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookmarkModal;