import React, { useState, useEffect, useRef } from "react";
import { Helmet } from 'react-helmet';
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../Components/style/educmat.css";
import { BsThreeDotsVertical, BsSearch, BsX, BsPlus } from "react-icons/bs";
import { Link } from "react-router-dom";

const EducMat = () => {
    const [materials, setMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [showOptions, setShowOptions] = useState(null);
    const optionsPopupRef = useRef(null);
    const modalContentRef = useRef(null);
    const placeholderImage = `/uploads/to/placeholder.png`;

    const userRole = localStorage.getItem('role');
    const fetchMaterials = async () => {
        try {
            const response = await fetch(`/api/educmat`);
            const data = await response.json();
            setMaterials(data);
            filterMaterials(data);
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsPopupRef.current && !optionsPopupRef.current.contains(event.target)) {
                setShowOptions(null);
            }
            if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
                setSelectedMaterial(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleImageClick = (material) => {
        setSelectedMaterial(material);
    };

    const handleCloseModal = () => {
        setSelectedMaterial(null);
    };

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleSearchButtonClick = () => {
        const filtered = materials.filter((material) =>
            material.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedCategory === "" || material.category.toLowerCase() === selectedCategory.toLowerCase())
        );
        filterMaterials(filtered);
    };

    const handleOptionsClick = (materialId, e) => {
        e.stopPropagation();
        setShowOptions(showOptions === materialId ? null : materialId);
    };

    const handleEditClick = (materialId) => {
        console.log("Редактировать материал с ID:", materialId);
        setShowOptions(null);
    };

    const handleDeleteClick = async (materialId) => {
        try {
            const response = await fetch(`/api/educmat/${materialId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении записи');
            }

            setMaterials((prevMaterials) =>
                prevMaterials.filter((material) => material._id !== materialId)
            );
            filterMaterials(materials.filter((material) => material._id !== materialId));

            console.log('Запись успешно удалена');
        } catch (error) {
            console.error('Ошибка при удалении записи:', error);
        } finally {
            setShowOptions(null);
        }
    };

    const filterMaterials = (data) => {
        let filteredData = data;
        if (userRole !== 'admin') {
            if (userRole !== 'student') {
                filteredData = filteredData.filter(material => material.visibility !== 'Только студенты');
            }
        }
        setFilteredMaterials(filteredData);
    };

    return (
        <>
            <Helmet>
                <title>Учебные материалы для подготовки к ЕГЭ</title>
                <meta name="description" content="Учебные материалы для подготовки к ЕГЭ. Найдите материалы по алгебре, геометрии и другим предметам." />
                <meta name="keywords" content="учебные материалы, подготовка к ЕГЭ, алгебра, геометрия, курсы" />
                <meta property="og:title" content="Учебные материалы для подготовки к ЕГЭ" />
                <meta property="og:description" content="Учебные материалы для подготовки к ЕГЭ. Найдите материалы по алгебре, геометрии и другим предметам." />
                <meta property="og:image" content="https://easymath-online.ru/path-to-your-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Учебные материалы для подготовки к ЕГЭ" />
                <meta name="twitter:description" content="Учебные материалы для подготовки к ЕГЭ. Найдите материалы по алгебре, геометрии и другим предметам." />
                <meta name="twitter:image" content="https://easymath-online.ru/path-to-your-image.jpg" />
                <script type="application/ld+json">
                    {`
                        {
                            "@context": "https://schema.org",
                            "@type": "WebPage",
                            "name": "Учебные материалы для подготовки к ЕГЭ",
                            "description": "Учебные материалы для подготовки к ЕГЭ. Найдите материалы по алгебре, геометрии и другим предметам.",
                            "url": "https://easymath-online.ru/educmat"
                        }
                    `}
                </script>
            </Helmet>
            <Header />
            <main className="educmat-main">
                <div className="conteiner">
                    <div className="form-creat-material">
                        <h1 className="educmat-title">Учебные материалы</h1>
                        {userRole === 'admin' && (
                            <Link className="button-creat-material" to="/setmat">
                                <div>Создать материал</div>
                                <div className="div-plus-icon"><BsPlus className="plus-icon" /></div>
                            </Link>
                        )}
                    </div>
                    <div className="input-box">
                        <div className="display-flex-inputs">
                            <div className="search-input-container">
                                <BsSearch className="search-icon" />
                                <input
                                    className="input-search-name"
                                    type="text"
                                    placeholder="Поиск по названию"
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                />
                                {searchQuery && (
                                    <button
                                        className="clear-search-btn"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <BsX />
                                    </button>
                                )}
                            </div>
                            <div className="select-container">
                                <select
                                    className="select-name"
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                >
                                    <option value="">Все категории</option>
                                    <option value="Алгебра">Алгебра</option>
                                    <option value="Геометрия">Геометрия</option>
                                </select>
                            </div>
                            <button
                                className="educmat-button-search"
                                onClick={handleSearchButtonClick}
                                disabled={!searchQuery && !selectedCategory}
                            >
                                Найти
                            </button>
                        </div>
                    </div>

                    {filteredMaterials.length === 0 ? (
                        <div className="no-results">
                            <p>Материалы не найдены</p>
                            <button
                                className="reset-filters-btn"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("");
                                    filterMaterials(materials);
                                }}
                            >
                                Сбросить фильтры
                            </button>
                        </div>
                    ) : (
                        <div className="blocks-material">
                            <div className="padding-blocks-material">
                                <div className="display-flex-blocks-material">
                                    {filteredMaterials.map((material) => (
                                        <div
                                            key={material._id}
                                            className={`block-material ${material.visibility === 'Только студенты' ? 'student-only' : ''}`}
                                            onClick={() => handleImageClick(material)}
                                        >
                                            {material.visibility === 'Только студенты' && (
                                                <div className="student-only-badge">
                                                    <span>Только для студентов</span>
                                                </div>
                                            )}
                                            <div className="material-badge">
                                                {material.category}
                                            </div>
                                            <div className="padding-info-block-material">
                                                <div className="img-block-material">
                                                    <img
                                                        src={material.image && material.image[0] ?
                                                            `/uploads/images/${material.image[0]}` :
                                                            placeholderImage}
                                                        alt={material.title}
                                                        className="responsive-image"
                                                    />
                                                    <div className="image-overlay">
                                                        <span>Просмотреть</span>
                                                    </div>
                                                </div>
                                                <div className="justy-content-space">
                                                    <div className="padding-despription-info">
                                                        <div className="name-material">
                                                            <h3 title={material.title}>{material.title}</h3>
                                                        </div>
                                                    </div>
                                                    {userRole === 'admin' && (
                                                        <div className="three-dots-flex-end">
                                                            <div className="three-dots-container">
                                                                <div
                                                                    className="three-dots"
                                                                    onClick={(e) => handleOptionsClick(material._id, e)}
                                                                >
                                                                    <BsThreeDotsVertical />
                                                                </div>
                                                                {showOptions === material._id && (
                                                                    <div className="options-popup" ref={optionsPopupRef}>
                                                                        <Link
                                                                            to={`/setmat/${material._id}`}
                                                                            className="popup-button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEditClick(material._id);
                                                                            }}
                                                                        >
                                                                            Изменить
                                                                        </Link>
                                                                        <button
                                                                            className="popup-button delete-btn"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteClick(material._id);
                                                                            }}
                                                                        >
                                                                            Удалить
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            {selectedMaterial && (
                <div className="educmat-modal-overlay">
                    <div className="educmat-modal">
                        <div className="educmat-modal-content" ref={modalContentRef}>
                            <button className="close-modal-btn" onClick={handleCloseModal}>
                                <BsX />
                            </button>
                            <div className="educmat-modal-row">
                                <div className="educmat-modal-img">
                                    <img
                                        src={selectedMaterial.image && selectedMaterial.image[0] ?
                                            `/uploads/images/${selectedMaterial.image[0]}` :
                                            placeholderImage}
                                        alt={selectedMaterial.title}
                                        className="modal-image"
                                    />
                                </div>
                                <div className="educmat-modal-info">
                                    <div className="educmat-modal-header">
                                        <h2>{selectedMaterial.title}</h2>
                                        <span className="modal-category-badge">
                                            {selectedMaterial.category}
                                        </span>
                                        {selectedMaterial.visibility === 'Только студенты' && (
                                            <span className="modal-student-badge">
                                                Только для студентов
                                            </span>
                                        )}
                                    </div>
                                    <div className="educmat-modal-description">
                                        <h4>Описание:</h4>
                                        <p>{selectedMaterial.description || "Нет описания"}</p>
                                    </div>
                                    {selectedMaterial.file && selectedMaterial.file.length > 0 && (
                                        <div className="educmat-modal-files-list">
                                            <h4>Файлы:</h4>
                                            <ul className="educmat-modal-ul">
                                                {selectedMaterial.file.map((fileName, index) => (
                                                    <li className="educmat-modal-li" key={index}>
                                                        <a
                                                            href={`/uploads/materials/${fileName}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="file-link"
                                                        >
                                                            {fileName}
                                                            <span className="file-download-icon">↓</span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default EducMat;
