import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import "../Components/style/setmat.css";
import { RxCross2 } from "react-icons/rx";
import { FiUpload, FiSave } from "react-icons/fi";

const SetMat = () => {
    const [textareaValue, setTextareaValue] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Алгебра");
    const [visibility, setVisibility] = useState("Все");
    const [files, setFiles] = useState([]);
    const [image, setImage] = useState(null);
    const [existingFiles, setExistingFiles] = useState([]);
    const [existingImage, setExistingImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetch(`/api/educmat/${id}`)
                .then(response => response.json())
                .then(data => {
                    setTitle(data.title);
                    setTextareaValue(data.description);
                    setCategory(data.category);
                    setVisibility(data.visibility);

                    if (data.file) {
                        setExistingFiles(data.file);
                    }
                    if (data.image && data.image.length > 0) {
                        setExistingImage(data.image[0]);
                    }
                })
                .catch(error => console.error('Ошибка при загрузке материала:', error));
        }
    }, [id]);

    const handleTextareaChange = (e) => setTextareaValue(e.target.value);
    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleCategoryChange = (e) => setCategory(e.target.value);
    const handleVisibilityChange = (e) => setVisibility(e.target.value);

    const handleFilesChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        setFiles(prevFiles => {
            const filesMap = new Map();
            
            // Добавляем уже выбранные файлы
            prevFiles.forEach(file => {
                filesMap.set(file.name, file);
            });
            
            // Добавляем новые файлы (перезаписываем если есть дубликаты)
            selectedFiles.forEach(file => {
                filesMap.set(file.name, file);
            });
            
            return Array.from(filesMap.values());
        });
        
        // Сбрасываем значение input для возможности повторного выбора тех же файлов
        e.target.value = '';
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        setImage(selectedImage);
        e.target.value = ''; // Сбрасываем значение input
    };

    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleRemoveExistingFile = (index) => {
        setExistingFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleRemoveImage = () => {
        setImage(null);
    };

    const handleRemoveExistingImage = () => {
        setExistingImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', textareaValue);
        formData.append('category', category);
        formData.append('visibility', visibility);

        existingFiles.forEach((file) => {
            formData.append('existingFiles', file);
        });

        files.forEach((file) => {
            formData.append('files', file);
        });

        if (existingImage) {
            formData.append('existingImage', existingImage);
        }

        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await fetch(`/api/setmat${id ? `/${id}` : ''}`, {
                method: id ? 'PUT' : 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Материал успешно сохранен');
                navigate('/educmat');
            } else {
                alert('Ошибка при сохранении материала');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <main className="setmat-main">
                <div className='container'>
                    <div className='title-setmat'>
                        <h1>{id ? "Изменение учебных материалов" : "Добавление учебных материалов"}</h1>
                    </div>
                    <div className='box-padding'>
                        <div className='background-color-block'>
                            <form onSubmit={handleSubmit}>
                                <div className='form-content'>
                                    <div className='form-fields'>
                                        <div className='form-group'>
                                            <label className='form-label'>Название темы</label>
                                            <input
                                                className='form-input'
                                                type="text"
                                                placeholder='Введите название темы'
                                                maxLength={255}
                                                value={title}
                                                onChange={handleTitleChange}
                                                required
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label className='form-label'>Описание</label>
                                            <div className='textarea-container'>
                                                <textarea
                                                    className='form-textarea'
                                                    placeholder='Введите описание материала'
                                                    maxLength={255}
                                                    value={textareaValue}
                                                    onChange={handleTextareaChange}
                                                    required
                                                />
                                                <div className='character-counter'>
                                                    {textareaValue.length}/255
                                                </div>
                                            </div>
                                        </div>
                                        <div className='form-group'>
                                            <label className='form-label'>Категория</label>
                                            <select
                                                className="form-select"
                                                value={category}
                                                onChange={handleCategoryChange}
                                            >
                                                <option value="Алгебра">Алгебра</option>
                                                <option value="Геометрия">Геометрия</option>
                                            </select>
                                        </div>
                                        <div className='form-group'>
                                            <label className='form-label'>Видимость материала</label>
                                            <select
                                                className="form-select"
                                                value={visibility}
                                                onChange={handleVisibilityChange}
                                            >
                                                <option value="Все">Все</option>
                                                <option value="Только студенты">Только студенты</option>
                                            </select>
                                        </div>
                                        <div className='form-group'>
                                            <label className='form-label'>Файлы (docx, pdf, pptx)</label>
                                            <input
                                                type="file"
                                                multiple
                                                accept=".docx,.pdf,.pptx"
                                                onChange={handleFilesChange}
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                type="button"
                                                className='upload-button'
                                                onClick={() => fileInputRef.current.click()}
                                            >
                                                <FiUpload className="button-icon" />
                                                Добавить файлы
                                            </button>
                                            {(existingFiles.length > 0 || files.length > 0) && (
                                                <div className='files-list'>
                                                    {existingFiles.map((fileName, index) => (
                                                        <div key={`existing-${index}`} className='file-item'>
                                                            <span className='file-name'>{fileName}</span>
                                                            <RxCross2
                                                                className="remove-icon"
                                                                onClick={() => handleRemoveExistingFile(index)}
                                                            />
                                                        </div>
                                                    ))}
                                                    {files.map((file, index) => (
                                                        <div key={`new-${index}`} className='file-item'>
                                                            <span className='file-name'>{file.name}</span>
                                                            <RxCross2
                                                                className="remove-icon"
                                                                onClick={() => handleRemoveFile(index)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className='form-group'>
                                            <label className='form-label'>Изображение (png, jpg)</label>
                                            <input
                                                type="file"
                                                accept=".png,.jpg,.jpeg"
                                                onChange={handleImageChange}
                                                ref={imageInputRef}
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                type="button"
                                                className='upload-button'
                                                onClick={() => imageInputRef.current.click()}
                                            >
                                                <FiUpload className="button-icon" />
                                                Выбрать изображение
                                            </button>
                                            {(existingImage || image) && (
                                                <div className='image-preview'>
                                                    <div className='file-item'>
                                                        <span className='file-name'>
                                                            {existingImage || image.name}
                                                        </span>
                                                        <RxCross2
                                                            className="remove-icon"
                                                            onClick={existingImage ? handleRemoveExistingImage : handleRemoveImage}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className='form-actions'>
                                        <button 
                                            className='submit-button' 
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            <FiSave className="button-icon" />
                                            {isSubmitting ? "Сохранение..." : (id ? "Сохранить" : "Добавить")}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default SetMat;