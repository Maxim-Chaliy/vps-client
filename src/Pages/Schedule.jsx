import React, { useEffect, useState } from 'react';
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../Components/style/schedule.css";
import "../Components/style/config.css";
import {
    BsFiletypeTxt,
    BsFiletypeDocx,
    BsFiletypeDoc,
    BsFiletypePdf,
    BsFiletypeXlsx
} from "react-icons/bs";
import { PiMicrosoftPowerpointLogoThin } from "react-icons/pi";
import {
    FiUpload,
    FiCheckCircle,
    FiClock,
    FiBook,
    FiCalendar,
    FiDownload,
    FiStar,
    FiChevronDown,
    FiChevronUp,
    FiUsers,
    FiUser
} from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';

const Schedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [homework, setHomework] = useState([]);
    const [mode, setMode] = useState('lessons');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});
    const [groups, setGroups] = useState([]);
    const [showType, setShowType] = useState('all');
    const studentId = localStorage.getItem('studentId');
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    useEffect(() => {
        const fetchData = async () => {
            if (studentId) {
                setIsLoading(true);

                try {
                    const groupsResponse = await fetch(`/api/groups/student/${studentId}`);
                    const groupsData = await groupsResponse.json();
                    setGroups(groupsData);

                    const individualSchedulesResponse = await fetch(`/api/schedules/student/${studentId}`);
                    const individualSchedules = await individualSchedulesResponse.json();

                    const groupPromises = groupsData.map(group =>
                        fetch(`/api/schedules/group/${group._id}`).then(res => res.json())
                    );

                    const groupSchedulesResults = await Promise.all(groupPromises);
                    const groupSchedules = groupSchedulesResults.flat();

                    const allSchedules = [...individualSchedules, ...groupSchedules];

                    const sortedSchedules = allSchedules.sort((a, b) => {
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

                    setSchedules(sortedSchedules);

                    const individualHomeworkResponse = await fetch(`/api/homework/${studentId}`);
                    const individualHomework = await individualHomeworkResponse.json();

                    const groupHomeworkPromises = groupsData.map(group =>
                        fetch(`/api/homework/group/${group._id}`).then(res => res.json())
                    );

                    const groupHomeworkResults = await Promise.all(groupHomeworkPromises);
                    const groupHomework = groupHomeworkResults.flat();

                    const allHomework = [...individualHomework, ...groupHomework];
                    const currentDate = new Date();

                    const overdueHomework = allHomework.filter(hw =>
                        new Date(hw.dueDate) < currentDate && hw.answer.length === 0
                    );
                    const unsentHomework = allHomework.filter(hw =>
                        new Date(hw.dueDate) >= currentDate && hw.answer.length === 0
                    );
                    const sentHomework = allHomework.filter(hw => hw.answer.length > 0);

                    overdueHomework.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                    unsentHomework.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                    sentHomework.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

                    const sortedHomework = [...overdueHomework, ...unsentHomework, ...sentHomework];

                    setHomework(sortedHomework);
                } catch (error) {
                    console.error('Ошибка при получении данных:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
    }, [studentId]);

    const calculateEndTime = (startTime, duration) => {
        if (!startTime || !duration) return '';

        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;

        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    const formatTimeRange = (timeString, duration) => {
        if (!timeString) return '';
        const endTime = calculateEndTime(timeString, duration);
        return `${timeString.slice(0, 5)}-${endTime}`;
    };

    const filteredSchedules = schedules.filter(schedule => {
        if (showType === 'all') return true;
        if (showType === 'individual') return schedule.student_id;
        if (showType === 'group') return schedule.group_id;
        return true;
    });

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setSelectedItem(null);
        setSelectedFile(null);
        setUploadStatus(null);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (!file) {
            setUploadStatus({ type: 'error', message: 'Файл не выбран' });
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setUploadStatus({
                type: 'error',
                message: `Файл слишком большой! Максимальный размер: ${MAX_FILE_SIZE_MB} МБ`
            });
            setSelectedFile(null);
            event.target.value = '';
            return;
        }

        setSelectedFile(file);
        setUploadStatus(null);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const handleAddFiles = async () => {
        if (!selectedFile) {
            setUploadStatus({ type: 'error', message: 'Выберите файл' });
            return;
        }

        if (!selectedItem) {
            setUploadStatus({ type: 'error', message: 'Выберите задание' });
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setUploadStatus({
                type: 'error',
                message: `Файл слишком большой! Максимальный размер: ${MAX_FILE_SIZE_MB} МБ`
            });
            return;
        }

        const formData = new FormData();
        formData.append('files', selectedFile);
        formData.append('student_id', studentId);
        formData.append('homework_id', selectedItem);

        try {
            setUploadStatus({ type: 'loading', message: 'Загрузка...' });

            const response = await fetch('/api/homework/upload-answer', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setUploadStatus({ type: 'success', message: 'Файл успешно загружен' });

                setHomework(prevHomework =>
                    prevHomework.map(item =>
                        item._id === selectedItem ? { ...item, answer: data.answer, sentAt: data.sentAt } : item
                    )
                );

                setTimeout(() => {
                    setUploadStatus(null);
                    setSelectedFile(null);
                    document.querySelector('.file-input').value = '';
                }, 3000);
            } else {
                throw new Error('Ошибка при загрузке файла');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus({ type: 'error', message: 'Ошибка при загрузке файла' });
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItem(id === selectedItem ? null : id);
        setUploadStatus(null);
    };

    const toggleItemExpansion = (id) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    };

    const getFileIcon = (file) => {
        if (typeof file !== 'string') {
            return <BsFiletypeTxt className="file-icon" />;
        }

        const extension = file.split('.').pop().toLowerCase();
        switch (extension) {
            case 'txt': return <BsFiletypeTxt className="file-icon" />;
            case 'docx': return <BsFiletypeDocx className="file-icon" />;
            case 'doc': return <BsFiletypeDoc className="file-icon" />;
            case 'pptx': return <PiMicrosoftPowerpointLogoThin className="file-icon" />;
            case 'pdf': return <BsFiletypePdf className="file-icon" />;
            case 'xlsx': return <BsFiletypeXlsx className="file-icon" />;
            default: return <BsFiletypeTxt className="file-icon" />;
        }
    };

    const renderStatusIcon = (status) => {
        switch (status) {
            case 'success': return <FiCheckCircle className="status-icon success" />;
            case 'error': return <FiCheckCircle className="status-icon error" />;
            case 'loading': return <FiClock className="status-icon loading" />;
            default: return null;
        }
    };

    const getGradeColor = (grade) => {
        if (!grade) return 'inherit';
        if (grade >= 4.5) return '#4CAF50';
        if (grade >= 3.5) return '#FFC107';
        return '#F44336';
    };

    const renderLessonCard = (lesson) => {
        const isExpanded = expandedItems[lesson._id];
        const isGroupLesson = !!lesson.group_id;

        // Получаем оценку студента, если она есть
        let studentGrade;
        if (isGroupLesson && lesson.grade_group) {
            studentGrade = lesson.grade_group[studentId];
        } else {
            studentGrade = lesson.grade;
        }

        return (
            <motion.div
                key={lesson._id}
                className={`lesson-card ${isExpanded ? 'expanded' : ''} ${isGroupLesson ? 'group-lesson' : 'individual-lesson'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div
                    className="card-header"
                    onClick={() => toggleItemExpansion(lesson._id)}
                >
                    <div className="card-main-info">
                        <div className="lesson-type-icon">
                            {isGroupLesson ? <FiUsers className="group-icon" /> : <FiUser className="individual-icon" />}
                        </div>
                        <div className="lesson-date-time">
                            <span className="lesson-date">{formatDate(lesson.date)}</span>
                            <span className="lesson-time">{formatTimeRange(lesson.time, lesson.duration)}</span>
                        </div>
                        <div className="lesson-subject-container">
                            <span className="lesson-subject">{lesson.subject}</span>
                            {isGroupLesson && (
                                <span className="group-info">Групповое занятие</span>
                            )}
                        </div>
                    </div>
                    <div className="attendance-badge-container">
                        {lesson.attendance !== null && (
                            <span className={`attendance-badge ${lesson.attendance ? 'present' : 'absent'}`}>
                                {lesson.attendance ? 'Присутствовал' : 'Отсутствовал'}
                            </span>
                        )}
                        {studentGrade !== undefined && studentGrade !== null && (
                            <span
                                className="schedule-grade-badge"
                                style={{ backgroundColor: getGradeColor(studentGrade) }}
                            >
                                {studentGrade}
                            </span>
                        )}
                    </div>
                    <div className="expand-icon">
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            className="card-content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="lesson-description">
                                <h4>Описание занятия:</h4>
                                <p>{lesson.description || 'Описание отсутствует'}</p>
                            </div>
                            <div className="lesson-details">
                                <div className="detail-item">
                                    <span className="detail-label">Дата:</span>
                                    <span className="detail-value">{formatDate(lesson.date)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Время:</span>
                                    <span className="detail-value">
                                        {formatTimeRange(lesson.time, lesson.duration)} ({lesson.duration} мин.)
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Тип:</span>
                                    <span className="detail-value">
                                        {isGroupLesson ? 'Групповое занятие' : 'Индивидуальное занятие'}
                                    </span>
                                </div>
                                {isGroupLesson && (
                                    <div className="detail-item">
                                        <span className="detail-label">Группа:</span>
                                        <span className="detail-value">
                                            {groups.find(g => g._id.toString() === lesson.group_id.toString())?.name || 'Неизвестная группа'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    const renderHomeworkCard = (hw) => {
        const isExpanded = expandedItems[hw._id];
        const isSelected = selectedItem === hw._id;
        const isGroupHomework = !!hw.group_id;
        const isOverdue = new Date(hw.dueDate) < new Date() && hw.answer.length === 0;

        // Получаем оценку студента, если она есть
        let studentGrade;
        if (hw.grades) {
            // Если grades - это Map
            if (typeof hw.grades.get === 'function') {
                studentGrade = hw.grades.get(studentId);
            }
            // Если grades - это обычный объект
            else if (typeof hw.grades === 'object') {
                studentGrade = hw.grades[studentId];
            }
        }

        return (
            <motion.div
                key={hw._id}
                className={`homework-card ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''} ${isGroupHomework ? 'group-homework' : 'individual-homework'} ${isOverdue ? 'overdue' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div
                    className="card-header"
                    onClick={() => toggleItemExpansion(hw._id)}
                >
                    <div className="card-main-info">
                        <div className="hw-type-icon">
                            {isGroupHomework ? (
                                <FiUsers className="group-icon" />
                            ) : (
                                <FiUser className="individual-icon" />
                            )}
                        </div>
                        <span className="hw-day">{hw.day}</span>
                        <span className="hw-due-date">
                            <FiCalendar className="icon" />
                            {formatDate(hw.dueDate)}
                        </span>
                        <span className="hw-subject">{hw.subject}</span>
                    </div>

                    <div className="hw-status">
                        {isOverdue ? (
                            <span className="status-badge overdue">
                                <FiClock className="icon" />
                                Просрочено
                            </span>
                        ) : hw.answer.length > 0 ? (
                            <span className="status-badge submitted">
                                <FiCheckCircle className="icon" />
                                Отправлено
                            </span>
                        ) : (
                            <span className="status-badge pending">
                                <FiClock className="icon" />
                                Ожидается
                            </span>
                        )}
                        {studentGrade !== undefined && (
                            <span
                                className="schedule-grade-badge"
                                style={{ backgroundColor: getGradeColor(studentGrade) }}
                            >
                                {studentGrade}
                            </span>
                        )}
                    </div>

                    <div className="expand-icon">
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            className="card-content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="hw-type-info">
                                <h4>Тип задания:</h4>
                                <p className={isGroupHomework ? "group-assignment" : "individual-assignment"}>
                                    {isGroupHomework ?
                                        `Групповое (${groups.find(g => g._id.toString() === hw.group_id?.toString())?.name || 'Неизвестная группа'})` :
                                        'Индивидуальное'}
                                </p>
                            </div>

                            <div className="hw-comment-section">
                                <h4>Комментарий репетитора:</h4>
                                <p>{hw.comment || 'Комментарий отсутствует'}</p>
                            </div>

                            <div className="hw-files-section">
                                <h4>Файлы задания:</h4>
                                <div className="files-container">
                                    {hw.files.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={`/homework/${file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-link"
                                        >
                                            {getFileIcon(file)}
                                            <span>{file}</span>
                                            <FiDownload className="download-icon" />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="hw-answer-section">
                                <h4>Ваш ответ:</h4>
                                {hw.answer.length > 0 ? (
                                    <div className="files-container">
                                        {hw.answer.map((ans, idx) => (
                                            <a
                                                key={idx}
                                                href={`/homework/${ans.file}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="file-link"
                                            >
                                                {getFileIcon(ans.file)}
                                                <span>{ans.file}</span>
                                                <FiDownload className="download-icon" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-answer">Ответ не отправлен</p>
                                )}
                            </div>

                            <div className="hw-upload-section">
                                <input
                                    type="radio"
                                    name="selectedItem"
                                    checked={isSelected}
                                    onChange={() => handleSelectItem(hw._id)}
                                    className="radio-input"
                                    id={`radio-${hw._id}`}
                                />
                                <label htmlFor={`radio-${hw._id}`} className="radio-label">
                                    Выбрать для отправки ответа
                                </label>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };


    return (
        <>
            <Header />
            <main className='schedule-main-container'>
                <div className="container">
                    <div className='schedulepage-background-color'>
                        <div>
                            <div className='buttons-section-2'>
                                <motion.button
                                    className={`mode-button ${mode === 'lessons' ? 'active' : ''}`}
                                    onClick={() => handleModeChange('lessons')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiBook className="schedule-button-icon" />
                                    Занятия
                                </motion.button>
                                <motion.button
                                    className={`mode-button ${mode === 'homework' ? 'active' : ''}`}
                                    onClick={() => handleModeChange('homework')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiStar className="schedule-button-icon" />
                                    Домашнее задание
                                </motion.button>
                            </div>

                            {mode === 'lessons' && (
                                <div className="view-options">
                                    <button
                                        className={`view-option ${showType === 'all' ? 'active' : ''}`}
                                        onClick={() => setShowType('all')}
                                    >
                                        Все занятия
                                    </button>
                                    <button
                                        className={`view-option ${showType === 'individual' ? 'active' : ''}`}
                                        onClick={() => setShowType('individual')}
                                    >
                                        <FiUser className="option-icon" /> Индивидуальные
                                    </button>
                                    <button
                                        className={`view-option ${showType === 'group' ? 'active' : ''}`}
                                        onClick={() => setShowType('group')}
                                    >
                                        <FiUsers className="option-icon" /> Групповые
                                    </button>
                                </div>
                            )}

                            <div className='margin-top'>
                                {isLoading ? (
                                    <div className="loading-container">
                                        <div className="loading-spinner"></div>
                                        <p>Загрузка данных...</p>
                                    </div>
                                ) : (
                                    <AnimatePresence mode='wait'>
                                        <motion.div
                                            key={mode}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {mode === 'lessons' ? (
                                                <div className="cards-container">
                                                    {filteredSchedules.length > 0 ? (
                                                        filteredSchedules.map(renderLessonCard)
                                                    ) : (
                                                        <div className="empty-state">
                                                            <FiBook className="empty-icon" />
                                                            <p>Нет данных о занятиях</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="upload-section">
                                                        <div className="file-input-container">
                                                            <label className="file-input-label">
                                                                <FiUpload className="upload-icon" />
                                                                <span>{selectedFile ? selectedFile.name : 'Выберите файл'}</span>
                                                                <input
                                                                    type="file"
                                                                    onChange={handleFileUpload}
                                                                    className="file-input"
                                                                />
                                                            </label>
                                                            <div className="file-size-hint">
                                                                Максимальный размер файла: {MAX_FILE_SIZE_MB} МБ
                                                            </div>
                                                            {selectedFile && (
                                                                <button
                                                                    className="remove-file-button"
                                                                    onClick={handleRemoveFile}
                                                                >
                                                                    <IoMdClose />
                                                                </button>
                                                            )}
                                                            <motion.button
                                                                onClick={handleAddFiles}
                                                                disabled={!selectedFile || !selectedItem}
                                                                className="upload-button"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                Загрузить
                                                            </motion.button>
                                                        </div>

                                                        <AnimatePresence>
                                                            {uploadStatus && (
                                                                <motion.div
                                                                    className={`upload-status ${uploadStatus.type}`}
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    {renderStatusIcon(uploadStatus.type)}
                                                                    <span>{uploadStatus.message}</span>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    <div className="cards-container">
                                                        {homework.length > 0 ? (
                                                            homework.map(renderHomeworkCard)
                                                        ) : (
                                                            <div className="empty-state">
                                                                <FiStar className="empty-icon" />
                                                                <p>Нет данных о домашних заданиях</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Schedule;
