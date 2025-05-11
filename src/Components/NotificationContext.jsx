import React, { createContext, useContext, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import CustomToast from './CustomToast'; // Импортируем кастомный компонент

const NotificationContext = createContext();

export const useNotification = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [schedules, setSchedules] = useState([]);
    const [notifiedSchedules, setNotifiedSchedules] = useState([]);
    const [lastCheckedScheduleVersion, setLastCheckedScheduleVersion] = useState(null);
    const studentId = localStorage.getItem('studentId');

    useEffect(() => {
        if (studentId) {
            fetch(`/api/schedules/${studentId}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Loaded schedules:', data); // Временный лог для проверки данных
                    const sortedData = data.sort((a, b) => {
                        const dateA = new Date(a.date);
                        const dateB = new Date(b.date);
                        if (dateA < dateB) return -1;
                        if (dateA > dateB) return 1;
                        const timeA = a.time;
                        const timeB = b.time;
                        if (timeA < timeB) return -1;
                        if (timeA > timeB) return 1;
                        return 0;
                    });
                    setSchedules(sortedData);
                    setLastCheckedScheduleVersion(data.version); // Сохраняем версию расписания
                })
                .catch(error => console.error('Ошибка при получении данных расписания:', error));
        }
    }, [studentId]);

    useEffect(() => {
        const checkUpcomingSchedules = () => {
            const now = new Date();
            console.log('Current time:', now); // Временный лог для проверки текущего времени
            schedules.forEach(schedule => {
                const scheduleDate = new Date(schedule.date);
                const [hours, minutes] = schedule.time.split(':').map(Number);
                scheduleDate.setHours(hours, minutes, 0, 0);
                const timeDiff = scheduleDate - now;
                if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000 && !notifiedSchedules.includes(schedule._id)) {
                    const startTime = scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    toast.custom((t) => (
                        <CustomToast t={t} message={`Занятие начнется в ${startTime}`} />
                    ), {
                        position: 'bottom-right',
                        duration: Infinity,
                    });
                    setNotifiedSchedules(prevNotifiedSchedules => [...prevNotifiedSchedules, schedule._id]);
                }
            });
        };

        const intervalId = setInterval(checkUpcomingSchedules, 1000); // Проверяем каждую минуту
        return () => clearInterval(intervalId);
    }, [schedules, notifiedSchedules]);

    useEffect(() => {
        const checkScheduleChanges = () => {
            if (studentId) {
                fetch(`/api/schedules/${studentId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.version !== lastCheckedScheduleVersion) {
                            toast.custom((t) => (
                                <CustomToast t={t} message="В ваше расписание добавлены изменения." />
                            ), {
                                position: 'bottom-right',
                                duration: Infinity,
                            });
                            setLastCheckedScheduleVersion(data.version); // Обновляем версию расписания
                        }
                    })
                    .catch(error => console.error('Ошибка при получении данных расписания:', error));
            }
        };

        const intervalId = setInterval(checkScheduleChanges, 1000); // Проверяем каждую минуту
        return () => clearInterval(intervalId);
    }, [studentId, lastCheckedScheduleVersion]);

    useEffect(() => {
        toast.custom((t) => (
            <CustomToast t={t} message="Тестовое уведомление" />
        ), {
            position: 'bottom-right',
            duration: Infinity,
        }); // Тестовое уведомление для проверки
    }, []);

    return (
        <NotificationContext.Provider value={{}}>
            {children}
            <Toaster position="bottom-right" />
        </NotificationContext.Provider>
    );
};
