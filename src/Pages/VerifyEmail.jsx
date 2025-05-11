import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Components/style/emailVerification.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyEmailToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Токен подтверждения отсутствует');
        setLoading(false);
        return;
      }

      try {
        await axios.get(`/verify-email?token=${token}`);
        navigate('/email-verified');
      } catch (err) {
        setError(err.response?.data?.error || 'Ошибка при подтверждении email');
      } finally {
        setLoading(false);
      }
    };

    verifyEmailToken();
  }, [searchParams, navigate]);

  return (
    <div className="email-verification-container">
      <h2 className="email-verification-title">Подтверждение Email</h2>
      
      {loading ? (
        <>
          <div className="verify-email-spinner"></div>
          <p className="email-verification-message">Идет подтверждение вашего email...</p>
        </>
      ) : error ? (
        <>
          <p className="verify-email-error">{error}</p>
          <a href="/resend-verification" className="verify-email-resend-link">
            Отправить письмо повторно
          </a>
        </>
      ) : null}
    </div>
  );
};

export default VerifyEmail;