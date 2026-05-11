import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  getReviews,
  getSocialLinks,
  getSettings,
  getAboutSettings,
  getFooterSettings,
  getReviewQuote,
  sendRequest,
} from '../services/api';

const Reviews = () => {
  const { lang, setLang } = useLanguage();
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  const [reviews, setReviews] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [aboutSettings, setAboutSettings] = useState(null);
  const [footerSettings, setFooterSettings] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quote, setQuote] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // ========== УПРАВЛЕНИЕ СКРОЛЛОМ ==========
  // Сохраняем позицию при уходе со страницы
  useEffect(() => {
    const path = location.pathname;
    const saveScroll = () => {
      sessionStorage.setItem(`scroll_${path}`, window.scrollY);
    };
    window.addEventListener('beforeunload', saveScroll);
    return () => {
      saveScroll();
      window.removeEventListener('beforeunload', saveScroll);
    };
  }, [location.pathname]);

  // Восстанавливаем позицию после загрузки данных
  useEffect(() => {
    if (isDataLoaded) {
      const saved = sessionStorage.getItem(`scroll_${location.pathname}`);
      if (saved !== null) {
        window.scrollTo(0, parseInt(saved, 10));
        sessionStorage.removeItem(`scroll_${location.pathname}`);
      }
    }
  }, [isDataLoaded, location.pathname]);

  const translations = {
    header: { ru: 'Заказать проект', en: 'Order a project' },
    menuHome: { ru: 'Главная', en: 'Home' },
    menuAbout: { ru: 'О бюро', en: 'About' },
    menuInteriors: { ru: 'Интерьеры', en: 'Interiors' },
    menuServices: { ru: 'Услуги', en: 'Services' },
    menuNews: { ru: 'Новости', en: 'News' },
    menuReviews: { ru: 'Отзывы', en: 'Reviews' },
    menuContacts: { ru: 'Контакты', en: 'Contacts' },
    menuFaq: { ru: 'FAQ', en: 'FAQ' },
    cabinet: { ru: 'ЛК', en: 'PA' },
    login: { ru: 'Войти', en: 'Login' },
    formTitle: { ru: 'Свяжитесь с нами', en: 'Contact us' },
    formName: { ru: 'ФИО', en: 'Full name' },
    formPhone: { ru: 'Телефон', en: 'Phone' },
    formEmail: { ru: 'Email', en: 'Email' },
    formQuestion: { ru: 'Ваш вопрос', en: 'Your question' },
    formTelegram: { ru: 'Написать в телеграме', en: 'Write in Telegram' },
    formCall: { ru: 'Позвонить по телефону', en: 'Call by phone' },
    formConsent: { ru: 'Подтверждаю согласие с ', en: 'I agree with the ' },
    formPrivacy: { ru: 'Политикой конфиденциальности', en: 'Privacy Policy' },
    formSubmit: { ru: 'Отправить', en: 'Send' },
    formSending: { ru: 'Отправка...', en: 'Sending...' },
    modalTitle: { ru: 'Спасибо за оставленную заявку!', en: 'Thank you for your request!' },
    modalText: { ru: 'Мы свяжемся с вами в ближайшее время.', en: 'We will contact you shortly.' },
    footerPrivacy: { ru: 'Политика конфиденциальности', en: 'Privacy Policy' },
    mobileOrderBtn: { ru: 'Заказать проект', en: 'Order project' },
    pageTitle: { ru: 'ОТЗЫВЫ', en: 'REVIEWS' },
    errorNameRequired: { ru: 'Введите имя', en: 'Name is required' },
    errorPhoneInvalid: { ru: 'Телефон должен содержать только цифры', en: 'Phone number must contain only digits' },
    errorEmailInvalid: { ru: 'Введите корректный email', en: 'Enter a valid email' },
    errorQuestionRequired: { ru: 'Введите вопрос', en: 'Question is required' },
    errorConsentRequired: { ru: 'Подтвердите согласие', en: 'You must agree to the privacy policy' }
  };

  const t = (obj) => obj?.[lang] || obj?.ru || '';
  const tSimple = (obj) => obj?.[lang] || obj?.ru || '';

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  useEffect(() => {
    Promise.all([
      getReviews().then((res) => {
        const sorted = [...res.data].sort((a, b) => b.id - a.id);
        setReviews(sorted);
      }),
      getSocialLinks().then((res) => setSocialLinks(res.data || [])),
      getSettings().then((res) => res.data?.[0] && setSettings(res.data[0])),
      getAboutSettings().then((res) => res.data?.[0] && setAboutSettings(res.data[0])),
      getFooterSettings().then((res) => res.data?.[0] && setFooterSettings(res.data[0])),
      getReviewQuote().then((res) => setQuote(res.data))
    ]).finally(() => setIsDataLoaded(true));
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowOrderModal(false);
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Унифицированная форма заказа
  const OrderForm = ({ isModal = false }) => {
    const [nameValue, setNameValue] = useState('');
    const [phoneValue, setPhoneValue] = useState('');
    const [emailValue, setEmailValue] = useState('');
    const [questionValue, setQuestionValue] = useState('');
    const [contactMethod, setContactMethod] = useState('telegram');
    const [consentValue, setConsentValue] = useState(true);
    const [localErrors, setLocalErrors] = useState({ name: false, phone: false, email: false, question: false, consent: false });
    const [localStatus, setLocalStatus] = useState('');

    const validateField = (name, value) => {
      if (name === 'name') return value.trim() !== '';
      if (name === 'phone') return value.replace(/\D/g, '') !== '';
      if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (name === 'question') return value.trim() !== '';
      if (name === 'consent') return value === true;
      return true;
    };

    const handleFieldBlur = (field, value) => {
      const isValid = validateField(field, value);
      setLocalErrors(prev => ({ ...prev, [field]: !isValid }));
    };

    const handleSubmitForm = async (e) => {
      e.preventDefault();
      const newErrors = {
        name: !validateField('name', nameValue),
        phone: !validateField('phone', phoneValue),
        email: !validateField('email', emailValue),
        question: !validateField('question', questionValue),
        consent: !validateField('consent', consentValue),
      };
      setLocalErrors(newErrors);
      if (Object.values(newErrors).some(v => v === true)) return;

      setLocalStatus('sending');
      try {
        await sendRequest({
          name: nameValue,
          phone: phoneValue.replace(/\D/g, ''),
          email: emailValue,
          question: questionValue,
          contact_method: contactMethod,
          consent: consentValue,
        });
        setLocalStatus('success');
        setNameValue('');
        setPhoneValue('');
        setEmailValue('');
        setQuestionValue('');
        setContactMethod('telegram');
        setConsentValue(true);
        setLocalErrors({ name: false, phone: false, email: false, question: false, consent: false });
        if (isModal) setShowOrderModal(false);
        setShowModal(true);
        setTimeout(() => setLocalStatus(''), 3000);
      } catch (err) {
        setLocalStatus('error');
        setTimeout(() => setLocalStatus(''), 3000);
      }
    };

    const inputHeight = "h-[50px] lg:h-[60px]";
    const containerHeight = "h-[75px] lg:h-[85px]";
    const textareaHeight = "h-[80px] lg:h-[90px]";
    const textareaContainerHeight = "h-[120px] lg:h-[130px]";

    const labelBaseClass = "absolute left-4 transition-all duration-200 pointer-events-none bg-transparent px-1 z-10 -top-5 text-xs text-black/70 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-black/50 peer-placeholder-shown:text-[16px] lg:peer-placeholder-shown:text-[20px] peer-placeholder-shown:-translate-y-1/2";
    const textareaLabelClass = "absolute left-4 transition-all duration-200 pointer-events-none bg-transparent px-1 z-10 -top-5 text-xs text-black/70 peer-placeholder-shown:top-4 peer-placeholder-shown:text-black/50 peer-placeholder-shown:text-[16px] lg:peer-placeholder-shown:text-[20px]";

    return (
      <form onSubmit={handleSubmitForm} noValidate className="flex flex-col gap-[10px] lg:gap-[20px]">
        <div className={`relative ${containerHeight}`}>
          <input
            type="text"
            value={nameValue}
            onChange={(e) => { setNameValue(e.target.value); if (localErrors.name) setLocalErrors(prev => ({ ...prev, name: false })); }}
            onBlur={(e) => handleFieldBlur('name', e.target.value)}
            className={`w-full ${inputHeight} px-4 border rounded-[5px] bg-transparent text-black text-[16px] lg:text-[20px] focus:outline-none focus:ring-2 peer ${localErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-black/25 focus:border-black focus:ring-black/20'}`}
            placeholder=" "
            style={{ caretColor: 'black' }}
          />
          <label className={labelBaseClass}>{tSimple(translations.formName)}</label>
          {localErrors.name && <p className="text-red-500 text-sm absolute left-0 bottom-0 m-0">{tSimple(translations.errorNameRequired)}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`relative ${containerHeight}`}>
            <input
              type="text"
              value={phoneValue}
              onChange={(e) => { setPhoneValue(e.target.value); if (localErrors.phone) setLocalErrors(prev => ({ ...prev, phone: false })); }}
              onBlur={(e) => handleFieldBlur('phone', e.target.value)}
              className={`w-full ${inputHeight} px-4 border rounded-[5px] bg-transparent text-black text-[16px] lg:text-[20px] focus:outline-none focus:ring-2 peer ${localErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-black/25 focus:border-black focus:ring-black/20'}`}
              placeholder=" "
              style={{ caretColor: 'black' }}
            />
            <label className={labelBaseClass}>{tSimple(translations.formPhone)}</label>
            {localErrors.phone && <p className="text-red-500 text-sm absolute left-0 bottom-0 m-0">{tSimple(translations.errorPhoneInvalid)}</p>}
          </div>
          <div className={`relative ${containerHeight}`}>
            <input
              type="text"
              value={emailValue}
              onChange={(e) => { setEmailValue(e.target.value); if (localErrors.email) setLocalErrors(prev => ({ ...prev, email: false })); }}
              onBlur={(e) => handleFieldBlur('email', e.target.value)}
              className={`w-full ${inputHeight} px-4 border rounded-[5px] bg-transparent text-black text-[16px] lg:text-[20px] focus:outline-none focus:ring-2 peer ${localErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-black/25 focus:border-black focus:ring-black/20'}`}
              placeholder=" "
              style={{ caretColor: 'black' }}
            />
            <label className={labelBaseClass}>{tSimple(translations.formEmail)}</label>
            {localErrors.email && <p className="text-red-500 text-sm absolute left-0 bottom-0 m-0">{tSimple(translations.errorEmailInvalid)}</p>}
          </div>
        </div>

        <div className={`relative ${textareaContainerHeight}`}>
          <textarea
            rows={4}
            value={questionValue}
            onChange={(e) => { setQuestionValue(e.target.value); if (localErrors.question) setLocalErrors(prev => ({ ...prev, question: false })); }}
            onBlur={(e) => handleFieldBlur('question', e.target.value)}
            className={`w-full ${textareaHeight} px-4 py-3 border rounded-[5px] bg-transparent text-black text-[16px] lg:text-[20px] focus:outline-none focus:ring-2 resize-none peer ${localErrors.question ? 'border-red-500 focus:ring-red-500' : 'border-black/25 focus:border-black/50 focus:ring-black/30'}`}
            placeholder=" "
            style={{ caretColor: 'black' }}
          />
          <label className={textareaLabelClass}>{tSimple(translations.formQuestion)}</label>
          {localErrors.question && <p className="text-red-500 text-sm absolute left-0 bottom-4 m-0">{tSimple(translations.errorQuestionRequired)}</p>}
        </div>

        <div className="flex flex-wrap gap-5 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={isModal ? "modal-contact_method" : "contact_method"}
              value="telegram"
              checked={contactMethod === 'telegram'}
              onChange={() => setContactMethod('telegram')}
              className="w-[20px] h-[20px] accent-[#808184]"
            />
            <span className="text-[16px] lg:text-[20px] text-[#808184]">{tSimple(translations.formTelegram)}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={isModal ? "modal-contact_method" : "contact_method"}
              value="call"
              checked={contactMethod === 'call'}
              onChange={() => setContactMethod('call')}
              className="w-[20px] h-[20px] accent-[#808184]"
            />
            <span className="text-[16px] lg:text-[20px] text-[#808184]">{tSimple(translations.formCall)}</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consentValue}
              onChange={(e) => setConsentValue(e.target.checked)}
              onBlur={() => handleFieldBlur('consent', consentValue)}
              className="w-[20px] h-[20px] accent-[#808184]"
            />
            <span className="text-[16px] lg:text-[20px] text-[#808184]">
              {tSimple(translations.formConsent)} <Link to="/privacy" className="underline hover:opacity-80">{tSimple(translations.formPrivacy)}</Link>
            </span>
          </label>
          {localErrors.consent && <p className="text-red-500 text-sm mt-1">{tSimple(translations.errorConsentRequired)}</p>}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={localStatus === 'sending'}
            className="w-full max-w-[277px] h-[35px] lg:h-[50px] bg-[#353535] rounded-[5px] text-white text-[16px] lg:text-[24px] font-normal hover:underline transition disabled:opacity-50 focus:outline-none focus:ring-0"
          >
            {localStatus === 'sending' ? tSimple(translations.formSending) : tSimple(translations.formSubmit)}
          </button>
        </div>
      </form>
    );
  };

  const openOrderModal = () => setShowOrderModal(true);

  const houseImages = [
    '/house1.png',
    '/house2.png',
    '/house3.png',
    '/house4.png',
    '/house5.png',
    '/house6.png',
  ];

  return (
    <Layout
      socialLinks={socialLinks}
      footerSettings={footerSettings}
      onOrderClick={openOrderModal}
      lang={lang}
      setLang={setLang}
      translations={translations}
      token={token}
    >
      <div className="px-5 xl:px-[100px]">
        <h1 className="text-[20px] lg:text-[32px] font-light text-black text-left mt-[20px] lg:mt-[60px] mb-[20px] lg:mb-[40px]">
          {tSimple(translations.pageTitle)}
        </h1>
        {quote && (quote.text_ru || quote.text_en) && (
          <div className="mb-5 lg:mb-10">
            <div className="max-w-full">
              <p className="text-[20px] lg:text-[40px] font-bold text-black whitespace-pre-wrap">
                {t({ ru: quote.text_ru, en: quote.text_en })}
              </p>
              <p className="text-[16px] lg:text-[20px] font-normal text-black mt-2">
                — {t({ ru: quote.author_ru, en: quote.author_en })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Десктопная версия */}
      <div className="hidden lg:block">
        <div className="lg:px-5 xl:px-5 2xl:px-0">
          <div className="flex flex-col gap-10">
            {reviews.map((review, idx) => {
              const isImageLeft = idx % 2 === 0;
              const houseIndex = idx % houseImages.length;
              const houseImage = houseImages[houseIndex];
              return (
                <div key={review.id} className="relative w-full">
                  <div className={`flex flex-col ${isImageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-stretch gap-10`}>
                    <div className={`w-[200px] h-[200px] flex-shrink-0 ${isImageLeft ? '2xl:ml-[100px]' : '2xl:mr-[100px]'}`}>
                      <img src={houseImage} alt="Дом" className="w-full h-full object-contain rounded-[5px]" />
                    </div>
                    <div className="relative w-full max-w-[990px] rounded-[5px] border border-black/25 p-5 bg-transparent">
                      {review.photo && (
                        <div className="w-[250px] xl:w-[350px] h-auto xl:h-[200px] flex-shrink-0 float-left mr-[20px] xl:mr-[30px] mb-3">
                          <img src={review.photo} alt="Фото отзыва" className="w-full h-full object-contain rounded-[5px]" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <h3 className="text-[16px] font-bold text-black mb-2">
                          {t({ ru: review.client_name_ru, en: review.client_name_en })}
                        </h3>
                        {review.project_ru && (
                          <p className="text-[16px] italic text-black mb-3">
                            {t({ ru: review.project_ru, en: review.project_en })}
                          </p>
                        )}
                        <p className="text-[16px] text-black leading-relaxed">
                          {t({ ru: review.text_ru, en: review.text_en })}
                        </p>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                              fill={star <= review.rating ? "black" : "none"}
                              fillOpacity={star <= review.rating ? 0.5 : 0}
                              stroke="black"
                              strokeOpacity={star <= review.rating ? 0 : 0.5}
                              strokeWidth="0.5"
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Мобильная версия */}
      <div className="block lg:hidden">
        <div className="flex flex-col gap-5 px-5">
          {reviews.map((review, idx) => (
            <div key={review.id} className="w-full bg-white rounded-[5px] border border-black/25 p-5">
              <div className="flex gap-4">
                {review.photo && (
                  <img
                    src={review.photo}
                    alt=""
                    className="w-[35%] h-auto max-[640px]:aspect-square max-[640px]:object-cover rounded-[5px]"
                  />
                )}
                <div className={review.photo ? "flex-1 flex flex-col items-end" : "w-full flex flex-col items-end"}>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          fill={star <= review.rating ? "black" : "none"}
                          fillOpacity={star <= review.rating ? 0.5 : 0}
                          stroke="black"
                          strokeOpacity={star <= review.rating ? 0 : 0.5}
                          strokeWidth="0.5"
                        />
                      </svg>
                    ))}
                  </div>
                  <h3 className="text-[16px] font-bold text-black text-right">
                    {t({ ru: review.client_name_ru, en: review.client_name_en })}
                  </h3>
                  {review.project_ru && (
                    <p className="text-[16px] italic text-black text-right mt-1">
                      {t({ ru: review.project_ru, en: review.project_en })}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[16px] text-black leading-relaxed mt-4">
                {t({ ru: review.text_ru, en: review.text_en })}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-5 mb-5">
          <img src="/house1.png" alt="" className="w-auto h-auto max-w-full" />
        </div>
      </div>

      <div className="h-[20px] lg:h-[60px]"></div>

      {/* Модальное окно заказа */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowOrderModal(false)}>
          <div className="relative w-full max-w-[1321px] mx-4 bg-white rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-4 md:p-10" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowOrderModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl focus:outline-none focus:ring-0">×</button>
            <div className="flex flex-col md:flex-row gap-8 md:gap-10">
              <div className="md:w-1/3 flex items-center justify-center md:justify-start">
                <h2 className="text-[24px] md:text-[32px] lg:text-[40px] font-bold text-black text-center md:text-left break-words whitespace-normal">
                  {tSimple(translations.formTitle)}
                </h2>
              </div>
              <div className="md:w-2/3">
                <OrderForm isModal={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно благодарности */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div
            className="relative bg-white rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] flex flex-col justify-center items-center text-center p-5
                       w-[300px] h-[200px] sm:w-[600px] sm:h-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl focus:outline-none focus:ring-0">×</button>
            <p className="text-[20px] sm:text-[32px] font-light text-black mb-3 sm:mb-5">
              {tSimple(translations.modalTitle)}
            </p>
            <p className="text-[14px] sm:text-[20px] italic font-light text-black">
              {tSimple(translations.modalText)}
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Reviews;