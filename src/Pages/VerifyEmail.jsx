// frontend/src/components/VerifyEmail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Components/style/verifyEmail.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Проверка токена подтверждения...');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyEmailToken = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/verify-email/${token}`);
                
                if (response.data.success) {
                    setMessage(response.data.message);
                    setIsSuccess(true);
                } else {
                    setMessage(response.data.message);
                    setIsSuccess(false);
                }
            } catch (error) {
                setMessage(error.response?.data?.message || 'Произошла ошибка при подтверждении email');
                setIsSuccess(false);
            } finally {
                setIsLoading(false);
            }
        };

        verifyEmailToken();
    }, [token]);

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                <h2>Подтверждение Email</h2>
                {isLoading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    <>
                        <p className={isSuccess ? 'success-message' : 'error-message'}>
                            {message}
                        </p>
                        <button 
                            onClick={() => navigate('/authorization')}
                            className="verify-email-button"
                        >
                            Перейти к странице входа
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;