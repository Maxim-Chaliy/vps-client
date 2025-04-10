import React, { useState, useEffect } from "react";
import freeIcon2 from "./img/FreeMathematics2.png";
import { Link, useNavigate } from "react-router-dom";
import '../Components/style/header.css';

const Header = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showHeader, setShowHeader] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            // Прячем шапку при прокрутке вниз, показываем при прокрутке вверх
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowHeader(false);
            } else if (currentScrollY < lastScrollY) {
                setShowHeader(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsMenuOpen(false);
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''} ${!showHeader ? 'hidden' : ''}`}>
            <div className="header-container">
                <div className="header-content">
                    <div className="logo">
                        <Link className="logo-link" to="/home" onClick={closeMenu}>
                            <div className="logo-container">
                                <div className="logo-img">
                                    <img src={freeIcon2} alt="Easymath Logo" />
                                </div>
                                <div className="logo-text">
                                    <div className="logo-subtitle">Онлайн-репетитор</div>
                                    <div className="logo-title">Easymath</div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <button 
                        className={`mobile-menu-button ${isMenuOpen ? 'open' : ''}`} 
                        onClick={toggleMenu}
                        aria-label="Меню"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <div className={`navigation ${isMenuOpen ? 'open' : ''}`}>
                        <nav className="main-nav">
                            <Link className="nav-link" to="/educmat" onClick={closeMenu}>Учебные материалы</Link>
                            <Link className="nav-link" to="/schedule" onClick={closeMenu}>Расписание</Link>
                            <Link className="nav-link" to="/reviews" onClick={closeMenu}>Отзывы</Link>
                        </nav>

                        <div className="header-actions">
                            <Link 
                                className="application-button" 
                                to="/appform" 
                                onClick={closeMenu}
                            >
                                Подать заявку
                            </Link>
                            {isAuthenticated ? (
                                <button 
                                    className="auth-button logout" 
                                    onClick={handleLogout}
                                    aria-label="Выйти"
                                >
                                    <div className="button-icon">
                                        <svg viewBox="0 0 512 512">
                                            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                                        </svg>
                                    </div>
                                    <div className="button-text">Выйти</div>
                                </button>
                            ) : (
                                <button 
                                    className="auth-button login" 
                                    onClick={() => {
                                        closeMenu();
                                        navigate('/authorization');
                                    }}
                                    aria-label="Войти"
                                >
                                    <div className="button-icon">
                                        <svg viewBox="0 0 512 512">
                                            <path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                                        </svg>
                                    </div>
                                    <div className="button-text">Войти</div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;