import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

// Helper function to update page title
const updateTitle = (title) => {
  document.title = title;
};

// Homepage Component
function HomePage({ books }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  // Set page title
  useEffect(() => {
    updateTitle('Book Library | Read Books with Saqlain Amin');
  }, []);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSelectBook = (book) => {
    navigate(`/book/${book.id}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 text-center">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Read Books</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              with best experience with{' '}
              <a 
                href="https://saqlainamin.online" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                Saqlain Amin
              </a>
            </p>
        </div>
      </header>

      {/* Theme Toggle Button on Homepage */}
      <div className="max-w-md mx-auto px-4 py-2 flex justify-end">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>

      {/* Book List */}
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {books.map((book, index) => (
            <div
              key={index}
              onClick={() => handleSelectBook(book)}
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer active:scale-98 transition-transform"
            >
              <div className="flex p-4 gap-4">
                {/* Book Cover */}
                <div className="w-24 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={`Cover of ${book.title}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/96x128?text=No+Cover';
                    }}
                  />
                </div>
                {/* Book Info */}
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{book.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">by {book.author}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{book.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-400 dark:text-gray-600 text-xs py-6">
        <div className="max-w-sm mx-auto px-4">
          <button onClick={toggleTheme} className="hover:underline">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </footer>
    </div>
  );
}

