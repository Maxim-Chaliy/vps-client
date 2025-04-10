import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import '../Components/style/reviews.css';
import { format } from 'date-fns';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaQuoteLeft } from 'react-icons/fa';

const Reviews = () => {
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchComments = async (page) => {
        try {
            const response = await axios.get('http://localhost:3001/api/comments/db', {
                params: { page, limit: 5 }
            });
            setComments(response.data.comments);
            setTotalPages(Math.ceil(response.data.totalCount / 5));
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при получении комментариев:', error);
            setError('Не удалось загрузить комментарии. Пожалуйста, попробуйте позже.');
        }
    };

    useEffect(() => {
        fetchComments(page);

        const interval = setInterval(() => fetchComments(page), 60000);
        return () => clearInterval(interval);
    }, [page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <>
            <Header />
            <main className="reviews-main">
                <div className='reviews-all-content'>
                    <div className="reviews-header">
                        <div className="decorative-dots decorative-dots-1"></div>
                        <div className="decorative-dots decorative-dots-2"></div>
                        <h1>Отзывы наших учеников</h1>
                        <p>Реальные истории успеха и благодарности</p>
                    </div>

                    <div className="block-reviews">
                        <div className="reviews-container">
                            {error && <div className="error-message">{error}</div>}

                            <div className="comments-list">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="comment-card skeleton-card">
                                            <div className="comment-header">
                                                <div className="comment-author">
                                                    <div><Skeleton circle={true} height={60} width={60} /></div>
                                                    <div className="author-info">
                                                        <Skeleton width={150} />
                                                        <Skeleton width={100} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="comment-text">
                                                <Skeleton count={4} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="comment-card">
                                            <div className="quote-icon">
                                                <FaQuoteLeft />
                                            </div>
                                            <div className="comment-header">
                                                <div className="comment-author">
                                                    <div className="avatar-wrapper">
                                                        <img
                                                            src={comment.user.photo_50 || '/default-avatar.png'}
                                                            alt={`${comment.user.first_name} ${comment.user.last_name}`}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = '/default-avatar.png';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="author-info">
                                                        <h3 className="user-name">{comment.user.first_name} {comment.user.last_name}</h3>
                                                        <p className="user-date">{format(new Date(comment.date), 'dd.MM.yyyy')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="comment-text">
                                                <p>{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <div className="pagination">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="pagination-arrow"
                                >
                                    &lt;
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = index + 1;
                                    } else if (page <= 3) {
                                        pageNum = index + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + index;
                                    } else {
                                        pageNum = page - 2 + index;
                                    }

                                    return (
                                        <button
                                            key={index}
                                            className={page === pageNum ? 'active' : ''}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="pagination-arrow"
                                >
                                    &gt;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}

export default Reviews;