import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import '../Components/style/home.css';
import logo from "../img/Group8.png";
import rectengale from "../img/Rectangle10.png";
import Group9 from "../img/Group9.png";
import Check from "../img/check.png";
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.fade-in');

      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
          element.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Подготовка к ЕГЭ на высокие баллы</title>
        <meta name="description" content="Подготовим к ЕГЭ 2025 на высокий балл, поможем выбрать профессию мечты и поступить в вуз на бюджет" />
        <meta name="keywords" content="ЕГЭ, подготовка, высокие баллы, поступление, вуз, бюджет" />
        <meta property="og:title" content="Подготовка к ЕГЭ на высокие баллы" />
        <meta property="og:description" content="Подготовим к ЕГЭ 2025 на высокий балл, поможем выбрать профессию мечты и поступить в вуз на бюджет" />
        <meta property="og:image" content="https://easymath-online.ru/path-to-your-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Подготовка к ЕГЭ на высокие баллы" />
        <meta name="twitter:description" content="Подготовим к ЕГЭ 2025 на высокий балл, поможем выбрать профессию мечты и поступить в вуз на бюджет" />
        <meta name="twitter:image" content="https://easymath-online.ru/path-to-your-image.jpg" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "EasyMath",
              "description": "Подготовим к ЕГЭ 2025 на высокий балл, поможем выбрать профессию мечты и поступить в вуз на бюджет",
              "url": "https://easymath-online.ru/",
              "logo": "https://easymath-online.ru/path-to-your-logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+123456789",
                "contactType": "customer service"
              }
            }
          `}
        </script>
      </Helmet>
      <Header />
      <main className="main-content">
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text fade-in">
                <div className="hero-tagline">
                  <p>Занятия по подготовке к ЕГЭ</p>
                  <img src={rectengale} alt="Декоративная линия" className="decorative-line" />
                </div>
                <h1 className="hero-title">Сдавай ЕГЭ на высокие баллы</h1>
                <p className="hero-description">
                  Подготовим к ЕГЭ 2025 на высокий балл, поможем выбрать профессию мечты и поступить в вуз на бюджет
                </p>
                <div className="hero-actions">
                  <Link to="/registration"  className="cta-button">НАЧАТЬ ПОДГОТОВКУ</Link>
                  <img src={Group9} alt="Декоративный элемент" className="hero-decoration decorative-element" />
                </div>
              </div>
              <div className="hero-image fade-in">
                <div className="image-container">
                  <img src={logo} alt="Иллюстрация подготовки к ЕГЭ" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2 className="section-title fade-in">
              Подготовка к ЕГЭ на курсах – не просто решение тестов<br />
              Ученики сдают на 80+ благодаря комплексному подходу к обучению
            </h2>

            <div className="features-grid">
              <div className="feature-card fade-in">
                <div className="feature-header">
                  <span className="feature-number">1</span>
                  <h3 className="feature-title">Глубокое понимание предмета</h3>
                </div>
                <div className="feature-content">
                  <p className="feature-summary">
                    Цель преподавателя - чтобы каждый ученик разобрался в каждой теме.
                  </p>
                  <ul className="feature-list">
                    <li>
                      <img src={Check} alt="Галочка" />
                      <span>Никаких правил с малопонятными терминами, а удобные схемы</span>
                    </li>
                    <li>
                      <img src={Check} alt="Галочка" />
                      <span>Открываем новое и интересное в языке</span>
                    </li>
                    <li>
                      <img src={Check} alt="Галочка" />
                      <span>Учимся общаясь и задавая вопросы, а не слушая скучные лекции</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="feature-card fade-in" style={{ transitionDelay: '0.2s' }}>
                <div className="feature-header">
                  <span className="feature-number">2</span>
                  <h3 className="feature-title">Дисциплина в учебе</h3>
                </div>
                <div className="feature-content">
                  <p className="feature-summary">
                    Помогаем школьнику выработать самодисциплину и привычку учиться
                  </p>
                  <ul className="feature-list">
                    <li>
                      <img src={Check} alt="Галочка" />
                      <span>Ставим строгие дедлайны дз</span>
                    </li>
                    <li>
                      <img src={Check} alt="Галочка" />
                      <span>Обучаем тайм-менеджменту</span>
                    </li>
                    <li>
                      <img src={Check} alt="Галочка" />
                      <span>Создали атмосферу, где пропускать занятия - не круто</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="feature-card fade-in" style={{ transitionDelay: '0.4s' }}>
                <div className="feature-header">
                  <span className="feature-number">3</span>
                  <h3 className="feature-title">Внутренняя мотивация</h3>
                </div>
                <div className="feature-content">
                  <p className="feature-summary">
                    Не принуждаем к занятиям, а пробуждаем любопытство к познанию
                  </p>
                  <ul className="feature-list">
                    <li>
                      <img src={Check} alt="Галочка" />
                      <span>Приводим примеры из реальной жизни</span>
                    </li>
                    <li>
                      <img src={Check} alt="Галочка" />
                      <span>Объясняем сложный материал простым языком</span>
                    </li>
                    <li>
                      <img src={Check} alt="Галочка" />
                      <span>Проводим занятия в формате диалога, а не лекций</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
