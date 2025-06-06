import React, { useEffect, useState } from 'react';
import "../Components/style/ScheduleEditor.css";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiMinus, FiUsers, FiSearch } from "react-icons/fi";
import { BsFiletypeTxt, BsFiletypeDocx, BsFiletypeDoc, BsFiletypePdf, BsFiletypeXlsx } from "react-icons/bs";
import { PiMicrosoftPowerpointLogoThin } from "react-icons/pi";
import { FaRegCheckCircle, FaRegTimesCircle, FaUserCheck, FaUserTimes } from "react-icons/fa";
import iconadd from "../img/icon-add.png";
import GroupAttendanceModal from './GroupAttendanceModal';

const GroupEditor = ({ selectedGroup, setSelectedGroup, groups, setGroups }) => {
    const [groupStudents, setGroupStudents] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [editing, setEditing] = useState(false);
    const [editValues, setEditValues] = useState({});
    const [schedule, setSchedule] = useState([]);
    const [homework, setHomework] = useState([]);
    const [mode, setMode] = useState('students');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [editScheduleValues, setEditScheduleValues] = useState({});
    const [selectedScheduleItems, setSelectedScheduleItems] = useState([]);
    const [isAddingHomework, setIsAddingHomework] = useState(false);
    const [attendanceModal, setAttendanceModal] = useState({
        open: false,
        scheduleItem: null,
        students: []
    });
    const [editingGrades, setEditingGrades] = useState({});
    const [studentGrades, setStudentGrades] = useState({});
    const [groupStudentsSearch, setGroupStudentsSearch] = useState('');
    const [availableStudentsSearch, setAvailableStudentsSearch] = useState('');
    const [selectedHomeworkItems, setSelectedHomeworkItems] = useState([]);

    useEffect(() => {
        if (selectedGroup) {
            setLoading(true);
            setError(null);

            const loadData = async () => {
                try {
                    // Загрузка студентов группы
                    const studentsResponse = await fetch(`/api/groups/${selectedGroup._id}/students`);
                    if (!studentsResponse.ok) throw new Error('Ошибка загрузки студентов группы');
                    const groupStudentsData = await studentsResponse.json();

                    // Загрузка всех студентов
                    const allStudentsResponse = await fetch('/api/users/students');
                    if (!allStudentsResponse.ok) throw new Error('Ошибка загрузки всех студентов');
                    const allStudentsData = await allStudentsResponse.json();

                    // Фильтрация доступных студентов
                    const groupStudentIds = groupStudentsData.map(student => student._id);
                    const availableStudentsData = allStudentsData.filter(
                        student => !groupStudentIds.includes(student._id)
                    );

                    setGroupStudents(groupStudentsData);
                    setAvailableStudents(availableStudentsData);

                    // Загрузка расписания и домашних заданий
                    const [scheduleRes, homeworkRes] = await Promise.all([
                        fetch(`/api/schedules/group/${selectedGroup._id}`),
                        fetch(`/api/homework/group/${selectedGroup._id}`)
                    ]);

                    if (!scheduleRes.ok) console.error('Ошибка загрузки расписания');
                    if (!homeworkRes.ok) console.error('Ошибка загрузки домашних заданий');

                    const scheduleData = await scheduleRes.json().catch(() => []);
                    const homeworkData = await homeworkRes.json().catch(() => []);

                    console.log('Homework Data:', homeworkData);

                    setSchedule(scheduleData);
                    setHomework(homeworkData);

                } catch (error) {
                    console.error('Ошибка загрузки данных:', error);
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };

            loadData();
        }
    }, [selectedGroup]);

    // Функция для нормализации поискового запроса
    const normalizeSearchTerm = (term) => {
        return term.toLowerCase().trim().replace(/\s+/g, ' ');
    };

    // Функция для проверки совпадения студента с поисковым запросом
    const studentMatchesSearch = (student, searchTerm) => {
        if (!searchTerm) return true;

        const normalizedSearch = normalizeSearchTerm(searchTerm);
        const studentFullName = normalizeSearchTerm(
            `${student.surname} ${student.name} ${student.patronymic || ''}`
        );

        // Разбиваем поисковый запрос на отдельные слова
        const searchWords = normalizedSearch.split(' ');

        // Проверяем, что все слова запроса содержатся в ФИО студента
        return searchWords.every(word =>
            studentFullName.includes(word)
        );
    };

    // Фильтрация студентов в группе
    const filteredGroupStudents = groupStudents.filter(student =>
        studentMatchesSearch(student, groupStudentsSearch)
    );

    // Фильтрация доступных студентов
    const filteredAvailableStudents = availableStudents.filter(student =>
        studentMatchesSearch(student, availableStudentsSearch)
    );

    const handleEditStudentGrade = (homeworkId, studentId, currentGrade) => {
        setEditingGrades(prev => ({
            ...prev,
            [homeworkId]: studentId
        }));
        setStudentGrades(prev => ({
            ...prev,
            [studentId]: currentGrade || ''
        }));
    };

    const handleGradeChange = (studentId, value) => {
        setStudentGrades(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSaveStudentGrade = async (homeworkId, studentId) => {
        try {
            const gradeValue = studentGrades[studentId] ? parseInt(studentGrades[studentId]) : null;

            const response = await fetch(`/api/homework/${homeworkId}/grade/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ grade: gradeValue }),
            });

            if (response.ok) {
                const updatedHomework = await response.json();
                setHomework(homework.map(hw =>
                    hw._id === updatedHomework._id ? updatedHomework : hw
                ));
                setEditingGrades(prev => {
                    const newState = { ...prev };
                    delete newState[homeworkId];
                    return newState;
                });
            } else {
                throw new Error('Ошибка при обновлении оценки');
            }
        } catch (error) {
            console.error('Ошибка при сохранении оценки:', error);
            alert('Не удалось сохранить оценку');
        }
    };

    const handleCancelGradeEdit = (homeworkId) => {
        setEditingGrades(prev => {
            const newState = { ...prev };
            delete newState[homeworkId];
            return newState;
        });
    };

    const handleOpenAttendance = async (scheduleItem) => {
        try {
            let students = [];

            if (scheduleItem.group_id) {
                const response = await fetch(`/api/groups/${scheduleItem.group_id}/students`);
                if (response.ok) {
                    students = await response.json();
                }
            } else if (scheduleItem.student_id) {
                const response = await fetch(`/api/users/${scheduleItem.student_id}`);
                if (response.ok) {
                    const student = await response.json();
                    students = [student];
                }
            }

            setAttendanceModal({
                open: true,
                scheduleItem,
                students
            });
        } catch (error) {
            console.error('Ошибка загрузки студентов:', error);
            setError('Не удалось загрузить данные студентов');
        }
    };

    const handleSaveAttendance = async (data) => {
        try {
            const { scheduleItem } = attendanceModal;

            // 1. Сохраняем посещаемость
            let attendanceUrl = `/api/schedules/${scheduleItem._id}/`;
            attendanceUrl += scheduleItem.group_id ? 'updateGroupAttendance' : 'updateAttendance';

            const attendanceResponse = await fetch(attendanceUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    attendance: data.attendance,
                    ...(scheduleItem.student_id && { studentId: scheduleItem.student_id })
                }),
            });

            if (!attendanceResponse.ok) {
                throw new Error('Ошибка сохранения посещаемости');
            }

            // 2. Если есть оценки, сохраняем их отдельно
            if (data.grades && Object.keys(data.grades).length > 0) {
                const gradesResponse = await fetch(`/api/schedules/${scheduleItem._id}/updateGroupGrades`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        grades: data.grades
                    }),
                });

                if (!gradesResponse.ok) {
                    throw new Error('Ошибка сохранения оценок');
                }
            }

            // 3. Обновляем состояние
            const updatedItem = await attendanceResponse.json();

            // Добавляем оценки к обновленному элементу
            if (data.grades) {
                updatedItem.grades = data.grades;
            }

            setSchedule(schedule.map(item =>
                item._id === updatedItem._id ? updatedItem : item
            ));

            setAttendanceModal({ open: false, scheduleItem: null, students: [] });
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Не удалось сохранить данные');
        }
    };

    const renderAttendanceStatus = (item) => {
        if (item.student_id) {
            return (
                <label className="attendance-toggle">
                    <input
                        type="checkbox"
                        checked={item.attendance || false}
                        onChange={() => handleToggleIndividualAttendance(item._id, !item.attendance)}
                    />
                    <span className="toggle-slider">
                        {item.attendance ? (
                            <FaRegCheckCircle className="attendance-icon present" />
                        ) : (
                            <FaRegTimesCircle className="attendance-icon absent" />
                        )}
                    </span>
                </label>
            );
        }

        if (!item.attendance) {
            return <span className="attendance-not-marked">Не отмечено</span>;
        }

        const attendedCount = Object.values(item.attendance).filter(Boolean).length;
        return (
            <div className="attendance-summary">
                <span className="attended-count">
                    <FaUserCheck /> {attendedCount}
                </span>
                <span className="absent-count">
                    <FaUserTimes /> {groupStudents.length - attendedCount}
                </span>
            </div>
        );
    };

    const handleToggleIndividualAttendance = async (scheduleId, attendance) => {
        try {
            const response = await fetch(`/api/schedules/${scheduleId}/updateAttendance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ attendance }),
            });

            if (response.ok) {
                const updatedItem = await response.json();
                setSchedule(schedule.map(item =>
                    item._id === updatedItem._id ? updatedItem : item
                ));
            } else {
                throw new Error('Ошибка обновления посещаемости');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Не удалось обновить посещаемость');
        }
    };

    const handleAddToSchedule = async () => {
        const dateInput = document.getElementById('dateInput').value;
        const timeInput = document.getElementById('timeInput').value;
        const durationInput = document.getElementById('durationInput').value;
        const subjectInput = document.getElementById('exampleSelect').value;
        const descriptionInput = document.getElementById('descriptionInput').value;

        if (!dateInput || !timeInput || !durationInput || !subjectInput) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        const newDate = new Date(dateInput);
        const newStartTime = timeInput;
        const newDuration = parseInt(durationInput) || 60;
        const newEndTime = calculateEndTime(newStartTime, newDuration);

        // Проверяем пересечение с ВСЕМИ существующими занятиями (и групповыми, и индивидуальными)
        const hasConflict = schedule.some(item => {
            // Проверяем, что дата совпадает
            const itemDate = new Date(item.date);
            if (itemDate.toDateString() !== newDate.toDateString()) {
                return false;
            }

            // Преобразуем время в минуты для удобства сравнения
            const toMinutes = (timeStr) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            };

            const newStart = toMinutes(newStartTime);
            const newEnd = toMinutes(newEndTime);
            const existStart = toMinutes(item.time);
            const existEnd = toMinutes(calculateEndTime(item.time, item.duration));

            // Проверяем пересечение временных интервалов
            return (newStart < existEnd && newEnd > existStart);
        });

        if (hasConflict) {
            alert('Ошибка: В выбранное время уже есть занятие. Пожалуйста, выберите другое время.');
            return;
        }

        const dayOfWeek = getShortDayOfWeek(newDate);

        const newScheduleItem = {
            group_id: selectedGroup._id,
            day: dayOfWeek,
            date: newDate,
            time: newStartTime,
            duration: newDuration,
            subject: subjectInput,
            description: descriptionInput || '',
            attendance: null
        };

        try {
            const response = await fetch('/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newScheduleItem),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при добавлении занятия в расписание');
            }

            const savedScheduleItem = await response.json();
            setSchedule([...schedule, savedScheduleItem]);

            // Очищаем форму
            document.getElementById('dateInput').value = '';
            document.getElementById('timeInput').value = '';
            document.getElementById('durationInput').value = '60';
            document.getElementById('exampleSelect').value = '';
            document.getElementById('descriptionInput').value = '';
        } catch (error) {
            console.error('Ошибка при добавлении занятия в расписание:', error);
            alert(error.message || 'Не удалось добавить занятие');
        }
    };

    const handleEditGroup = () => {
        setEditing(true);
        setEditValues({
            name: selectedGroup.name
        });
    };

    const handleSaveGroup = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/groups/${selectedGroup._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editValues),
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении группы');
            }

            const updatedGroup = await response.json();
            setGroups(groups.map(g => g._id === updatedGroup._id ? updatedGroup : g));
            setSelectedGroup(updatedGroup);
            setEditing(false);
        } catch (error) {
            console.error('Ошибка:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (window.confirm(`Вы уверены, что хотите удалить группу "${selectedGroup.name}"?`)) {
            try {
                setLoading(true);
                console.log(`Попытка удаления группы с ID: ${selectedGroup._id}`);

                const response = await fetch(`/api/groups/${selectedGroup._id}`, {
                    method: 'DELETE',
                });

                console.log(`Ответ сервера: ${response.status} ${response.statusText}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Ошибка при удалении группы:', errorData);
                    throw new Error(errorData.message || 'Ошибка при удалении группы');
                }

                setGroups(groups.filter(g => g._id !== selectedGroup._id));
                setSelectedGroup(null);
            } catch (error) {
                console.error('Ошибка:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
    };


    const handleAddStudent = async (studentId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/groups/${selectedGroup._id}/addStudent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при добавлении студента');
            }

            const updatedGroup = await response.json();
            setGroups(groups.map(g => g._id === updatedGroup._id ? updatedGroup : g));
            setSelectedGroup(updatedGroup);

            const addedStudent = availableStudents.find(s => s._id === studentId);
            setGroupStudents([...groupStudents, addedStudent]);
            setAvailableStudents(availableStudents.filter(s => s._id !== studentId));
        } catch (error) {
            console.error('Ошибка:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/groups/${selectedGroup._id}/removeStudent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении студента');
            }

            const updatedGroup = await response.json();
            setGroups(groups.map(g => g._id === updatedGroup._id ? updatedGroup : g));
            setSelectedGroup(updatedGroup);
            setGroupStudents(groupStudents.filter(s => s._id !== studentId));
            setAvailableStudents([...availableStudents, groupStudents.find(s => s._id === studentId)]);
        } catch (error) {
            console.error('Ошибка:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSchedule = (id) => {
        const itemToEdit = schedule.find(item => item._id === id);
        setEditingSchedule(id);
        setEditScheduleValues({
            date: formatDateForInput(itemToEdit.date),
            time: itemToEdit.time,
            duration: itemToEdit.duration,
            subject: itemToEdit.subject,
            description: itemToEdit.description
        });
    };

    const handleScheduleInputChange = (field, value) => {
        setEditScheduleValues(prevValues => ({
            ...prevValues,
            [field]: value
        }));
    };

    const handleSaveSchedule = async () => {
        if (editingSchedule) {
            const updatedItem = {
                ...schedule.find(item => item._id === editingSchedule),
                ...editScheduleValues,
                date: new Date(editScheduleValues.date),
                day: getShortDayOfWeek(new Date(editScheduleValues.date)),
                duration: parseInt(editScheduleValues.duration) || 60
            };

            // Проверка пересечения временных интервалов (кроме самого редактируемого занятия)
            const hasConflict = schedule.some(item => {
                if (item._id === editingSchedule) return false;

                const itemDate = new Date(item.date);
                const updatedDate = new Date(updatedItem.date);
                if (itemDate.toDateString() !== updatedDate.toDateString()) {
                    return false;
                }

                // Используем ту же логику сравнения, что и в handleAddToSchedule
                const toMinutes = (timeStr) => {
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    return hours * 60 + minutes;
                };

                const newStart = toMinutes(updatedItem.time);
                const newEnd = toMinutes(calculateEndTime(updatedItem.time, updatedItem.duration));
                const existStart = toMinutes(item.time);
                const existEnd = toMinutes(calculateEndTime(item.time, item.duration));

                return (newStart < existEnd && newEnd > existStart);
            });

            if (hasConflict) {
                alert('Ошибка: В выбранное время уже есть занятие. Пожалуйста, выберите другое время.');
                return;
            }

            try {
                const response = await fetch(`/api/schedules/${editingSchedule}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedItem),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Ошибка при сохранении изменений');
                }

                const updatedScheduleItem = await response.json();
                setSchedule(schedule.map(item => item._id === editingSchedule ? updatedScheduleItem : item));
                setEditingSchedule(null);
                setEditScheduleValues({});
            } catch (error) {
                console.error('Ошибка при сохранении изменений:', error);
                alert(error.message || 'Не удалось сохранить изменения');
            }
        }
    };

    const handleCancelSchedule = () => {
        setEditingSchedule(null);
        setEditScheduleValues({});
    };

    const handleDeleteSchedule = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) return;

        try {
            const response = await fetch(`/api/schedules/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setSchedule(schedule.filter(item => item._id !== id));
                setSelectedScheduleItems(selectedScheduleItems.filter(itemId => itemId !== id));
            } else {
                throw new Error('Ошибка при удалении записи');
            }
        } catch (error) {
            console.error('Ошибка при удалении записи:', error);
            alert('Не удалось удалить запись');
        }
    };

    const handleDeleteSelectedSchedule = async () => {
        if (selectedScheduleItems.length === 0) return;
        if (!window.confirm(`Вы уверены, что хотите удалить ${selectedScheduleItems.length} выбранных записей?`)) return;

        try {
            const response = await fetch('/api/schedules/deleteMultiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedScheduleItems }),
            });

            if (response.ok) {
                setSchedule(schedule.filter(item => !selectedScheduleItems.includes(item._id)));
                setSelectedScheduleItems([]);
            } else {
                throw new Error('Ошибка при удалении записей');
            }
        } catch (error) {
            console.error('Ошибка при удалении записей:', error);
            alert('Не удалось удалить выбранные записи');
        }
    };

    const handleSelectScheduleItem = (id) => {
        setSelectedScheduleItems(prevSelectedItems =>
            prevSelectedItems.includes(id)
                ? prevSelectedItems.filter(itemId => itemId !== id)
                : [...prevSelectedItems, id]
        );
    };

    const handleAddToHomework = async () => {
        const dueDateInput = document.getElementById('dueDateInput').value;
        const filesInput = document.getElementById('filesInput').files;

        if (!dueDateInput || filesInput.length === 0) {
            alert('Пожалуйста, укажите дату выполнения и прикрепите файлы');
            return;
        }

        const formData = new FormData();
        formData.append('group_id', selectedGroup._id);
        formData.append('day', getShortDayOfWeek(new Date(dueDateInput)));
        formData.append('dueDate', dueDateInput);

        for (let i = 0; i < filesInput.length; i++) {
            formData.append('files', filesInput[i]);
        }

        try {
            const response = await fetch('/api/homework', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const savedHomeworkItem = await response.json();
                setHomework([...homework, savedHomeworkItem]);
                setIsAddingHomework(false);
                document.getElementById('dueDateInput').value = '';
                document.getElementById('filesInput').value = '';
            } else {
                throw new Error('Ошибка при добавлении домашнего задания');
            }
        } catch (error) {
            console.error('Ошибка при добавлении домашнего задания:', error);
            alert('Не удалось добавить домашнее задание');
        }
    };

    const handleSelectHomeworkItem = (id) => {
        setSelectedHomeworkItems(prevSelectedItems =>
            prevSelectedItems.includes(id)
                ? prevSelectedItems.filter(itemId => itemId !== id)
                : [...prevSelectedItems, id]
        );
    };

    const handleDeleteHomework = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить это домашнее задание?')) return;

        try {
            const response = await fetch(`/api/homework/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setHomework(homework.filter(item => item._id !== id));
                setSelectedHomeworkItems(selectedHomeworkItems.filter(itemId => itemId !== id));
            } else {
                throw new Error('Ошибка при удалении домашнего задания');
            }
        } catch (error) {
            console.error('Ошибка при удалении домашнего задания:', error);
            alert('Не удалось удалить домашнее задание');
        }
    };

    const handleDeleteSelectedHomework = async () => {
        if (selectedHomeworkItems.length === 0) return;
        if (!window.confirm(`Вы уверены, что хотите удалить ${selectedHomeworkItems.length} выбранных заданий?`)) return;

        try {
            const response = await fetch('/api/homework/deleteMultiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedHomeworkItems }),
            });

            if (response.ok) {
                setHomework(homework.filter(item => !selectedHomeworkItems.includes(item._id)));
                setSelectedHomeworkItems([]);
            } else {
                throw new Error('Ошибка при удалении заданий');
            }
        } catch (error) {
            console.error('Ошибка при удалении заданий:', error);
            alert('Не удалось удалить выбранные задания');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    };

    const getShortDayOfWeek = (date) => {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        const daysOfWeek = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
        return daysOfWeek[date.getDay()];
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}ч ${mins > 0 ? `${mins}м` : ''}` : `${mins}м`;
    };

    const calculateEndTime = (startTime, duration) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    const getFileIcon = (file) => {
        if (!file) {
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

    const formatCombinedDateTime = (item) => {
        const date = formatDate(item.date);
        const startTime = item.time;
        const endTime = calculateEndTime(item.time, item.duration);
        const duration = formatDuration(item.duration);
        return `${date}<br>${startTime}-${endTime}<br>${duration}`;
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const renderStudentGrades = (item) => {
        return (
            <div className="homework-responses">
                <div className="homework-files">
                    <h4>Файлы задания:</h4>
                    <div className="files-list">
                        {item.files.map((file, idx) => (
                            <div key={idx} className="file-item">
                                {getFileIcon(file)}
                                <a
                                    href={`/homework/${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="file-link"
                                >
                                    {file}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="students-responses">
                    <h4>Ответы студентов:</h4>
                    {groupStudents.map(student => {
                        const studentGrade = item.grades?.[student._id] || null;
                        const studentAnswer = item.answer.find(ans => ans.student_id === student._id);
                        const isEditing = editingGrades[item._id] === student._id;

                        return (
                            <div key={student._id} className="student-response">
                                <div className="student-info">
                                    <span className="student-name">
                                        {student.surname} {student.name[0]}.{student.patronymic && `${student.patronymic[0]}.`}
                                    </span>
                                </div>

                                <div className="student-answer">
                                    {studentAnswer ? (
                                        <div className="answer-file">
                                            {getFileIcon(studentAnswer.file)}
                                            <a
                                                href={`/homework/${studentAnswer.file}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="file-link"
                                            >
                                                {studentAnswer.file}
                                            </a>
                                        </div>
                                    ) : (
                                        <span className="no-answer">Нет ответа</span>
                                    )}
                                </div>

                                <div className="student-grade">
                                    {isEditing ? (
                                        <div className="grade-edit-container">
                                            <input
                                                type="number"
                                                value={studentGrades[student._id] || ''}
                                                onChange={(e) => handleGradeChange(student._id, e.target.value)}
                                                className="grade-input"
                                                min="1"
                                                max="5"
                                            />
                                            <button
                                                onClick={() => handleSaveStudentGrade(item._id, student._id)}
                                                className="scheduleeditor-scheduleeditor-action-button save-button"
                                            >
                                                <FiCheck />
                                            </button>
                                            <button
                                                onClick={() => handleCancelGradeEdit(item._id)}
                                                className="scheduleeditor-scheduleeditor-action-button cancel-button"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grade-display">
                                            {studentGrade ? (
                                                <span className={`grade-badge grade-${studentGrade}`}>
                                                    {studentGrade}
                                                </span>
                                            ) : (
                                                <span className="no-grade">-</span>
                                            )}
                                            <button
                                                onClick={() => handleEditStudentGrade(item._id, student._id, studentGrade)}
                                                className="scheduleeditor-action-button edit-button"
                                            >
                                                <FiEdit2 />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!selectedGroup) {
        return (
            <div className="schedule-editor-container">
                <div className="no-group-selected">
                    Выберите группу из списка слева
                </div>
            </div>
        );
    }

    return (
        <div className="schedule-editor-container">
            <div className="editor-header">
                <h3>
                    {editing ? (
                        <input
                            type="text"
                            value={editValues.name}
                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                            className="form-input"
                        />
                    ) : (
                        selectedGroup.name
                    )}
                </h3>
                <div className='mode-switcher'>
                    <button
                        className={`mode-button-scheduleeditor ${mode === 'students' ? 'active' : ''}`}
                        onClick={() => setMode('students')}
                    >
                        Студенты
                    </button>
                    <button
                        className={`mode-button-scheduleeditor ${mode === 'schedule' ? 'active' : ''}`}
                        onClick={() => setMode('schedule')}
                    >
                        Расписание
                    </button>
                    <button
                        className={`mode-button-scheduleeditor ${mode === 'homework' ? 'active' : ''}`}
                        onClick={() => setMode('homework')}
                    >
                        Домашнее задание
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-indicator">Загрузка...</div>}

            <div className="group-actions">
                {editing ? (
                    <>
                        <button onClick={handleSaveGroup} className="scheduleeditor-action-button save-button">
                            <FiCheck /> Сохранить
                        </button>
                        <button onClick={() => setEditing(false)} className="scheduleeditor-action-button cancel-button">
                            <FiX /> Отменить
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={handleEditGroup} className="scheduleeditor-action-button edit-button">
                            <FiEdit2 /> Редактировать
                        </button>
                        <button onClick={handleDeleteGroup} className="scheduleeditor-action-button delete-button">
                            <FiTrash2 /> Удалить
                        </button>
                    </>
                )}
            </div>

            {mode === 'students' ? (
                <div className="group-students-container">
                    <div className="students-section">
                        <h4>Студенты в группе ({groupStudents.length})</h4>
                        <div className="group-search-container">
                            <FiSearch className="group-search-icon" />
                            <input
                                type="text"
                                placeholder="Поиск студентов..."
                                value={groupStudentsSearch}
                                onChange={(e) => setGroupStudentsSearch(e.target.value)}
                                className="group-search-input"
                            />
                        </div>
                        <div className="group-students-list">
                            {filteredGroupStudents.length > 0 ? (
                                filteredGroupStudents.map(student => (
                                    <div key={student._id} className="student-item">
                                        <span className="student-name">
                                            {student.surname} {student.name} {student.patronymic}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveStudent(student._id)}
                                            className="remove-student-button"
                                            disabled={loading}
                                        >
                                            <FiMinus />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">Нет студентов в группе</div>
                            )}
                        </div>
                    </div>

                    <div className="students-section">
                        <h4>Доступные студенты ({availableStudents.length})</h4>
                        <div className="group-search-container">
                            <FiSearch className="group-search-icon" />
                            <input
                                type="text"
                                placeholder="Поиск студентов..."
                                value={availableStudentsSearch}
                                onChange={(e) => setAvailableStudentsSearch(e.target.value)}
                                className="group-search-input"
                            />
                        </div>
                        <div className="group-students-list">
                            {filteredAvailableStudents.length > 0 ? (
                                filteredAvailableStudents.map(student => (
                                    <div key={student._id} className="student-item">
                                        <span className="student-name">
                                            {student.surname} {student.name} {student.patronymic}
                                        </span>
                                        <button
                                            onClick={() => handleAddStudent(student._id)}
                                            className="add-student-button"
                                            disabled={loading}
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">Нет доступных студентов</div>
                            )}
                        </div>
                    </div>
                </div>
            ) : mode === 'schedule' ? (
                <>
                    <div className="add-lesson-form">
                        <div className="form-group">
                            <label htmlFor="dateInput">Дата</label>
                            <input type="date" id="dateInput" className="form-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="timeInput">Время начала</label>
                            <input type="time" id="timeInput" className="form-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="durationInput">Продолжительность (мин)</label>
                            <input
                                type="number"
                                id="durationInput"
                                className="form-input"
                                min="30"
                                step="30"
                                defaultValue="60"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleSelect">Предмет</label>
                            <select id="exampleSelect" className="form-input">
                                <option value="">Выберите предмет</option>
                                <option value="Алгебра">Алгебра</option>
                                <option value="Геометрия">Геометрия</option>
                                <option value="Физика">Физика</option>
                                <option value="Химия">Химия</option>
                                <option value="Информатика">Информатика</option>
                            </select>
                        </div>
                        <div className="form-group description-group">
                            <label htmlFor="descriptionInput">Описание</label>
                            <input
                                type="text"
                                id="descriptionInput"
                                className="form-input"
                                placeholder="Дополнительная информация"
                            />
                        </div>
                        <button
                            className="add-button"
                            onClick={handleAddToSchedule}
                        >
                            <img src={iconadd} alt="Добавить" className="add-icon" />
                            Добавить
                        </button>
                    </div>

                    {selectedScheduleItems.length > 0 && (
                        <div className="bulk-actions">
                            <button
                                onClick={handleDeleteSelectedSchedule}
                                className="delete-selected-button"
                            >
                                <FiTrash2 /> Удалить выбранные ({selectedScheduleItems.length})
                            </button>
                        </div>
                    )}

                    <div className="schedule-table-container">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}></th>
                                    <th>День</th>
                                    <th>Дата/Время/Продолжительность</th>
                                    <th>Предмет</th>
                                    <th>Описание</th>
                                    <th style={{ width: '150px' }}>Посещаемость</th>
                                    <th style={{ width: '150px' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.length > 0 ? (
                                    schedule.map((item) => (
                                        <React.Fragment key={item._id}>
                                            <tr className={editingSchedule === item._id ? 'editing-row' : ''}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedScheduleItems.includes(item._id)}
                                                        onChange={() => handleSelectScheduleItem(item._id)}
                                                        className="row-checkbox"
                                                    />
                                                </td>
                                                <td>{item.day}</td>
                                                <td dangerouslySetInnerHTML={{ __html: formatCombinedDateTime(item) }}></td>
                                                <td>{item.subject}</td>
                                                <td>{item.description || '-'}</td>
                                                <td>
                                                    {renderAttendanceStatus(item)}
                                                </td>
                                                <td>
                                                    <div className="row-actions">
                                                        {item.group_id && (
                                                            <button
                                                                onClick={() => handleOpenAttendance(item)}
                                                                className="scheduleeditor-action-button attendance-button"
                                                                title="Отметить посещаемость"
                                                            >
                                                                <FiUsers />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEditSchedule(item._id)}
                                                            className="scheduleeditor-action-button edit-button"
                                                            title="Редактировать"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSchedule(item._id)}
                                                            className="scheduleeditor-action-button delete-button"
                                                            title="Удалить"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {editingSchedule === item._id && (
                                                <tr className="edit-card-row">
                                                    <td colSpan="10">
                                                        <div className="edit-card">
                                                            <div className="edit-card-content">
                                                                <div className="edit-form-group">
                                                                    <label>Дата</label>
                                                                    <input
                                                                        type="date"
                                                                        value={editScheduleValues.date}
                                                                        onChange={(e) => handleScheduleInputChange('date', e.target.value)}
                                                                        className="edit-input"
                                                                    />
                                                                </div>
                                                                <div className="edit-form-group">
                                                                    <label>Время начала</label>
                                                                    <input
                                                                        type="time"
                                                                        value={editScheduleValues.time}
                                                                        onChange={(e) => handleScheduleInputChange('time', e.target.value)}
                                                                        className="edit-input"
                                                                    />
                                                                </div>
                                                                <div className="edit-form-group">
                                                                    <label>Продолжительность (мин)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={editScheduleValues.duration}
                                                                        onChange={(e) => handleScheduleInputChange('duration', e.target.value)}
                                                                        className="edit-input"
                                                                        min="30"
                                                                        step="30"
                                                                    />
                                                                </div>
                                                                <div className="edit-form-group">
                                                                    <label>Предмет</label>
                                                                    <select
                                                                        value={editScheduleValues.subject}
                                                                        onChange={(e) => handleScheduleInputChange('subject', e.target.value)}
                                                                        className="edit-input"
                                                                    >
                                                                        <option value="Алгебра">Алгебра</option>
                                                                        <option value="Геометрия">Геометрия</option>
                                                                        <option value="Физика">Физика</option>
                                                                        <option value="Химия">Химия</option>
                                                                        <option value="Информатика">Информатика</option>
                                                                    </select>
                                                                </div>
                                                                <div className="edit-form-group description-group">
                                                                    <label>Описание</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editScheduleValues.description || ''}
                                                                        onChange={(e) => handleScheduleInputChange('description', e.target.value)}
                                                                        className="edit-input"
                                                                        placeholder="Дополнительная информация"
                                                                    />
                                                                </div>
                                                                <div className="edit-card-actions">
                                                                    <button
                                                                        onClick={handleSaveSchedule}
                                                                        className="scheduleeditor-action-button save-button"
                                                                    >
                                                                        <FiCheck /> Сохранить
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelSchedule}
                                                                        className="scheduleeditor-action-button cancel-button"
                                                                    >
                                                                        <FiX /> Отменить
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr className="no-data-row">
                                        <td colSpan="10">Нет данных о занятиях</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    <div className="homework-actions">
                        <button
                            className={`add-homework-button ${isAddingHomework ? 'cancel' : 'add'}`}
                            onClick={() => setIsAddingHomework(!isAddingHomework)}
                        >
                            {isAddingHomework ? 'Отменить' : 'Добавить задание'}
                        </button>
                        {selectedHomeworkItems.length > 0 && (
                            <button
                                onClick={handleDeleteSelectedHomework}
                                className="delete-selected-button"
                            >
                                <FiTrash2 /> Удалить выбранные ({selectedHomeworkItems.length})
                            </button>
                        )}
                    </div>

                    {isAddingHomework && (
                        <div className="add-homework-form">
                            <div className="form-group">
                                <label htmlFor="dueDateInput">Дата выполнения</label>
                                <input type="date" id="dueDateInput" className="form-input" />
                            </div>
                            <div className="form-group file-group">
                                <label htmlFor="filesInput">Файлы задания</label>
                                <input
                                    type="file"
                                    id="filesInput"
                                    multiple
                                    className="file-input"
                                />
                                <label htmlFor="filesInput" className="file-input-label">
                                    Выберите файлы...
                                </label>
                            </div>
                            <button
                                className="submit-homework-button"
                                onClick={handleAddToHomework}
                            >
                                Сохранить задание
                            </button>
                        </div>
                    )}

                    <div className="homework-table-container">
                        <table className="homework-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}></th>
                                    <th>День</th>
                                    <th>Выполнить до</th>
                                    <th>Оценки студентов</th>
                                    <th style={{ width: '80px' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {homework.length > 0 ? (
                                    homework.map((item) => (
                                        <tr key={item._id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedHomeworkItems.includes(item._id)}
                                                    onChange={() => handleSelectHomeworkItem(item._id)}
                                                    className="row-checkbox"
                                                />
                                            </td>
                                            <td>{item.day}</td>
                                            <td>{formatDate(item.dueDate)}</td>
                                            <td>
                                                {renderStudentGrades(item)}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteHomework(item._id)}
                                                    className="scheduleeditor-action-button delete-button"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="no-data-row">
                                        <td colSpan="5">Нет данных о домашних заданиях</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {attendanceModal.open && (
                <GroupAttendanceModal
                    scheduleItem={attendanceModal.scheduleItem}
                    students={attendanceModal.students}
                    onClose={() => setAttendanceModal({ open: false, scheduleItem: null, students: [] })}
                    onSave={handleSaveAttendance}
                />
            )}
        </div>
    );
};

export default GroupEditor;
