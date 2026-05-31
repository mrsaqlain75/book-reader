import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import HomePage from './components/HomePage';
import ReaderPage from './components/ReaderPage';

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

// Book Loader Component
function BookLoader() {
  const { bookId } = useParams();
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookInfo, setBookInfo] = useState(null);
  const navigate = useNavigate();

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
        <div className="text-amber-500 text-center">
          <div className="text-xl mb-2">Loading book...</div>
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div className="text-xl mb-2">Failed to load book</div>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg">Back to Library</button>
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
    <SettingsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage books={booksList} />} />
          <Route path="/book/:bookId" element={<BookLoader />} />
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;