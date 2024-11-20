import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import '../Components/style/reviews.css';
import { format } from 'date-fns';

const Reviews = () => {
    const [comments, setComments] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchComments = async (page) => {
        try {
            const response = await axios.get('http://localhost:3001/api/comments/db', {
                params: { page, limit: 9 }
            });
            setComments(response.data.comments);
            setTotalPages(Math.ceil(response.data.totalCount / 9));
        } catch (error) {
            console.error('Ошибка при получении комментариев:', error);
        }
    };

    useEffect(() => {
        fetchComments(page);

        // Регулярный запрос для обновления комментариев
        const interval = setInterval(() => fetchComments(page), 60000); // Обновляем комментарии каждые 60 секунд

        return () => {
            clearInterval(interval); // Очистка интервала при размонтировании компонента
        };
    }, [page]);

    const toggleExpand = (id) => {
        setExpanded(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <>
            <Header />
            <main>
                <div className="block-reviews">
                    <div className="conteiner">
                        <div className="flex-boxs-reviews">
                            {comments.map(comment => (
                                <div key={comment.id} className="box-reviews">
                                    <div className="in-box-ots">
                                        <div className="flex-img-icon-text-stars">
                                            <div className="flex-img-icon-text">
                                                <div className='avatar-and-text'>
                                                    <div><img src={comment.user.photo_50} alt="" /></div>
                                                    <div className="teg-p-firstname-lastname">
                                                        <p>{comment.user.first_name}</p>
                                                        <p>{comment.user.last_name}</p>
                                                    </div>
                                                </div>

                                                <div className="comment-date"><p>{format(new Date(comment.date), 'dd.MM.yyyy')}</p></div>
                                            </div>
                                            <div className="flex-five-star">
                                                {/* Здесь можно добавить рейтинг */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="users-review">
                                        <p>{expanded[comment.id] ? comment.text : comment.text.substring(0, 100) + '...'}</p>
                                        <div className="ots-btn-show-all">
                                            <button className="show-all" onClick={() => toggleExpand(comment.id)}>
                                                {expanded[comment.id] ? 'Скрыть' : 'Показать больше'}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            className={page === index + 1 ? 'active' : ''}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </main>
            <Footer />
        </>
    )
}

export default Reviews;
