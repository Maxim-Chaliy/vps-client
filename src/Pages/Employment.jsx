import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../Components/style/employment.css";
import {
  format, addDays, subDays, isSameDay, parseISO,
  startOfWeek, addWeeks, subWeeks, eachDayOfInterval
} from "date-fns";
import { ru } from "date-fns/locale";
import axios from "axios";

const Employment = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day");
  const [timeIntervals, setTimeIntervals] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [modal, setModal] = useState({
    show: false,
    type: '',
    lesson: null,
    newDate: format(new Date(), 'yyyy-MM-dd'),
    newTime: '09:00'
  });

  useEffect(() => {
    if (viewMode === "day") {
      fetchDailySchedule();
    } else {
      fetchWeeklySchedule();
    }
  }, [currentDate, currentWeekStart, viewMode]);

  const fetchDailySchedule = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/employment/daily?date=${format(currentDate, 'yyyy-MM-dd')}`
      );
      const intervals = generateIntervals(response.data.schedules);
      setTimeIntervals(intervals);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchWeeklySchedule = async () => {
    try {
      const weekDays = eachDayOfInterval({
        start: currentWeekStart,
        end: addDays(currentWeekStart, 6)
      });

      const weekPromises = weekDays.map(day =>
        axios.get(`http://localhost:3001/api/employment/daily?date=${format(day, 'yyyy-MM-dd')}`)
      );

      const weekResponses = await Promise.all(weekPromises);
      const weekData = weekResponses.map(res => res.data);

      setWeekSchedule(weekData.map((dayData, index) => ({
        date: weekDays[index],
        intervals: generateIntervals(dayData.schedules)
      })));
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
    }
  };

  const generateIntervals = (schedules) => {
    const intervals = [];
    let lastEnd = 0;

    const sortedLessons = [...(schedules || [])].sort((a, b) =>
      timeToMinutes(a.time) - timeToMinutes(b.time)
    );

    sortedLessons.forEach(lesson => {
      const lessonStart = timeToMinutes(lesson.time);
      const lessonEnd = lessonStart + lesson.duration;

      if (lessonStart > lastEnd) {
        intervals.push({
          type: "free",
          start: minutesToTime(lastEnd),
          end: minutesToTime(lessonStart),
          duration: lessonStart - lastEnd
        });
      }

      intervals.push({
        type: "booked",
        start: lesson.time,
        end: minutesToTime(lessonEnd),
        duration: lesson.duration,
        lesson: lesson
      });

      lastEnd = lessonEnd;
    });

    if (lastEnd < 1440) {
      intervals.push({
        type: "free",
        start: minutesToTime(lastEnd),
        end: "24:00",
        duration: 1440 - lastEnd
      });
    }

    return intervals;
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const handlePrevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const handleDateChange = (e) => {
    setCurrentDate(new Date(e.target.value));
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleWeekDateChange = (e) => {
    setCurrentWeekStart(startOfWeek(new Date(e.target.value)));
  };

  const getFullName = (student) => {
    if (!student) return '';
    return `${student.surname} ${student.name} ${student.patronymic || ''}`;
  };

  const showModal = (type, lesson) => {
    setModal({
      show: true,
      type,
      lesson,
      newDate: format(new Date(lesson.date), 'yyyy-MM-dd'),
      newTime: lesson.time
    });
  };

  const hideModal = () => {
    setModal({ show: false, type: '', lesson: null });
  };

  const cancelLesson = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/employment/${modal.lesson._id}`);
      if (viewMode === "day") {
        fetchDailySchedule();
      } else {
        fetchWeeklySchedule();
      }
      hideModal();
      alert('Занятие успешно отменено');
    } catch (error) {
      console.error('Error canceling lesson:', error);
      alert('Не удалось отменить занятие');
    }
  };

  const handleReschedule = async () => {
    try {
      const checkResponse = await axios.get(
        `http://localhost:3001/api/employment/check-availability`,
        {
          params: {
            date: modal.newDate,
            time: modal.newTime,
            duration: modal.lesson.duration,
            excludeId: modal.lesson._id
          }
        }
      );

      if (checkResponse.data.isAvailable) {
        await axios.put(
          `http://localhost:3001/api/employment/${modal.lesson._id}/reschedule`,
          {
            date: modal.newDate,
            time: modal.newTime
          }
        );
        if (viewMode === "day") {
          fetchDailySchedule();
        } else {
          fetchWeeklySchedule();
        }
        hideModal();
        alert('Занятие успешно перенесено!');
      } else {
        alert('Выбранное время уже занято другим занятием!');
      }
    } catch (error) {
      console.error('Error rescheduling lesson:', error);
      alert('Ошибка при переносе занятия');
    }
  };

  const renderWeekView = () => {
    const weekDays = eachDayOfInterval({
      start: currentWeekStart,
      end: addDays(currentWeekStart, 6)
    });

    return (
      <div className="week-view">
        <div className="week-navigation">
          <button className="nav-button" onClick={handlePrevWeek}>
            &lt; Предыдущая
          </button>

          <div className="current-week">
            <input
              type="date"
              value={format(currentWeekStart, 'yyyy-MM-dd')}
              onChange={handleWeekDateChange}
              className="date-picker"
            />
            <div className="week-text">
              Неделя {format(currentWeekStart, 'd MMMM', { locale: ru })} - {format(addDays(currentWeekStart, 6), 'd MMMM yyyy', { locale: ru })}
            </div>
          </div>

          <button className="nav-button" onClick={handleNextWeek}>
            Следующая &gt;
          </button>
        </div>

        <div className="table-responsive">
          <table className="week-table">
            <thead>
              <tr>
                <th>Время</th>
                {weekDays.map((day, index) => (
                  <th key={index}>
                    <div>{format(day, 'EEEEEE', { locale: ru })}</div>
                    <div>{format(day, 'd', { locale: ru })}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 24 }).map((_, hour) => {
                const timeLabel = `${hour}:00`;
                return (
                  <tr key={hour}>
                    <td className="time-cell">{timeLabel}</td>
                    {weekDays.map((day, dayIndex) => {
                      const daySchedule = weekSchedule[dayIndex];
                      const hourIntervals = daySchedule?.intervals.filter(
                        interval => interval.start.startsWith(timeLabel.substring(0, 2))
                      );

                      return (
                        <td key={dayIndex} className="day-cell">
                          {hourIntervals?.map((interval, i) => (
                            <div
                              key={i}
                              className={`week-interval ${interval.type}`}
                            >
                              {interval.type === 'booked' && (
                                <div className="week-lesson-info">
                                  <div className="week-student-name">
                                    {interval.lesson.student_id ?
                                      getFullName(interval.lesson.student_id) :
                                      interval.lesson.group_id.name}
                                  </div>
                                  <div className="week-subject">
                                    {interval.lesson.subject}
                                  </div>
                                  <div className="week-time">
                                    {interval.start}-{interval.end}
                                  </div>
                                  <div className="week-actions">
                                    <button
                                      className="week-action-button reschedule"
                                      onClick={() => showModal('reschedule', interval.lesson)}
                                    >
                                      Перенести
                                    </button>
                                    <button
                                      className="week-action-button cancel"
                                      onClick={() => showModal('cancel', interval.lesson)}
                                    >
                                      Отменить
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="employment-container">
        <h1>Мое расписание</h1>

        <div className="view-controls">
          <button
            className={viewMode === "day" ? "active" : ""}
            onClick={() => setViewMode("day")}
          >
            День
          </button>
          <button
            className={viewMode === "week" ? "active" : ""}
            onClick={() => setViewMode("week")}
          >
            Неделя
          </button>
        </div>

        {viewMode === "day" ? (
          <div className="day-view">
            <div className="date-navigation">
              <button className="nav-button" onClick={handlePrevDay}>
                &lt; Назад
              </button>

              <div className="current-date">
                <input
                  type="date"
                  value={format(currentDate, 'yyyy-MM-dd')}
                  onChange={handleDateChange}
                  className="date-picker"
                />
                <div className="date-text">
                  {format(currentDate, 'EEEE, d MMMM yyyy', { locale: ru })}
                </div>
              </div>

              <button className="nav-button" onClick={handleNextDay}>
                Вперед &gt;
              </button>
            </div>

            <div className="schedule-intervals">
              {timeIntervals.map((interval, index) => (
                <div
                  key={index}
                  className={`time-interval ${interval.type}`}
                >
                  <div className="interval-time">
                    {interval.start} - {interval.end}
                  </div>
                  <div className="interval-content">
                    {interval.type === "booked" ? (
                      <>
                        <div className="student-name" title={interval.lesson.student_id ? getFullName(interval.lesson.student_id) : interval.lesson.group_id.name}>
                          {interval.lesson.student_id ? getFullName(interval.lesson.student_id) : interval.lesson.group_id.name}
                        </div>
                        <div className="subject" title={interval.lesson.subject}>
                          {interval.lesson.subject}
                        </div>
                        <div className="duration">{interval.duration} мин.</div>
                        <div className="lesson-actions">
                          <button
                            className="action-button reschedule"
                            onClick={() => showModal('reschedule', interval.lesson)}
                          >
                            Перенести
                          </button>
                          <button
                            className="action-button cancel"
                            onClick={() => showModal('cancel', interval.lesson)}
                          >
                            Отменить
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="free-label">Свободно</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          renderWeekView()
        )}

        {modal.show && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>
                {modal.type === 'cancel'
                  ? 'Подтверждение отмены занятия'
                  : 'Перенос занятия'}
              </h3>

              {modal.type === 'reschedule' && (
                <div className="reschedule-controls">
                  <label>
                    Новая дата:
                    <input
                      type="date"
                      value={modal.newDate}
                      onChange={(e) => setModal({...modal, newDate: e.target.value})}
                    />
                  </label>
                  <label>
                    Новое время:
                    <input
                      type="time"
                      value={modal.newTime}
                      onChange={(e) => setModal({...modal, newTime: e.target.value})}
                    />
                  </label>
                </div>
              )}

              <div className="modal-lesson-info">
                <p><strong>Текущее время:</strong> {modal.lesson.time} - {modal.lesson.endTime}</p>
                <p><strong>Студент:</strong> {modal.lesson.student_id ? getFullName(modal.lesson.student_id) : modal.lesson.group_id.name}</p>
                <p><strong>Предмет:</strong> {modal.lesson.subject}</p>
                <p><strong>Длительность:</strong> {modal.lesson.duration} мин.</p>
              </div>

              <div className="modal-buttons">
                <button
                  className="modal-button confirm"
                  onClick={modal.type === 'cancel' ? cancelLesson : handleReschedule}
                >
                  {modal.type === 'cancel' ? 'Подтвердить' : 'Перенести'}
                </button>
                <button className="modal-button cancel" onClick={hideModal}>
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Employment;
