import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./Booklist.css"

interface Book {
  id: number;
  title: string;
  chapter_ids: number[];
}

interface Page {
  id: number;
  page_index: number;
  image: {
    id: number;
    file: string;
    width: number;
    height: number;
    created_at: string;
    updated_at: string;
  };
}

interface Chapter {
  id: number;
  title: string;
  book: Book[]; 
  chapter_index: number;
  pages: Page[]; 
}

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedChapterTitle, setSelectedChapterTitle] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true); 
  const [activeButtonId, setActiveButtonId] = useState<number | null>(null); 
  const [activeBookId, setActiveBookId] = useState<number | null>(null); 

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get<Book[]>('http://52.195.171.228:8080/books/');
        setBooks(response.data);
        setLoading(false); 
      } catch (error) {
        console.error('Error fetching books:', error);
        setLoading(false); 
      }
    };
    fetchBooks();
  }, []);

  const fetchChapterDetails = async (chapterId: number) => {
    try {
      const response = await axios.get<Chapter>(`http://52.195.171.228:8080/chapters/${chapterId}/`);
      setSelectedChapterTitle(response.data.title); 
      setPages(response.data.pages); 
      setCurrentPageIndex(0); 
      setCurrentChapterId(chapterId); 
      setActiveButtonId(chapterId); 
    } catch (error) {
      console.error('Error fetching chapter details:', error);
    }
  };

  const nextPage = async () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      if (selectedBook && currentChapterId) {
        const currentChapterIndex = selectedBook.chapter_ids.indexOf(currentChapterId);
        if (currentChapterIndex !== -1 && currentChapterIndex < selectedBook.chapter_ids.length - 1) {
          const nextChapterId = selectedBook.chapter_ids[currentChapterIndex + 1];
          await fetchChapterDetails(nextChapterId); 
        }
      }
    }
    setIsImageLoading(true); 
  };

  const prevPage = async () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else {
      if (selectedBook && currentChapterId) {
        const currentChapterIndex = selectedBook.chapter_ids.indexOf(currentChapterId);
        if (currentChapterIndex > 0) {
          const prevChapterId = selectedBook.chapter_ids[currentChapterIndex - 1];
          const prevChapterResponse = await axios.get<Chapter>(`http://52.195.171.228:8080/chapters/${prevChapterId}/`);
          setSelectedChapterTitle(prevChapterResponse.data.title); 
          setPages(prevChapterResponse.data.pages); 
          setCurrentPageIndex(prevChapterResponse.data.pages.length - 1); 
          setCurrentChapterId(prevChapterId); 
          setActiveButtonId(prevChapterId); 
        }
      }
    }
    setIsImageLoading(true); 
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <div className="book-list-container">
      {loading ? (
        <p>Loading books...</p>
      ) : (
        <div>
          <div>
            {books.map((book) => (
              <button 
                key={book.id} 
                onClick={() => {
                  setSelectedBook(book);
                  setActiveBookId(book.id); 
                }} 
                className={activeBookId === book.id ? 'active' : ''} 
              >
                {book.title}
              </button>
            ))}
          </div>

          {selectedBook && (
            <div>
              <div>
                {selectedBook.chapter_ids?.length > 0 ? (
                  selectedBook.chapter_ids.map((chapterId) => (
                    <button 
                      key={chapterId} 
                      onClick={() => fetchChapterDetails(chapterId)} 
                      className={activeButtonId === chapterId ? 'active' : ''} 
                    >
                      Chapter {chapterId}
                    </button>
                  ))
                ) : (
                  <p>No chapters available</p>
                )}              
              </div>
              {selectedChapterTitle && (
                <div>
                </div>
              )}

              {isImageLoading && <p>Loading image...</p>}

              {pages.length > 0 && (
                <div className="image-container" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div 
                    className="left-overlay" 
                    onClick={prevPage}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: '20%', 
                      cursor: 'pointer',
                      zIndex: 1,
                    }} 
                  />
                  <div 
                    className="right-overlay" 
                    onClick={nextPage}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: '20%', 
                      cursor: 'pointer',
                      zIndex: 1,
                    }} 
                  />
                  
                  {pages[currentPageIndex] && (
                    <img 
                      src={pages[currentPageIndex].image.file} 
                      alt={`Page ${currentPageIndex + 1}`}
                      loading="lazy"  
                      onLoad={handleImageLoad}
                      style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }} 
                    />
                  )}

                  <p style={{fontSize : "32px"}}>
                     {currentPageIndex + 1} / {pages.length}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookList;
