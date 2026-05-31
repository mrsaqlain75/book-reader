import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage({ books }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Book Library | Read Books with Saqlain Amin';
  }, []);

  const handleSelectBook = (book) => {
    navigate(`/book/${book.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 text-center">
          <h1 className="text-xl font-semibold text-gray-800">Read Books</h1>
          <p className="text-sm text-gray-500 mt-1">
            with best experience with{' '}
            <a 
              href="https://saqlainamin.online" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-amber-600 hover:underline"
            >
              Saqlain Amin
            </a>
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {books.map((book, index) => (
            <div
              key={index}
              onClick={() => handleSelectBook(book)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100 cursor-pointer active:scale-98 transition-transform"
            >
              <div className="flex p-4 gap-4">
                <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
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
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800 mb-1">{book.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                  <p className="text-xs text-gray-500 line-clamp-3">{book.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-gray-400 text-xs py-6">
        <div className="max-w-sm mx-auto px-4">
          <p>© 2024 | All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;