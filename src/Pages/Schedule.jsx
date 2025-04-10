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
  FiUser, 
  FiBook,
  FiCalendar,
  FiFile,
  FiDownload,
  FiSend,
  FiStar,
  FiChevronDown,
  FiChevronUp
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
    const studentId = localStorage.getItem('studentId');

    useEffect(() => {
        if (studentId) {
            setIsLoading(true);
            
            Promise.all([
                fetch(`http://localhost:3001/api/schedules/${studentId}`).then(res => res.json()),
                fetch(`http://localhost:3001/api/homework/${studentId}`).then(res => res.json())
            ])
            .then(([schedulesData, homeworkData]) => {
                const sortedSchedules = schedulesData.sort((a, b) => {
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
                setHomework(homeworkData);
            })
            .catch(error => {
                console.error('Ошибка при получении данных:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    }, [studentId]);

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setSelectedItem(null);
        setSelectedFile(null);
        setUploadStatus(null);
    };

    const handleFileUpload = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadStatus(null);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const handleAddFiles = async () => {
        if (!selectedFile || !selectedItem) {
            setUploadStatus({ type: 'error', message: 'Выберите файл и задание' });
            return;
        }

        const formData = new FormData();
        formData.append('files', selectedFile);
        formData.append('student_id', studentId);
        formData.append('homework_id', selectedItem);

        try {
            setUploadStatus({ type: 'loading', message: 'Загрузка...' });
            
            const response = await fetch('http://localhost:3001/api/homework/upload-answer', {
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

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.slice(0, 5);
    };

    const getFileIcon = (file) => {
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
        
        return (
            <motion.div 
                key={lesson._id}
                className={`lesson-card ${isExpanded ? 'expanded' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div 
                    className="card-header"
                    onClick={() => toggleItemExpansion(lesson._id)}
                >
                    <div className="card-main-info">
                        <span className="lesson-day">{lesson.day}</span>
                        <span className="lesson-date">{formatDate(lesson.date)}</span>
                        <span className="lesson-time">{formatTime(lesson.time)}</span>
                        <span className="lesson-subject">{lesson.subject}</span>
                    </div>
                    <div className="attendance-badge-container">
                        <span className={`attendance-badge ${lesson.attendance ? 'present' : 'absent'}`}>
                            {lesson.attendance ? 'Присутствовал' : 'Отсутствовал'}
                        </span>
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    const renderHomeworkCard = (hw) => {
        const isExpanded = expandedItems[hw._id];
        const isSelected = selectedItem === hw._id;
        
        return (
            <motion.div 
                key={hw._id}
                className={`homework-card ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div 
                    className="card-header"
                    onClick={() => toggleItemExpansion(hw._id)}
                >
                    <div className="card-main-info">
                        <span className="hw-day">{hw.day}</span>
                        <span className="hw-duedate">
                            <FiCalendar className="icon" />
                            {formatDate(hw.dueDate)}
                        </span>
                        <span className="hw-subject">{hw.subject}</span>
                    </div>
                    
                    <div className="hw-status">
                        {hw.answer.length > 0 ? (
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
                        
                        {hw.grade && (
                            <span 
                                className="grade-badge" 
                                style={{ backgroundColor: getGradeColor(hw.grade) }}
                            >
                                {hw.grade}
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
                            <div className="hw-files-section">
                                <h4>Файлы задания:</h4>
                                <div className="files-container">
                                    {hw.files.map((file, idx) => (
                                        <a 
                                            key={idx} 
                                            href={`http://localhost:3001/homework/${file}`} 
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
                                        {hw.answer.map((file, idx) => (
                                            <a 
                                                key={idx} 
                                                href={`http://localhost:3001/homework/${file}`} 
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
                                                    {schedules.length > 0 ? (
                                                        schedules.map(renderLessonCard)
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