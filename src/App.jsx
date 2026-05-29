import { useState, useEffect, useRef, useCallback } from 'react';

function App() {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPart, setCurrentPart] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const contentRef = useRef(null);

  // Clean text function - removes PDF artifacts, extra spaces, line breaks
  const cleanText = (text) => {
    return text
      // Preserve double newlines for paragraph breaks
      .replace(/\r\n/g, '\n')
      // Fix hyphenated words broken across lines
      .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
      // Remove single newlines within paragraphs (but keep double for paragraph breaks)
      .replace(/([^\n])\n([^\n])/g, '$1 $2')
      // Remove extra spaces
      .replace(/[ \t]+/g, ' ')
      // Fix space before punctuation
      .replace(/\s+([.,!?;:])/g, '$1')
      // Ensure proper paragraph spacing (exactly two newlines between paragraphs)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Load book data
  useEffect(() => {
    fetch('/book.json')
      .then(res => res.json())
      .then(data => {
        // Clean all chapter content
        const cleanedData = {
          ...data,
          parts: data.parts.map(part => ({
            ...part,
            chapters: part.chapters.map(chapter => ({
              ...chapter,
              content: cleanText(chapter.content)
            }))
          }))
        };
        setBookData(cleanedData);
        setLoading(false);
        // Load saved progress
        const savedPart = localStorage.getItem('book_part');
        const savedChapter = localStorage.getItem('book_chapter');
        if (savedPart !== null && savedChapter !== null) {
          setCurrentPart(parseInt(savedPart));
          setCurrentChapter(parseInt(savedChapter));
        }
      })
      .catch(err => {
        console.error('Error loading book:', err);
        setLoading(false);
      });
  }, []);

  // Save progress
  const saveProgress = useCallback(() => {
    localStorage.setItem('book_part', currentPart);
    localStorage.setItem('book_chapter', currentChapter);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, [currentPart, currentChapter]);

  // Handle scroll for progress bar
  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const el = contentRef.current;
      const percent = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrollPercent(percent);
    }
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Navigate to chapter
  const navigateTo = useCallback((partIdx, chapterIdx) => {
    setCurrentPart(partIdx);
    setCurrentChapter(chapterIdx);
    setDrawerOpen(false);
    setTimeout(() => {
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }, 100);
  }, []);

  // Next/Previous navigation
  const goPrev = useCallback(() => {
    if (currentChapter > 0) {
      navigateTo(currentPart, currentChapter - 1);
    } else if (currentPart > 0 && bookData?.parts[currentPart - 1]?.chapters) {
      const prevPartChapters = bookData.parts[currentPart - 1].chapters.length;
      navigateTo(currentPart - 1, prevPartChapters - 1);
    }
  }, [currentPart, currentChapter, bookData, navigateTo]);

  const goNext = useCallback(() => {
    if (bookData) {
      const currentPartChapters = bookData.parts[currentPart].chapters.length;
      if (currentChapter < currentPartChapters - 1) {
        navigateTo(currentPart, currentChapter + 1);
      } else if (currentPart < bookData.parts.length - 1) {
        navigateTo(currentPart + 1, 0);
      }
    }
  }, [currentPart, currentChapter, bookData, navigateTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-amber-500 text-center">
          <div className="text-xl mb-2">Loading book...</div>
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div className="text-xl mb-2">Failed to load book</div>
          <div className="text-sm text-gray-400">Make sure book.json is in the public folder</div>
        </div>
      </div>
    );
  }

  const currentPartData = bookData.parts[currentPart];
  const currentChapterData = currentPartData?.chapters[currentChapter];
  const displayNumber = currentChapterData?.chapter_number !== 'N/A' 
    ? `Chapter ${currentChapterData?.chapter_number}` 
    : '';

  // Split content into paragraphs (preserving double newline spacing)
  const paragraphs = currentChapterData?.content
    .split(/\n\n+/)
    .filter(p => p.trim().length > 0)
    .map(p => p.trim());

  return (
    <div className="min-h-screen bg-[#0a0a0a] selection:bg-amber-600/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-full active:bg-gray-800 transition-colors"
            aria-label="Table of contents"
          >
            <span className="material-symbols-outlined text-2xl text-gray-300">menu</span>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-xs font-medium text-gray-400 tracking-wide font-['Inter']">{bookData.author}</h1>
            <div className="text-[10px] text-gray-500 truncate max-w-[150px] mx-auto font-['Inter']">{bookData.title}</div>
          </div>
          <button 
            onClick={saveProgress}
            className="p-2 -mr-2 rounded-full active:bg-gray-800 transition-colors"
            aria-label="Save progress"
          >
            <span className="material-symbols-outlined text-xl text-gray-300">save</span>
          </button>
        </div>
      </header>

      {/* Main Content - Narrow width for 5-6 words per line */}
      <main 
        ref={contentRef}
        className="flex-1 overflow-y-auto pb-24 pt-2"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <div className="max-w-sm mx-auto px-5">
          {/* Chapter Header */}
          <div className="mb-10 text-center pt-4">
            <div className="w-12 h-0.5 bg-amber-600 mx-auto mb-5"></div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-['Inter']">Part {currentPartData.part_number}</p>
            <h2 className="text-base font-semibold text-amber-500 mt-2 tracking-wide font-['Inter']">{currentPartData.part_title}</h2>
            {displayNumber && (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mt-5 mb-2 font-['Inter'] tracking-tight">{displayNumber}</h1>
            )}
            <h3 className="text-xl text-gray-300 italic font-['Georgia',serif] mt-2">{currentChapterData.chapter_title}</h3>
          </div>

          {/* Book Content - Elegant serif font for body text */}
          <div className="space-y-8">
            {paragraphs.map((paragraph, idx) => (
              <p 
                key={idx} 
                className="text-[#e0e0e0] leading-relaxed font-['Georgia','Times New Roman',serif]"
                style={{ 
                  fontSize: '1.1rem',
                  lineHeight: '1.75',
                  wordBreak: 'break-word',
                  letterSpacing: '0.003em',
                  marginBottom: '1.75rem'
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-12 pt-6 text-center text-gray-500 text-sm border-t border-gray-800">
            <div className="flex justify-between items-center gap-3">
              <button 
                onClick={goPrev}
                disabled={currentPart === 0 && currentChapter === 0}
                className={`flex-1 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-all active:scale-95 font-['Inter'] ${
                  currentPart === 0 && currentChapter === 0 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                ← Previous
              </button>
              <span className="text-xs text-gray-500 whitespace-nowrap font-['Inter']">
                {currentPart + 1}/{bookData.parts.length}
              </span>
              <button 
                onClick={goNext}
                disabled={currentPart === bookData.parts.length - 1 && currentChapter === currentPartData.chapters.length - 1}
                className={`flex-1 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-all active:scale-95 font-['Inter'] ${
                  currentPart === bookData.parts.length - 1 && currentChapter === currentPartData.chapters.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Navigation Drawer */}
      <>
        {drawerOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 transition-opacity duration-200"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <div className={`fixed top-0 left-0 h-full w-80 max-w-[85%] bg-[#0f0f0f] z-40 shadow-2xl drawer-transition flex flex-col ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-5 border-b border-gray-800 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-200 font-['Inter']">Contents</h2>
            <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-full active:bg-gray-800">
              <span className="material-symbols-outlined text-gray-400">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll p-4">
            {bookData.parts.map((part, partIdx) => (
              <div key={partIdx} className="mb-6">
                <div className="text-xs uppercase tracking-wider text-amber-500 font-semibold mb-2 font-['Inter']">
                  Part {part.part_number}
                </div>
                <div className="text-sm font-medium text-gray-300 mb-2 pl-1 font-['Inter']">{part.part_title}</div>
                <ul className="space-y-1 ml-2">
                  {part.chapters.map((chapter, chIdx) => (
                    <li key={chIdx}>
                      <button
                        onClick={() => navigateTo(partIdx, chIdx)}
                        className={`block w-full text-left py-2 px-2 rounded-lg transition-colors text-sm font-['Inter'] ${
                          currentPart === partIdx && currentChapter === chIdx
                            ? 'bg-amber-600/20 text-amber-400 font-medium'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }`}
                      >
                        <span className="block">
                          {chapter.chapter_number !== 'N/A' ? `Ch ${chapter.chapter_number}: ` : ''}
                          <span className="text-xs">{chapter.chapter_title.length > 35 ? chapter.chapter_title.substring(0, 35) + '...' : chapter.chapter_title}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </>

      {/* Progress Toast */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-amber-600 text-black px-4 py-2.5 rounded-full text-sm font-medium progress-toast shadow-lg font-['Inter']">
          📚 Progress saved!
        </div>
      )}

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${scrollPercent * 100}%` }} />
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-600 text-xs py-4">
        <div className="max-w-sm mx-auto px-4 font-['Inter']">
          <button onClick={saveProgress} className="text-amber-500 hover:text-amber-400 underline">
            Save Progress
          </button>
          <span className="mx-2">·</span>
          <span>{Math.round(scrollPercent * 100)}% read</span>
        </div>
      </footer>
    </div>
  );
}

export default App;