// Reader Component
function ReaderPage({ bookData, bookTitle, bookAuthor }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPart, setCurrentPart] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  // Set page title based on current chapter
  useEffect(() => {
    if (bookData && currentChapterData) {
      const chapterNum = currentChapterData?.chapter_number !== 'N/A' 
        ? `Chapter ${currentChapterData.chapter_number}` 
        : '';
      updateTitle(`${chapterNum} - ${currentChapterData?.chapter_title} | ${bookTitle}`);
    } else {
      updateTitle(`${bookTitle} by ${bookAuthor} | Read Online`);
    }
  }, [currentPart, currentChapter, bookData, bookTitle, bookAuthor]);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Load saved progress for this book
  useEffect(() => {
    const savedPart = localStorage.getItem(`book_part_${bookTitle}`);
    const savedChapter = localStorage.getItem(`book_chapter_${bookTitle}`);
    if (savedPart !== null && savedChapter !== null) {
      setCurrentPart(parseInt(savedPart));
      setCurrentChapter(parseInt(savedChapter));
    }
  }, [bookTitle]);

  // Save progress
  const saveProgress = useCallback(() => {
    localStorage.setItem(`book_part_${bookTitle}`, currentPart);
    localStorage.setItem(`book_chapter_${bookTitle}`, currentChapter);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, [currentPart, currentChapter, bookTitle]);

  // Handle scroll
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

  // Navigation
  const navigateTo = useCallback((partIdx, chapterIdx) => {
    setCurrentPart(partIdx);
    setCurrentChapter(chapterIdx);
    setDrawerOpen(false);
    setTimeout(() => {
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }, 100);
  }, []);

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

  if (!bookData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div className="text-xl mb-2">Failed to load book</div>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const currentPartData = bookData.parts[currentPart];
  const currentChapterData = currentPartData?.chapters[currentChapter];
  const displayNumber = currentChapterData?.chapter_number !== 'N/A' 
    ? `Chapter ${currentChapterData?.chapter_number}` 
    : '';

  const paragraphs = currentChapterData?.content
    .split(/\n\n+/)
    .filter(p => p.trim().length > 0)
    .map(p => p.trim());

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] selection:bg-amber-600/30 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Back Button to Home */}
            <Link 
              to="/"
              className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl text-gray-700 dark:text-gray-300">arrow_back</span>
            </Link>
            {/* Menu Button */}
            <button 
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl text-gray-700 dark:text-gray-300">menu</span>
            </button>
          </div>
          
          <div className="text-center flex-1">
            <h1 className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide">{bookData.author}</h1>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[120px] mx-auto">{bookData.title}</div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            
            {/* Save Button */}
            <button 
              onClick={saveProgress}
              className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">save</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        ref={contentRef}
        className="flex-1 overflow-y-auto pb-24 pt-2"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <div className="max-w-sm mx-auto px-5">
          {/* Chapter Header */}
          <div className="mb-10 text-center pt-4">
            <div className="w-12 h-0.5 bg-amber-500 dark:bg-amber-600 mx-auto mb-5"></div>
            <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">Part {currentPartData.part_number}</p>
            <h2 className="text-base font-semibold text-amber-600 dark:text-amber-500 mt-2 tracking-wide">{currentPartData.part_title}</h2>
            {displayNumber && (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-5 mb-2 tracking-tight">{displayNumber}</h1>
            )}
            <h3 className="text-xl text-gray-700 dark:text-gray-300 italic font-serif mt-2">{currentChapterData.chapter_title}</h3>
          </div>

          {/* Book Content */}
          <div className="space-y-8">
            {paragraphs.map((paragraph, idx) => (
              <p 
                key={idx} 
                className="text-gray-800 dark:text-[#e0e0e0] leading-relaxed font-serif"
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
          <div className="mt-12 pt-6 text-center border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center gap-3">
              <button 
                onClick={goPrev}
                disabled={currentPart === 0 && currentChapter === 0}
                className={`flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 ${
                  currentPart === 0 && currentChapter === 0 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                ← Previous
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {currentPart + 1}/{bookData.parts.length}
              </span>
              <button 
                onClick={goNext}
                disabled={currentPart === bookData.parts.length - 1 && currentChapter === currentPartData.chapters.length - 1}
                className={`flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 ${
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
        <div className={`fixed top-0 left-0 h-full w-80 max-w-[85%] bg-white dark:bg-[#0f0f0f] z-40 shadow-2xl drawer-transition flex flex-col ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-200">Contents</h2>
            <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-full active:bg-gray-100 dark:active:bg-gray-800">
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll p-4">
            {bookData.parts.map((part, partIdx) => (
              <div key={partIdx} className="mb-6">
                <div className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500 font-semibold mb-2">
                  Part {part.part_number}
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-2 pl-1">{part.part_title}</div>
                <ul className="space-y-1 ml-2">
                  {part.chapters.map((chapter, chIdx) => (
                    <li key={chIdx}>
                      <button
                        onClick={() => navigateTo(partIdx, chIdx)}
                        className={`block w-full text-left py-2 px-2 rounded-lg transition-colors text-sm ${
                          currentPart === partIdx && currentChapter === chIdx
                            ? 'bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {chapter.chapter_number !== 'N/A' ? `Ch ${chapter.chapter_number}: ` : ''}
                        {chapter.chapter_title.length > 35 ? chapter.chapter_title.substring(0, 35) + '...' : chapter.chapter_title}
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
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-amber-500 dark:bg-amber-600 text-white px-4 py-2.5 rounded-full text-sm font-medium progress-toast shadow-lg">
          📚 Progress saved!
        </div>
      )}

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800">
        <div className="h-full bg-amber-500 dark:bg-amber-600 transition-all duration-300" style={{ width: `${scrollPercent * 100}%` }} />
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-400 dark:text-gray-600 text-xs py-4">
        <div className="max-w-sm mx-auto px-4">
          <button onClick={saveProgress} className="text-amber-600 dark:text-amber-500 hover:underline">
            Save Progress
          </button>
          <span className="mx-2">·</span>
          <span>{Math.round(scrollPercent * 100)}% read</span>
          <span className="mx-2">·</span>
          <button onClick={toggleTheme} className="hover:underline">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <span className="mx-2">·</span>
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Library
          </Link>
        </div>
      </footer>
    </div>
  );
}

// Wrapper component that loads book data based on URL param
function BookLoader() {
  const { bookId } = useParams();
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookInfo, setBookInfo] = useState(null);
  const navigate = useNavigate();

  // Books list
  const booksList = [
    {
      id: "how-to-win-friends",
      title: "How to Win Friends and Influence People",
      author: "Dale Carnegie",
      coverUrl: "https://mphonline.com/cdn/shop/files/9780091906351_mph_HowtoWinFriendsandInfluencePeople.jpg?v=1703729569&width=640",
      description: "The classic guide to effective communication, leadership, and building lasting relationships. Over 30 million copies sold worldwide.",
      jsonPath: "/book.json"
    }
    // Add more books here later
  ];

  // Clean text function
  const cleanText = (text) => {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
      .replace(/([^\n])\n([^\n])/g, '$1 $2')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  useEffect(() => {
    const book = booksList.find(b => b.id === bookId);
    if (!book) {
      navigate('/');
      return;
    }
    setBookInfo(book);
    
    fetch(book.jsonPath)
      .then(res => res.json())
      .then(data => {
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
      })
      .catch(err => {
        console.error('Error loading book:', err);
        setLoading(false);
      });
  }, [bookId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-amber-600 dark:text-amber-500 text-center">
          <div className="text-xl mb-2">Loading book...</div>
          <div className="w-8 h-8 border-2 border-amber-600 dark:border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div className="text-xl mb-2">Failed to load book</div>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-amber-500 text-white rounded-lg">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return <ReaderPage bookData={bookData} bookTitle={bookInfo.title} bookAuthor={bookInfo.author} />;
}

// Main App Component
function App() {
  const booksList = [
    {
      id: "how-to-win-friends",
      title: "How to Win Friends and Influence People",
      author: "Dale Carnegie",
      coverUrl: "https://mphonline.com/cdn/shop/files/9780091906351_mph_HowtoWinFriendsandInfluencePeople.jpg?v=1703729569&width=640",
      description: "The classic guide to effective communication, leadership, and building lasting relationships. Over 30 million copies sold worldwide.",
      jsonPath: "/book.json"
    }
  ];

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage books={booksList} />} />
        <Route path="/book/:bookId" element={<BookLoader />} />
      </Routes>
    </Router>
  );
}

export default App;