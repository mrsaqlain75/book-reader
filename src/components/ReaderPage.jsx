import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import SettingsModal from './SettingsModal';
import BookmarkModal from './BookmarkModal';

function ReaderPage({ bookData, bookTitle, bookAuthor }) {
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [currentPart, setCurrentPart]   = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pages, setPages]               = useState([]);
  const [showToast, setShowToast]       = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Flip animation
  const [flipDirection, setFlipDirection] = useState(null);
  const [isFlipping, setIsFlipping]       = useState(false);

  // Refs
  const contentAreaRef   = useRef(null);
  const measureWidthRef  = useRef(null);
  const touchStartX      = useRef(0);
  const touchStartY      = useRef(0);
  
  // Track if initial restore has been done
  const hasRestoredRef = useRef(false);
  // Store the saved page index to restore after pages are built
  const savedPageIndexRef = useRef(null);

  const { font, fontSize, bgColor, textColor } = useSettings();

  // ─── Bookmark keys ────────────────────────────────────────────────────────
  const KEY_PART    = `bm_part_${bookTitle}`;
  const KEY_CHAPTER = `bm_chapter_${bookTitle}`;
  const KEY_PAGE    = `bm_page_${bookTitle}`;

  // ─── Restore bookmark on first mount ──────────────────────────────────────
  useEffect(() => {
    const sp = localStorage.getItem(KEY_PART);
    const sc = localStorage.getItem(KEY_CHAPTER);
    const sg = localStorage.getItem(KEY_PAGE);
    if (sp !== null) setCurrentPart(parseInt(sp, 10));
    if (sc !== null) setCurrentChapter(parseInt(sc, 10));
    if (sg !== null) savedPageIndexRef.current = parseInt(sg, 10);
    hasRestoredRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveBookmark = useCallback(() => {
    localStorage.setItem(KEY_PART,    String(currentPart));
    localStorage.setItem(KEY_CHAPTER, String(currentChapter));
    localStorage.setItem(KEY_PAGE,    String(currentPageIndex));
    setToastMessage('📖 Bookmark saved!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, [currentPart, currentChapter, currentPageIndex, KEY_PART, KEY_CHAPTER, KEY_PAGE]);

  // ─── Chapter data ─────────────────────────────────────────────────────────
  const currentPartData    = bookData?.parts[currentPart];
  const currentChapterData = currentPartData?.chapters[currentChapter];
  const displayNumber      = currentChapterData?.chapter_number !== 'N/A'
    ? `Ch ${currentChapterData?.chapter_number}` : '';
  const fullText = currentChapterData?.content || '';

  // ─── Core page-building ───────────────────────────────────────────────────
  const buildPagesNow = useCallback(() => {
    const paragraphs = fullText.split(/\n\n+/).filter(p => p.trim().length > 0);
    if (!paragraphs.length) return;

    const areaEl = contentAreaRef.current;
    if (!areaEl) return;
    const availableH = areaEl.clientHeight;
    if (availableH === 0) return;

    const lineHeightPx = fontSize * 1.65 * 16;
    const TOP_PAD      = 20;
    const BOTTOM_SAFE  = lineHeightPx + 28;
    const usable       = availableH - TOP_PAD - BOTTOM_SAFE;

    const colEl    = measureWidthRef.current;
    const contentW = colEl ? colEl.clientWidth : Math.min(window.innerWidth - 40, 384);

    const probe = document.createElement('div');
    probe.style.cssText = [
      'position:absolute',
      'visibility:hidden',
      'pointer-events:none',
      'top:-9999px',
      'left:-9999px',
      `width:${contentW}px`,
      `font-size:${fontSize}rem`,
      `font-family:${getComputedStyle(document.body).fontFamily}`,
      'line-height:1.65',
      'word-break:break-word',
      'white-space:normal',
    ].join(';');
    document.body.appendChild(probe);

    const measure = (text) => {
      probe.textContent = text;
      return probe.offsetHeight;
    };

    const splitToFit = (text, maxH) => {
      const words = text.split(' ');
      if (measure(words[0]) > maxH) {
        return [words[0], words.slice(1).join(' ')];
      }
      let lo = 1, hi = words.length;
      while (lo < hi) {
        const mid = Math.floor((lo + hi + 1) / 2);
        if (measure(words.slice(0, mid).join(' ')) <= maxH) {
          lo = mid;
        } else {
          hi = mid - 1;
        }
      }
      const fitting = words.slice(0, lo).join(' ');
      const rest    = words.slice(lo).join(' ');
      return [fitting, rest];
    };

    const GAP = 16;
    const newPages = [];
    let page  = [];
    let usedH = 0;
    const queue = [...paragraphs];

    while (queue.length > 0) {
      const text   = queue.shift();
      const h      = measure(text);
      const needed = page.length === 0 ? h : h + GAP;

      if (needed <= usable - usedH) {
        page.push(text);
        usedH += needed;
      } else if (page.length > 0) {
        const fitsAlone = h <= usable;
        if (fitsAlone) {
          newPages.push([...page]);
          page  = [text];
          usedH = h;
        } else {
          if (page.length > 0) {
            newPages.push([...page]);
            page  = [];
            usedH = 0;
          }
          const spaceLeft = usable - usedH;
          const [fitting, remainder] = splitToFit(text, spaceLeft);
          page.push(fitting);
          usedH += measure(fitting);
          if (remainder.trim()) queue.unshift(remainder);
        }
      } else {
        const [fitting, remainder] = splitToFit(text, usable);
        page.push(fitting);
        usedH += measure(fitting);
        if (remainder.trim()) queue.unshift(remainder);
      }
    }
    if (page.length > 0) newPages.push(page);

    document.body.removeChild(probe);
    setPages(newPages);

    // Restore saved page index AFTER pages are built, but only once
    if (savedPageIndexRef.current !== null && newPages.length > 0) {
      const targetPage = Math.min(savedPageIndexRef.current, newPages.length - 1);
      setCurrentPageIndex(targetPage);
      savedPageIndexRef.current = null; // Clear so it doesn't restore again
    } else if (!hasRestoredRef.current && newPages.length > 0) {
      setCurrentPageIndex(0);
    }
  }, [fullText, fontSize]);

  // Build pages when dependencies change
  useEffect(() => {
    const id = setTimeout(() => buildPagesNow(), 50);
    return () => clearTimeout(id);
  }, [fullText, fontSize, buildPagesNow]);

  // ResizeObserver on the content area
  useEffect(() => {
    const el = contentAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      buildPagesNow();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [buildPagesNow]);

  // Reset page to 0 when chapter changes (but NOT during initial restore)
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) { 
      isFirstMount.current = false; 
      return; 
    }
    // Only reset if this is a user-initiated chapter change (not initial load)
    if (savedPageIndexRef.current === null) {
      setCurrentPageIndex(0);
    }
  }, [currentChapter]);

  // ─── Flip logic ───────────────────────────────────────────────────────────
  const triggerFlip = useCallback((direction, targetIdx) => {
    if (isFlipping) return;
    if (direction === 'forward'  && currentPageIndex >= pages.length - 1) return;
    if (direction === 'backward' && currentPageIndex <= 0) return;

    setFlipDirection(direction);
    setIsFlipping(true);
    setTimeout(() => setCurrentPageIndex(targetIdx), 180);
    setTimeout(() => { setIsFlipping(false); setFlipDirection(null); }, 380);
  }, [isFlipping, currentPageIndex, pages.length]);

  const goToNextPage = useCallback(() => triggerFlip('forward',  currentPageIndex + 1), [triggerFlip, currentPageIndex]);
  const goToPrevPage = useCallback(() => triggerFlip('backward', currentPageIndex - 1), [triggerFlip, currentPageIndex]);

  // ─── Touch / swipe ────────────────────────────────────────────────────────
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (isFlipping) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 48 && dy < 100) {
      dx > 0 ? goToNextPage() : goToPrevPage();
    }
  };

  // ─── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToNextPage();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToPrevPage();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goToNextPage, goToPrevPage]);

  // ─── Theme helpers ────────────────────────────────────────────────────────
  const isDark = bgColor.class.includes('1a1a1a') || bgColor.class.includes('0a0a0a');
  const appliedTextColor = isDark ? 'text-[#e0e0e0]' : textColor.class;
  const borderColor      = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const arrowColor       = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';
  const arrowHoverColor  = isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.35)';
  const iconColor        = isDark ? '#aaaaaa' : '#374151';
  const watermarkColor   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';

  if (!bookData) return null;

  const marqueeText = `${currentPartData.part_title} → ${displayNumber}: ${currentChapterData.chapter_title}`;

  return (
    <div
      className={`flex flex-col transition-colors duration-300 ${bgColor.class} ${appliedTextColor}`}
      style={{ height: '100dvh', overflow: 'hidden', userSelect: 'none' }}
    >
      {/* Header */}
      <header
        className="flex-shrink-0 z-20"
        style={{
          background: isDark ? 'rgba(18,18,18,0.97)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${borderColor}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link to="/" className="p-2 rounded-full active:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-2xl" style={{ color: iconColor }}>arrow_back</span>
            </Link>
            <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-full active:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-2xl" style={{ color: iconColor }}>menu</span>
            </button>
          </div>
          <div className="text-center flex-1 min-w-0 px-2">
            <h1 className="text-xs font-medium tracking-wide truncate" style={{ color: isDark ? '#888' : '#6b7280' }}>
              {bookData.author}
            </h1>
            <div className="text-[10px] truncate" style={{ color: isDark ? '#555' : '#9ca3af' }}>
              {bookData.title}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setBookmarkOpen(true)} className="p-2 rounded-full active:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-xl" style={{ color: iconColor }}>bookmark</span>
            </button>
            <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-full active:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-xl" style={{ color: iconColor }}>settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Marquee */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{
          background: isDark ? 'rgba(180,130,0,0.12)' : '#fef9ec',
          borderBottom: `1px solid ${isDark ? 'rgba(180,130,0,0.18)' : '#fde68a'}`,
          paddingTop: 5, paddingBottom: 5,
        }}
      >
        <div className="whitespace-nowrap animate-marquee inline-block">
          <span className="text-xs font-medium" style={{ color: isDark ? '#c9920a' : '#92400e' }}>
            {marqueeText}&nbsp;&nbsp;&nbsp;◇&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* Width-probe */}
      <div
        ref={measureWidthRef}
        className="max-w-sm mx-auto w-full px-5"
        style={{ height: 0, overflow: 'hidden', visibility: 'hidden', flexShrink: 0 }}
      />

      {/* Page area */}
      <div
        ref={contentAreaRef}
        className="flex-1 relative"
        style={{ overflow: 'hidden', minHeight: 0 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`absolute inset-0 flex flex-col justify-start px-5 py-5 ${
            isFlipping
              ? flipDirection === 'forward' ? 'page-flip-forward' : 'page-flip-backward'
              : ''
          }`}
          style={{ overflow: 'hidden', transformStyle: 'preserve-3d' }}
        >
          {/* Page-number watermark */}
          {pages.length > 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              style={{ zIndex: 0 }}
            >
              <span
                className="font-bold"
                style={{
                  fontSize: '7rem',
                  color: watermarkColor,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {currentPageIndex + 1}
              </span>
            </div>
          )}

          {/* Paragraphs */}
          <div className="relative max-w-sm mx-auto w-full" style={{ zIndex: 1 }}>
            {pages.length > 0 && pages[currentPageIndex] ? (
              pages[currentPageIndex].map((paragraph, idx) => (
                <p
                  key={idx}
                  className={`${font.class}`}
                  style={{
                    fontSize: `${fontSize}rem`,
                    lineHeight: '1.65',
                    wordBreak: 'break-word',
                    marginBottom: idx < pages[currentPageIndex].length - 1 ? '1rem' : 0,
                    marginTop: 0,
                  }}
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p style={{ color: isDark ? '#555' : '#aaa' }}>Loading…</p>
            )}
          </div>
        </div>

        {/* Left arrow */}
        <button
          onClick={goToPrevPage}
          disabled={currentPageIndex === 0 || isFlipping}
          aria-label="Previous page"
          className="prev-arrow absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-200"
          style={{
            zIndex: 10,
            width: 44, height: 72,
            borderRadius: '0 36px 36px 0',
            background: currentPageIndex === 0 ? 'transparent' : arrowColor,
            border: 'none',
            cursor: currentPageIndex === 0 ? 'default' : 'pointer',
            opacity: currentPageIndex === 0 ? 0 : 1,
            transition: 'opacity 0.2s, background 0.2s',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 22,
              color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
            }}
          >
            chevron_left
          </span>
        </button>

        {/* Right arrow */}
        <button
          onClick={goToNextPage}
          disabled={currentPageIndex >= pages.length - 1 || isFlipping}
          aria-label="Next page"
          className="next-arrow absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-200"
          style={{
            zIndex: 10,
            width: 44, height: 72,
            borderRadius: '36px 0 0 36px',
            background: currentPageIndex >= pages.length - 1 ? 'transparent' : arrowColor,
            border: 'none',
            cursor: currentPageIndex >= pages.length - 1 ? 'default' : 'pointer',
            opacity: currentPageIndex >= pages.length - 1 ? 0 : 1,
            transition: 'opacity 0.2s, background 0.2s',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 22,
              color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
            }}
          >
            chevron_right
          </span>
        </button>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee { animation: marquee 18s linear infinite; }

        @keyframes flipFwd {
          0%  { transform: rotateY(0deg);   opacity: 1;   }
          45% { transform: rotateY(-88deg); opacity: 0.2; }
          55% { transform: rotateY(88deg);  opacity: 0.2; }
          100%{ transform: rotateY(0deg);   opacity: 1;   }
        }
        @keyframes flipBwd {
          0%  { transform: rotateY(0deg);  opacity: 1;   }
          45% { transform: rotateY(88deg); opacity: 0.2; }
          55% { transform: rotateY(-88deg);opacity: 0.2; }
          100%{ transform: rotateY(0deg);  opacity: 1;   }
        }
        .page-flip-forward  { animation: flipFwd 0.38s cubic-bezier(0.4,0,0.2,1) forwards; transform-origin: center; }
        .page-flip-backward { animation: flipBwd 0.38s cubic-bezier(0.4,0,0.2,1) forwards; transform-origin: center; }

        .prev-arrow:hover:not(:disabled) { background: ${arrowHoverColor} !important; }
        .next-arrow:hover:not(:disabled) { background: ${arrowHoverColor} !important; }
        .prev-arrow:active:not(:disabled),
        .next-arrow:active:not(:disabled) { transform: translateY(-50%) scale(0.94); }
      `}</style>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-30" onClick={() => setDrawerOpen(false)} />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85%] z-40 shadow-2xl flex flex-col transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: isDark ? '#1c1c1c' : '#ffffff' }}
      >
        <div className="p-5 border-b flex justify-between items-center" style={{ borderColor }}>
          <h2 className="font-semibold text-lg" style={{ color: isDark ? '#e0e0e0' : '#1f2937' }}>Contents</h2>
          <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined" style={{ color: iconColor }}>close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {bookData.parts.map((part, partIdx) => (
            <div key={partIdx} className="mb-6">
              <div className="text-xs uppercase tracking-wider text-amber-600 font-semibold mb-1">
                Part {part.part_number}
              </div>
              <div className="text-sm font-medium mb-2 pl-1" style={{ color: isDark ? '#ccc' : '#374151' }}>
                {part.part_title}
              </div>
              <ul className="space-y-1 ml-2">
                {part.chapters.map((chapter, chIdx) => (
                  <li key={chIdx}>
                    <button
                      onClick={() => {
                        setCurrentPart(partIdx);
                        setCurrentChapter(chIdx);
                        setCurrentPageIndex(0);
                        setDrawerOpen(false);
                      }}
                      className="block w-full text-left py-2 px-2 rounded-lg text-sm transition-colors"
                      style={{
                        background: currentPart === partIdx && currentChapter === chIdx
                          ? '#fef3c7' : 'transparent',
                        color: currentPart === partIdx && currentChapter === chIdx
                          ? '#92400e'
                          : isDark ? '#9ca3af' : '#4b5563',
                        fontWeight: currentPart === partIdx && currentChapter === chIdx ? 600 : 400,
                      }}
                    >
                      {chapter.chapter_number !== 'N/A' ? `Ch ${chapter.chapter_number}: ` : ''}
                      {chapter.chapter_title.length > 35
                        ? chapter.chapter_title.substring(0, 35) + '…'
                        : chapter.chapter_title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <BookmarkModal
        isOpen={bookmarkOpen}
        onClose={() => setBookmarkOpen(false)}
        onSave={saveBookmark}
        currentPageIndex={currentPageIndex}
        totalPages={pages.length}
        currentPageParagraphs={pages[currentPageIndex] || []}
      />

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default ReaderPage;