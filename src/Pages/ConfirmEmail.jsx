import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Components/style/confirmemail.css';

const ConfirmEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Подтверждение электронной почты...');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      axios.get(`/confirm-email?token=${token}`)
        .then(response => {
          setMessage(response.data);
          setTimeout(async () => {
            await axios.post(`/remove-token`, { token });
            navigate('/authorization');
          }, 3000);
        })
        .catch(error => {
          console.error('Ошибка при подтверждении email:', error);
          setMessage(error.response?.data || 'Ошибка при подтверждении email. Пожалуйста, попробуйте позже.');
        });
    } else {
      setMessage('Токен подтверждения отсутствует.');
    }
  }, [location, navigate]);

  return (
    <div className="confirm-email-container">
      <div className="confirm-email-content">
        <h1 className="confirm-email-title">Подтверждение электронной почты</h1>
        <p className="confirm-email-message">{message}</p>
      </div>
    </div>
  );
};

export default ConfirmEmail;