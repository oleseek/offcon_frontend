import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  getProjects,
  getServices,
  getNews,
  getReviews,
  sendRequest,
  getSettings,
  getAboutSettings,
  getFooterSettings,
  getSocialLinks
} from '../services/api';

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://offcon-backend.onrender.com${path.startsWith('/') ? path : '/' + path}`;
};

const Home = () => {
  const { lang, setLang } = useLanguage();
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [news, setNews] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState({ project_type: '', style: '', area_min: '', area_max: '' });
  const [settings, setSettings] = useState(null);
  const [aboutSettings, setAboutSettings] = useState(null);
  const [footerSettings, setFooterSettings] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    const saveScroll = () => sessionStorage.setItem(`scroll_${location.pathname}`, window.scrollY);
    window.addEventListener('scroll', saveScroll);
    return () => {
      saveScroll();
      window.removeEventListener('scroll', saveScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (dataLoaded) {
      const saved = sessionStorage.getItem(`scroll_${location.pathname}`);
      if (saved !== null) {
        const targetY = parseInt(saved, 10);
        requestAnimationFrame(() => setTimeout(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: Math.min(targetY, maxScroll), behavior: 'instant' });
        }, 100));
      } else window.scrollTo(0, 0);
    }
  }, [dataLoaded, location.pathname]);

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
    bannerTitle: { ru: 'Архитектура, которая соединяет историю и интерьер', en: 'Architecture that connects history and interior' },
    bannerSubtitle: { ru: 'Создаем пространства, куда всегда хочется возвращаться.', en: 'We create spaces you always want to return to.' },
    bannerBtnOrder: { ru: 'Заказать проект', en: 'Order a project' },
    bannerBtnInteriors: { ru: 'Интерьеры', en: 'Interiors' },
    aboutTitle: { ru: 'О БЮРО', en: 'ABOUT' },
    aboutMore: { ru: 'всё о бюро и FAQ →', en: 'all about the bureau and FAQ →' },
    aboutDefaultName: { ru: 'ФЕДОР РАЩЕВСКИЙ', en: 'FEDOR RASCHEVSKY' },
    aboutDefaultPosition: { ru: 'Руководитель бюро', en: 'Head of bureau' },
    aboutDefaultQuote: { ru: '— Создаем пространства, куда всегда хочется возвращаться.', en: '— We create spaces you always want to return to.' },
    aboutDefaultText: {
      ru: 'Минимализм. Изысканность. Искусство.\nПроектируем дома, апартаменты и отели для тех, кто ценит интеллект в деталях.\nСовмещаем чистую геометрию с теплом эксклюзивности.\nСоздаём пространства, куда всегда хочется возвращаться.',
      en: 'Minimalism. Refinement. Art.\nWe design houses, apartments and hotels for those who appreciate intelligence in details.\nWe combine pure geometry with the warmth of exclusivity.\nWe create spaces you always want to return to.'
    },
    interiorsTitle: { ru: 'ИНТЕРЬЕРЫ', en: 'INTERIORS' },
    interiorsMore: { ru: 'все интерьеры бюро →', en: 'all interiors →' },
    servicesTitle: { ru: 'УСЛУГИ', en: 'SERVICES' },
    servicesMore: { ru: 'все услуги бюро →', en: 'all services →' },
    reviewsTitle: { ru: 'ОТЗЫВЫ', en: 'REVIEWS' },
    reviewsMore: { ru: 'все отзывы бюро →', en: 'all reviews →' },
    newsTitle: { ru: 'НОВОСТИ БЮРО', en: 'NEWS' },
    newsMore: { ru: 'все новости бюро →', en: 'all news →' },
    projectHoverLearn: { ru: 'узнать больше о проекте', en: 'learn more about the project' },
    projectBtnOrder: { ru: 'Заказать проект', en: 'Order project' },
    serviceBtnOrder: { ru: 'Заказать проект', en: 'Order project' },
    newsReadMore: { ru: 'перейти к новости →', en: 'go to news →' },
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
    errorNameRequired: { ru: 'Введите имя', en: 'Name is required' },
    errorPhoneInvalid: { ru: 'Телефон должен содержать только цифры', en: 'Phone number must contain only digits' },
    errorEmailInvalid: { ru: 'Введите корректный email', en: 'Enter a valid email' },
    errorQuestionRequired: { ru: 'Введите вопрос', en: 'Question is required' },
    errorConsentRequired: { ru: 'Подтвердите согласие с политикой конфиденциальности', en: 'You must agree to the privacy policy' }
  };

  const t = (obj) => obj?.[lang] || obj?.ru || '';
  const tSimple = (obj) => obj?.[lang] || obj?.ru || '';

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
            <input type="radio" name={isModal ? "modal-contact_method" : "contact_method"} value="telegram" checked={contactMethod === 'telegram'} onChange={() => setContactMethod('telegram')} className="w-[20px] h-[20px] accent-[#808184]" />
            <span className="text-[16px] lg:text-[20px] text-[#808184]">{tSimple(translations.formTelegram)}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name={isModal ? "modal-contact_method" : "contact_method"} value="call" checked={contactMethod === 'call'} onChange={() => setContactMethod('call')} className="w-[20px] h-[20px] accent-[#808184]" />
            <span className="text-[16px] lg:text-[20px] text-[#808184]">{tSimple(translations.formCall)}</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={consentValue} onChange={(e) => setConsentValue(e.target.checked)} onBlur={() => handleFieldBlur('consent', consentValue)} className="w-[20px] h-[20px] accent-[#808184]" />
            <span className="text-[16px] lg:text-[20px] text-[#808184]">
              {tSimple(translations.formConsent)} <Link to="/privacy" className="underline hover:opacity-80">{tSimple(translations.formPrivacy)}</Link>
            </span>
          </label>
          {localErrors.consent && <p className="text-red-500 text-sm mt-1">{tSimple(translations.errorConsentRequired)}</p>}
        </div>

        <div className="flex justify-center">
          <button type="submit" disabled={localStatus === 'sending'} className="w-full max-w-[277px] h-[35px] lg:h-[50px] bg-[#353535] rounded-[5px] text-white text-[16px] lg:text-[24px] font-normal hover:underline transition disabled:opacity-50 focus:outline-none focus:ring-0">
            {localStatus === 'sending' ? tSimple(translations.formSending) : tSimple(translations.formSubmit)}
          </button>
        </div>
      </form>
    );
  };

  const loadProjects = async () => {
    try {
      const params = {};
      if (filters.project_type) params.project_type = filters.project_type;
      if (filters.style) params.style = filters.style;
      const res = await getProjects(params);
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  useEffect(() => {
    Promise.all([
      getSettings().then(res => res.data?.[0] && setSettings(res.data[0])),
      getAboutSettings().then(res => res.data?.[0] && setAboutSettings(res.data[0])),
      getFooterSettings().then(res => res.data?.[0] && setFooterSettings(res.data[0])),
      getSocialLinks().then(res => setSocialLinks(res.data || [])),
      loadProjects(),
      getServices().then(res => setServices(res.data)),
      getNews().then(res => {
        const sortedNews = [...res.data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setNews(sortedNews.slice(0, 3));
      }),
      getReviews().then(res => {
        const sortedReviews = [...res.data].sort((a, b) => b.id - a.id);
        setReviews(sortedReviews.slice(0, 3));
      })
    ]).then(() => setDataLoaded(true));
  }, [filters]);

  const openOrderModal = () => setShowOrderModal(true);

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
      {/* Баннер */}
      <div className="pt-[60px] lg:pt-[100px] w-full">
        <div className="relative w-full h-[150px] lg:h-[330px] overflow-hidden">
          <img src={getMediaUrl(settings?.banner_image || '/banner.jpg')} alt="Баннер" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-white/60 px-4 text-center">
            <h1 className="text-black text-[20px] lg:text-[32px] font-bold">
              {t({ ru: settings?.banner_title_ru, en: settings?.banner_title_en }) || t(translations.bannerTitle)}
            </h1>
            <p className="text-[#353535] text-[14px] lg:text-[20px] italic mt-2.5">
              {t({ ru: settings?.banner_subtitle_ru, en: settings?.banner_subtitle_en }) || t(translations.bannerSubtitle)}
            </p>
          </div>
        </div>
      </div>

      {/* Кнопки под баннером */}
      <div className="flex justify-center gap-5 mt-5 mb-10 lg:mb-15 px-5">
        <button onClick={openOrderModal} className="w-full lg:w-[277px] h-[35px] lg:h-[50px] bg-transparent border border-[#353535] rounded-[5px] text-[#353535] text-[16px] lg:text-[24px] transition hover:shadow-md hover:underline focus:outline-none focus:ring-0">
          {t(translations.bannerBtnOrder)}
        </button>
        <Link to="/projects" className="w-full lg:w-[277px] h-[35px] lg:h-[50px] bg-transparent border border-[#353535] rounded-[5px] text-[#353535] text-[16px] lg:text-[24px] transition hover:shadow-md hover:underline flex items-center justify-center focus:outline-none focus:ring-0">
          {t(translations.bannerBtnInteriors)}
        </Link>
      </div>

      {/* О бюро */}
      <section id="about" className="w-full py-10 lg:py-20 relative">
        <div className="relative flex justify-start lg:justify-center mb-5 lg:mb-10">
          <h2 className="text-[20px] lg:text-[32px] font-light text-black ml-5 lg:ml-0">{t(translations.aboutTitle)}</h2>
          <Link to="/about" className="absolute right-5 top-1/2 -translate-y-1/2 text-[14px] lg:text-[16px] font-bold italic text-black hover:underline whitespace-nowrap">
            {t(translations.aboutMore)}
          </Link>
        </div>
        <div className="flex flex-row gap-4 lg:gap-5 items-start px-5 xl:px-[100px]">
          <div className="flex-shrink-0">
            <img src={getMediaUrl(aboutSettings?.image || '/team/fedor.jpg')} alt="Фёдор Ращевский" className="w-[105px] h-[125px] lg:w-[220px] lg:h-[240px] object-cover rounded-[5px]" />
          </div>
          <div className="flex-1 flex flex-col gap-[5px]">
            <p className="text-[16px] lg:text-[20px] font-bold text-black leading-none">
              {t({ ru: aboutSettings?.name_ru, en: aboutSettings?.name_en }) || t(translations.aboutDefaultName)}
            </p>
            <p className="text-[16px] lg:text-[20px] font-normal text-black">
              {t({ ru: aboutSettings?.position_ru, en: aboutSettings?.position_en }) || t(translations.aboutDefaultPosition)}
            </p>
            <p className="text-[16px] lg:text-[20px] italic text-black">
              {t({ ru: aboutSettings?.quote_ru, en: aboutSettings?.quote_en }) || t(translations.aboutDefaultQuote)}
            </p>
            <div className="mt-[10px] whitespace-pre-wrap">
              <p className="text-[16px] lg:text-[20px] font-normal text-black">
                {t({ ru: aboutSettings?.text_ru, en: aboutSettings?.text_en }) || t(translations.aboutDefaultText)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Интерьеры (проекты) */}
      <section id="projects" className="w-full py-0 mb-10 lg:mb-15">
        <div className="relative flex justify-start lg:justify-center mb-5 lg:mb-10">
          <h2 className="text-[20px] lg:text-[32px] font-light text-black px-5 lg:px-0">{t(translations.interiorsTitle)}</h2>
          <Link to="/projects" className="absolute right-5 top-1/2 -translate-y-1/2 text-[14px] lg:text-[16px] font-bold italic text-black hover:underline whitespace-nowrap">
            {t(translations.interiorsMore)}
          </Link>
        </div>
        {(() => {
          const lastProjects = [...projects].sort((a, b) => b.id - a.id).slice(0, 9);
          const desktopRows = [];
          for (let i = 0; i < lastProjects.length; i += 3) desktopRows.push(lastProjects.slice(i, i + 3));
          const mobilePairs = [];
          for (let i = 0; i < lastProjects.length; i += 2) mobilePairs.push(lastProjects.slice(i, i + 2));
          return (
            <>
              <div className="hidden lg:block">
                {desktopRows.map((row, rowIdx) => {
                  let leftW, middleW, rightW;
                  if (rowIdx === 0) { leftW = '30.2083%'; middleW = '38.1944%'; rightW = '30.2083%'; }
                  else if (rowIdx === 1) { leftW = '36.1111%'; middleW = '26.3889%'; rightW = '36.1111%'; }
                  else { leftW = '30.2083%'; middleW = '38.1944%'; rightW = '30.2083%'; }
                  const items = [...row];
                  while (items.length < 3) items.push(null);
                  return (
                    <div key={rowIdx} className="flex justify-start mb-[10px]" style={{ gap: '10px' }}>
                      {items[0] && (
                        <div className="group relative overflow-hidden cursor-pointer" style={{ width: leftW }}>
                          <img src={getMediaUrl(items[0].image)} alt="project" className="w-full h-[220px] object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex flex-col justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                            <div className="flex-1 flex items-center justify-center">
                              <span className="text-white text-[32px] font-bold text-center px-2">{t({ ru: items[0].title_ru, en: items[0].title_en })}</span>
                            </div>
                            <div className="w-full text-center pb-5">
                              <span className="text-white text-[20px] italic">{t(translations.projectHoverLearn)}</span>
                            </div>
                          </div>
                          <Link to={`/projects/${items[0].id}`} className="absolute inset-0" />
                        </div>
                      )}
                      {items[1] && (
                        <div className="group relative overflow-hidden cursor-pointer" style={{ width: middleW }}>
                          <img src={getMediaUrl(items[1].image)} alt="project" className="w-full h-[220px] object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex flex-col justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                            <div className="flex-1 flex items-center justify-center">
                              <span className="text-white text-[32px] font-bold text-center px-2">{t({ ru: items[1].title_ru, en: items[1].title_en })}</span>
                            </div>
                            <div className="w-full text-center pb-5">
                              <span className="text-white text-[20px] italic">{t(translations.projectHoverLearn)}</span>
                            </div>
                          </div>
                          <Link to={`/projects/${items[1].id}`} className="absolute inset-0" />
                        </div>
                      )}
                      {items[2] && (
                        <div className="group relative overflow-hidden cursor-pointer" style={{ width: rightW }}>
                          <img src={getMediaUrl(items[2].image)} alt="project" className="w-full h-[220px] object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex flex-col justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                            <div className="flex-1 flex items-center justify-center">
                              <span className="text-white text-[32px] font-bold text-center px-2">{t({ ru: items[2].title_ru, en: items[2].title_en })}</span>
                            </div>
                            <div className="w-full text-center pb-5">
                              <span className="text-white text-[20px] italic">{t(translations.projectHoverLearn)}</span>
                            </div>
                          </div>
                          <Link to={`/projects/${items[2].id}`} className="absolute inset-0" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="block lg:hidden px-5">
                <div className="flex flex-col gap-2">
                  {mobilePairs.map((pair, pairIdx) => {
                    const isEvenRow = pairIdx % 2 === 0;
                    const hasOneItem = pair.length === 1;
                    return (
                      <div key={pairIdx} className="flex gap-2">
                        <div className={`group relative cursor-pointer overflow-hidden ${hasOneItem ? 'w-full' : isEvenRow ? 'flex-[2]' : 'flex-[1]'}`}>
                          <img src={getMediaUrl(pair[0].image)} alt="project" className="w-full h-[clamp(110px,15vw,220px)] object-cover transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-white text-[14px] font-bold text-center px-2">{t({ ru: pair[0].title_ru, en: pair[0].title_en })}</span>
                          </div>
                          <Link to={`/projects/${pair[0].id}`} className="absolute inset-0" />
                        </div>
                        {!hasOneItem && (
                          <div className={`group relative cursor-pointer overflow-hidden ${isEvenRow ? 'flex-[1]' : 'flex-[2]'}`}>
                            <img src={getMediaUrl(pair[1].image)} alt="project" className="w-full h-[clamp(110px,15vw,220px)] object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <span className="text-white text-[14px] font-bold text-center px-2">{t({ ru: pair[1].title_ru, en: pair[1].title_en })}</span>
                            </div>
                            <Link to={`/projects/${pair[1].id}`} className="absolute inset-0" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          );
        })()}
      </section>

      {/* Услуги */}
      <section id="services" className="w-full pt-10 lg:pt-20 pb-5 lg:pb-10">
        <div className="relative flex justify-start lg:justify-center mb-5 lg:mb-10">
          <h2 className="text-[20px] lg:text-[32px] font-light text-black px-5 lg:px-0">{t(translations.servicesTitle)}</h2>
          <Link to="/services" className="absolute right-5 top-1/2 -translate-y-1/2 text-[14px] lg:text-[16px] font-bold italic text-black hover:underline whitespace-nowrap">
            {t(translations.servicesMore)}
          </Link>
        </div>
        <div className="w-full my-5 lg:my-10">
          <div className="relative w-full h-[150px] lg:h-[330px] overflow-hidden">
            <img src={getMediaUrl(settings?.promo_banner_image || '/promo-banner.jpg')} alt="Промо" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-[20px] lg:text-[32px] font-bold text-center px-4">
                {t({ ru: settings?.promo_text_ru, en: settings?.promo_text_en })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-5 lg:gap-10 px-5 lg:px-0">
          {services.map((service) => (
            <div key={service.id} className="w-full sm:w-[calc(50%-20px)] lg:w-[300px] min-h-[380px] bg-white rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] flex flex-col p-4">
              {service.icon && (
                <div className="w-[50px] h-[50px] flex items-center justify-center mb-5 mx-auto">
                  <img src={getMediaUrl(service.icon)} alt={t({ ru: service.name_ru, en: service.name_en })} className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <div className="flex flex-col flex-1">
                <h3 className="text-[16px] font-bold text-black text-center mb-2">{t({ ru: service.name_ru, en: service.name_en })}</h3>
                <p className="text-[16px] font-normal text-black text-left mb-2">{t({ ru: service.description_ru, en: service.description_en })}</p>
                <p className="text-[16px] font-normal text-black text-left mb-2">{t({ ru: service.duration_ru, en: service.duration_en })}</p>
                {service.examples_ru && (
                  <p className="text-[16px] font-normal text-black text-left mb-4">{t({ ru: service.examples_ru, en: service.examples_en })}</p>
                )}
              </div>
              <button onClick={openOrderModal} className="w-[150px] h-[35px] lg:h-[40px] bg-[#353535] rounded-[5px] text-white text-[16px] font-normal flex items-center justify-center hover:opacity-90 hover:underline transition mx-auto mt-auto">
                {t(translations.serviceBtnOrder)}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Цитата */}
      <div className="w-full my-10 lg:my-15 px-5 xl:px-[100px]">
        <blockquote className="text-left max-w-[1400px]">
          <p className="text-[20px] lg:text-[32px] font-bold text-black break-words whitespace-pre-wrap">
            {t({ ru: settings?.quote_text_ru, en: settings?.quote_text_en })}
          </p>
          <footer className="text-[16px] lg:text-[20px] font-normal text-black mt-2 lg:mt-4">
            — {t({ ru: settings?.quote_author_ru, en: settings?.quote_author_en })}
          </footer>
        </blockquote>
      </div>

      {/* Отзывы */}
      <section id="reviews" className="w-full py-5 lg:py-10">
        <div className="relative flex justify-start lg:justify-center mb-5 lg:mb-10">
          <h2 className="text-[20px] lg:text-[32px] font-light text-black px-5 lg:px-0">{t(translations.reviewsTitle)}</h2>
          <Link to="/reviews" className="absolute right-5 top-1/2 -translate-y-1/2 text-[14px] lg:text-[16px] font-bold italic text-black hover:underline whitespace-nowrap">
            {t(translations.reviewsMore)}
          </Link>
        </div>
        <div className="hidden lg:block">
          {(() => {
            const houseImages = ['/house1.png', '/house2.png', '/house3.png'];
            return (
              <div className="flex flex-col gap-10">
                {reviews.map((review, idx) => (
                  <div key={review.id} className="relative w-full">
                    <div className={`flex items-center ${idx % 2 === 0 ? 'justify-start' : 'justify-end'} gap-10`}>
                      {idx % 2 === 0 && (
                        <div className="w-[200px] h-[200px] flex-shrink-0 ml-[100px]">
                          <img src={getMediaUrl(houseImages[Math.min(idx, houseImages.length - 1)])} alt="" className="w-full h-full object-contain rounded-[5px]" />
                        </div>
                      )}
                      <div className={`relative w-full max-w-[990px] h-[240px] rounded-[5px] border border-black/25 flex items-center p-5 bg-transparent ${idx % 2 === 0 ? 'lg:ml-0' : 'lg:mr-0'}`}>
                        {review.photo && (
                          <div className="w-[350px] h-[200px] flex-shrink-0 mr-[30px]">
                            <img src={getMediaUrl(review.photo)} alt="Фото отзыва" className="w-full h-full object-contain rounded-[5px]" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-[16px] font-bold text-black mb-[10px]">{t({ ru: review.client_name_ru, en: review.client_name_en })}</h3>
                          {review.project_ru && (
                            <p className="text-[16px] italic text-black mb-[10px]">{t({ ru: review.project_ru, en: review.project_en })}</p>
                          )}
                          <p className="text-[16px] text-black leading-relaxed">{t({ ru: review.text_ru, en: review.text_en })}</p>
                        </div>
                        <div className="absolute top-5 right-5 flex gap-1">
                          {[1,2,3,4,5].map(star => (
                            <svg key={star} width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={star <= review.rating ? "black" : "none"} fillOpacity={star <= review.rating ? 0.5 : 0} stroke="black" strokeOpacity={star <= review.rating ? 0 : 0.5} strokeWidth="0.5" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {idx % 2 !== 0 && (
                        <div className="w-[200px] h-[200px] flex-shrink-0 mr-[100px]">
                          <img src={getMediaUrl(houseImages[Math.min(idx, houseImages.length - 1)])} alt="" className="w-full h-full object-contain rounded-[5px]" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        <div className="block lg:hidden px-5">
          <div className="flex flex-col gap-5">
            {reviews.map((review) => (
              <div key={review.id} className="w-full bg-white rounded-[5px] border border-black/25 p-5">
                <div className="flex gap-4">
                  {review.photo && <img src={getMediaUrl(review.photo)} alt="" className="w-[35%] h-auto max-[640px]:aspect-square max-[640px]:object-cover rounded-[5px]" />}
                  <div className={review.photo ? "flex-1 flex flex-col items-end" : "w-full flex flex-col items-end"}>
                    <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(star => (
                        <svg key={star} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={star <= review.rating ? "black" : "none"} fillOpacity={star <= review.rating ? 0.5 : 0} stroke="black" strokeOpacity={star <= review.rating ? 0 : 0.5} strokeWidth="0.5" />
                        </svg>
                      ))}
                    </div>
                    <h3 className="text-[16px] font-bold text-black text-right">{t({ ru: review.client_name_ru, en: review.client_name_en })}</h3>
                    {review.project_ru && <p className="text-[16px] italic text-black text-right mt-1">{t({ ru: review.project_ru, en: review.project_en })}</p>}
                  </div>
                </div>
                <p className="text-[16px] text-black leading-relaxed mt-4">{t({ ru: review.text_ru, en: review.text_en })}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Новости */}
      <section id="news" className="w-full py-5 lg:py-10">
        <div className="relative flex justify-start lg:justify-center mb-5 lg:mb-10">
          <h2 className="text-[20px] lg:text-[32px] font-light text-black px-5 lg:px-0">{t(translations.newsTitle)}</h2>
          <Link to="/news" className="absolute right-5 top-1/2 -translate-y-1/2 text-[14px] lg:text-[16px] font-bold italic text-black hover:underline whitespace-nowrap">
            {t(translations.newsMore)}
          </Link>
        </div>
        <div>
          {news.map((item, idx) => {
            const isImageLeft = idx % 2 === 0;
            return (
              <div key={item.id} className="w-full mb-[30px] last:mb-0">
                <div className="hidden md:block">
                  <div className={`flex flex-col ${isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10`}>
                    <div className="w-full md:w-1/2 flex-shrink-0">
                      <img src={getMediaUrl(item.image)} alt={t({ ru: item.title_ru, en: item.title_en })} className="w-full h-[400px] object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-start px-5">
                      <div className="w-full max-w-[600px] mx-auto">
                        <h3 className="text-[20px] font-bold text-black mb-5">{t({ ru: item.title_ru, en: item.title_en })}</h3>
                        <p className="text-[20px] italic text-black mb-5">{new Date(item.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-[20px] text-black mb-5">{t({ ru: item.content_ru, en: item.content_en })}</p>
                        <Link to={`/news/${item.id}`} className="text-[16px] font-bold italic text-black hover:underline inline-block focus:outline-none focus:ring-0">{t(translations.newsReadMore)}</Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="block md:hidden px-5">
                  <div className="flex flex-col">
                    <div className="mb-[10px]">
                      <h3 className="text-[16px] font-bold text-black mb-[10px]">{t({ ru: item.title_ru, en: item.title_en })}</h3>
                      <p className="text-[16px] italic text-black mb-[2px]">{new Date(item.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="text-[16px] text-black mb-[10px]">{t({ ru: item.content_ru, en: item.content_en })}</p>
                      <Link to={`/news/${item.id}`} className="text-[16px] font-bold italic text-black hover:underline inline-block focus:outline-none focus:ring-0">{t(translations.newsReadMore)}</Link>
                    </div>
                    <div className="w-full">
                      <img src={getMediaUrl(item.image)} alt={t({ ru: item.title_ru, en: item.title_en })} className="w-full h-[150px] object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Контакты / форма связи */}
      <section id="contacts" className="w-full">
        <div className="px-5 xl:px-[100px]">
          <div className="w-full rounded-[5px] border border-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] bg-[#F8F8F8] p-4 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 md:gap-10">
              <div className="md:w-1/3 flex items-center justify-center md:justify-start">
                <h2 className="text-[24px] md:text-[32px] lg:text-[40px] font-bold text-black text-center md:text-left break-words whitespace-normal">
                  {t(translations.formTitle)}
                </h2>
              </div>
              <div className="md:w-2/3">
                <OrderForm isModal={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-[20px] lg:h-[60px]"></div>

      {/* Модальное окно заказа */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowOrderModal(false)}>
          <div className="relative w-full max-w-[1321px] mx-4 bg-white rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-4 md:p-10" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowOrderModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl focus:outline-none focus:ring-0">×</button>
            <div className="flex flex-col md:flex-row gap-8 md:gap-10">
              <div className="md:w-1/3 flex items-center justify-center md:justify-start">
                <h2 className="text-[24px] md:text-[32px] lg:text-[40px] font-bold text-black text-center md:text-left break-words whitespace-normal">
                  {t(translations.formTitle)}
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
          <div className="relative bg-white rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] flex flex-col justify-center items-center text-center p-5 w-[300px] h-[200px] sm:w-[600px] sm:h-[400px]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl focus:outline-none focus:ring-0">×</button>
            <p className="text-[20px] sm:text-[32px] font-light text-black mb-3 sm:mb-5">{t(translations.modalTitle)}</p>
            <p className="text-[14px] sm:text-[20px] italic font-light text-black">{t(translations.modalText)}</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Home;