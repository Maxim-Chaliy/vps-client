import React from "react";
import { FaTelegramPlane } from "react-icons/fa";
import freeIcon from "./img/FreeMathematics.png";
import freeWink from "./img/freeWink.png";
import '../Components/style/footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="brand-logo"><img src={freeIcon} alt="Free Mathematics" /></div>
                        <div className="brand-text">
                            <div className="brand-title"><a href="">Онлайн-репетитор</a></div>
                            <div className="brand-name"><a href="">Easymath</a></div>
                        </div>
                    </div>
                    <div className="footer-contacts">
                        <div className="contacts-text"><p>Свяжитесь с нами</p></div>
                        {/* <div className="contacts-icon"><img src={freeWink} alt="Wink" /></div> */}
                        <div className="social-links">
                            <div onClick={() => window.open('https://t.me/MathRuslan', '_blank')} className="social-link telegram">
                                <FaTelegramPlane size='30px' />
                            </div>
                            <div onClick={() => window.open('https://api.whatsapp.com/send/?phone=79117631649', '_blank')} className="social-link whats">
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 32 32">
                                    <title>Whats up</title>
                                    <path d="M22 20c-2 2-2 4-4 4s-4-2-6-4-4-4-4-6 2-2 4-4-4-8-6-8-6 6-6 6c0 4 4.109 12.109 8 16s12 8 16 8c0 0 6-4 6-6s-6-8-8-6z"></path>
                                </svg>
                            </div>
                            <div onClick={() => window.open('https://vk.com/ruslantutor', '_blank')} className="social-link vk">
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 31 28">
                                    <title>VK</title>
                                    <path d="M29.953 8.125c0.234 0.641-0.5 2.141-2.344 4.594-3.031 4.031-3.359 3.656-0.859 5.984 2.406 2.234 2.906 3.313 2.984 3.453 0 0 1 1.75-1.109 1.766l-4 0.063c-0.859 0.172-2-0.609-2-0.609-1.5-1.031-2.906-3.703-4-3.359 0 0-1.125 0.359-1.094 2.766 0.016 0.516-0.234 0.797-0.234 0.797s-0.281 0.297-0.828 0.344h-1.797c-3.953 0.25-7.438-3.391-7.438-3.391s-3.813-3.938-7.156-11.797c-0.219-0.516 0.016-0.766 0.016-0.766s0.234-0.297 0.891-0.297l4.281-0.031c0.406 0.063 0.688 0.281 0.688 0.281s0.25 0.172 0.375 0.5c0.703 1.75 1.609 3.344 1.609 3.344 1.563 3.219 2.625 3.766 3.234 3.437 0 0 0.797-0.484 0.625-4.375-0.063-1.406-0.453-2.047-0.453-2.047-0.359-0.484-1.031-0.625-1.328-0.672-0.234-0.031 0.156-0.594 0.672-0.844 0.766-0.375 2.125-0.391 3.734-0.375 1.266 0.016 1.625 0.094 2.109 0.203 1.484 0.359 0.984 1.734 0.984 5.047 0 1.062-0.203 2.547 0.562 3.031 0.328 0.219 1.141 0.031 3.141-3.375 0 0 0.938-1.625 1.672-3.516 0.125-0.344 0.391-0.484 0.391-0.484s0.25-0.141 0.594-0.094l4.5-0.031c1.359-0.172 1.578 0.453 1.578 0.453z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="copyright">
                    © {new Date().getFullYear()} Онлайн-репетитор Easymath
                </div>
            </div>
        </footer>
    )
}

export default Footer;