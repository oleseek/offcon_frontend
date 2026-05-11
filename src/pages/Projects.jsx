import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  getProjects,
  getSocialLinks,
  getFooterSettings,
  sendRequest,
} from '../services/api';

const Projects = () => {
  const { lang, setLang } = useLanguage();
  const token = localStorage.getItem('access_token');

  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [footerSettings, setFooterSettings] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [openFilter, setOpenFilter] = useState(null);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(1000);
  const [globalAreaMin, setGlobalAreaMin] = useState(0);
  const [globalAreaMax, setGlobalAreaMax] = useState(1000);

  const projectTypeMapping = [
    { value: 'apartment', label: { ru: 'квартира', en: 'apartment' } },
    { value: 'house', label: { ru: 'жильё', en: 'house' } },
    { value: 'hotel', label: { ru: 'отель', en: 'hotel' } },
    { value: 'resort', label: { ru: 'база отдыха', en: 'resort' } },
  ];
  const styleMapping = [
    { value: 'scandi', label: { ru: 'сканди', en: 'scandi' } },
    { value: 'minimalism', label: { ru: 'минимализм', en: 'minimalism' } },
    { value: 'loft', label: { ru: 'лофт', en: 'loft' } },
    { value: 'classic', label: { ru: 'классика', en: 'classic' } },
  ];

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
    pageTitle: { ru: 'ИНТЕРЬЕРЫ', en: 'INTERIORS' },
    filterSpace: { ru: 'Тип пространства', en: 'Space type' },
    filterStyle: { ru: 'Стиль', en: 'Style' },
    filterArea: { ru: 'Площадь, м²', en: 'Area, m²' },
    from: { ru: 'от', en: 'from' },
    to: { ru: 'до', en: 'to' },
    footerPrivacy: { ru: 'Политика конфиденциальности', en: 'Privacy Policy' },
    mobileOrderBtn: { ru: 'Заказать проект', en: 'Order project' },
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
    errorNameRequired: { ru: 'Введите имя', en: 'Name is required' },
    errorPhoneInvalid: { ru: 'Только цифры', en: 'Only digits' },
    errorEmailInvalid: { ru: 'Введите корректный email', en: 'Enter a valid email' },
    errorQuestionRequired: { ru: 'Введите вопрос', en: 'Question is required' },
    errorConsentRequired: { ru: 'Подтвердите согласие', en: 'You must agree' }
  };

  const t = (obj) => obj?.[lang] || obj?.ru || '';
  const tSimple = (obj) => obj?.[lang] || obj?.ru || '';

  useEffect(() => {
    getProjects().then(res => {
      const data = res.data || [];
      setAllProjects(data);
      setProjects(data);
      const areas = data.map(p => p.area).filter(a => typeof a === 'number' && !isNaN(a));
      if (areas.length) {
        const minArea = Math.min(...areas);
        const maxArea = Math.max(...areas);
        setGlobalAreaMin(minArea);
        setGlobalAreaMax(maxArea);
        setAreaMin(minArea);
        setAreaMax(maxArea);
      }
    }).catch(() => {});
    getSocialLinks().then(res => setSocialLinks(res.data || [])).catch(() => {});
    getFooterSettings().then(res => res.data?.[0] && setFooterSettings(res.data[0])).catch(() => {});
  }, []);

  useEffect(() => {
    let filtered = [...allProjects];
    if (selectedProjectTypes.length > 0) {
      filtered = filtered.filter(p => selectedProjectTypes.includes(p.project_type));
    }
    if (selectedStyles.length > 0) {
      filtered = filtered.filter(p => selectedStyles.includes(p.style));
    }
    filtered = filtered.filter(p => {
      const area = p.area;
      return area >= areaMin && area <= areaMax;
    });
    setProjects(filtered);
  }, [selectedProjectTypes, selectedStyles, areaMin, areaMax, allProjects]);

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

  const toggleProjectType = (value) => {
    setSelectedProjectTypes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleStyle = (value) => {
    setSelectedStyles(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleAreaMinChange = (e) => {
    let val = Number(e.target.value);
    if (isNaN(val)) val = globalAreaMin;
    val = Math.min(val, areaMax - 1);
    val = Math.max(globalAreaMin, val);
    setAreaMin(val);
  };

  const handleAreaMaxChange = (e) => {
    let val = Number(e.target.value);
    if (isNaN(val)) val = globalAreaMax;
    val = Math.max(val, areaMin + 1);
    val = Math.min(globalAreaMax, val);
    setAreaMax(val);
  };

  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `/${imagePath}`;
  };

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
      </div>

      <div className="px-5 xl:px-[100px] mb-[40px]">
        <div className="flex flex-row flex-nowrap gap-2 justify-between">
          <div className="relative w-[40%] lg:w-[38%]">
            <button
              onClick={() => toggleFilter('space')}
              className="w-full h-[50px] bg-[#353535] rounded-[5px] text-white text-[14px] lg:text-[20px] font-medium hover:opacity-90 transition flex items-center justify-between px-3 lg:px-5 focus:outline-none focus:ring-0"
            >
              <span className="break-words">{tSimple(translations.filterSpace)}</span>
              <svg className={`w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 ml-1 transform transition-transform ${openFilter === 'space' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFilter === 'space' && (
              <div className="absolute top-full left-0 w-full -mt-0.5 p-3 bg-[#424242] rounded-b-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] z-20">
                {projectTypeMapping.map(type => (
                  <label key={type.value} className="flex items-center gap-2 cursor-pointer mb-2 last:mb-0">
                    <input type="checkbox" checked={selectedProjectTypes.includes(type.value)} onChange={() => toggleProjectType(type.value)} className="w-5 h-5 accent-[#808184]" />
                    <span className="text-[14px] lg:text-[18px] text-[#FAFAFA]">{t(type.label)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-[28%] lg:w-[28%]">
            <button
              onClick={() => toggleFilter('style')}
              className="w-full h-[50px] bg-[#353535] rounded-[5px] text-white text-[14px] lg:text-[20px] font-medium hover:opacity-90 transition flex items-center justify-between px-3 lg:px-5 focus:outline-none focus:ring-0"
            >
              <span className="break-words">{tSimple(translations.filterStyle)}</span>
              <svg className={`w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 ml-1 transform transition-transform ${openFilter === 'style' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFilter === 'style' && (
              <div className="absolute top-full left-0 w-full -mt-0.5 p-3 bg-[#424242] rounded-b-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] z-20">
                {styleMapping.map(style => (
                  <label key={style.value} className="flex items-center gap-2 cursor-pointer mb-2 last:mb-0">
                    <input type="checkbox" checked={selectedStyles.includes(style.value)} onChange={() => toggleStyle(style.value)} className="w-5 h-5 accent-[#808184]" />
                    <span className="text-[14px] lg:text-[18px] text-[#FAFAFA]">{t(style.label)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-[32%] lg:w-[34%]">
            <button
              onClick={() => toggleFilter('area')}
              className="w-full h-[50px] bg-[#353535] rounded-[5px] text-white text-[14px] lg:text-[20px] font-medium hover:opacity-90 transition flex items-center justify-between px-3 lg:px-5 focus:outline-none focus:ring-0"
            >
              <span className="break-words">{tSimple(translations.filterArea)}</span>
              <svg className={`w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 ml-1 transform transition-transform ${openFilter === 'area' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFilter === 'area' && (
              <div className="absolute top-full left-0 w-full -mt-0.5 p-3 bg-[#424242] rounded-b-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] z-20">
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm text-[#FAFAFA] mb-1">{tSimple(translations.from)}</label>
                    <input type="number" value={areaMin} onChange={handleAreaMinChange} className="w-full h-10 px-2 border border-white/20 rounded-[5px] bg-[#424242] text-[#FAFAFA] text-[14px] lg:text-[16px] focus:outline-none focus:ring-1 focus:ring-white/50" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-[#FAFAFA] mb-1">{tSimple(translations.to)}</label>
                    <input type="number" value={areaMax} onChange={handleAreaMaxChange} className="w-full h-10 px-2 border border-white/20 rounded-[5px] bg-[#424242] text-[#FAFAFA] text-[14px] lg:text-[16px] focus:outline-none focus:ring-1 focus:ring-white/50" />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm text-[#FAFAFA] mb-1">Мин. площадь (слайдер)</label>
                  <input type="range" min={globalAreaMin} max={globalAreaMax} value={areaMin} onChange={(e) => setAreaMin(Math.min(Number(e.target.value), areaMax - 1))} className="w-full accent-[#FAFAFA]" />
                </div>
                <div>
                  <label className="block text-sm text-[#FAFAFA] mb-1">Макс. площадь (слайдер)</label>
                  <input type="range" min={globalAreaMin} max={globalAreaMax} value={areaMax} onChange={(e) => setAreaMax(Math.max(Number(e.target.value), areaMin + 1))} className="w-full accent-[#FAFAFA]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 xl:px-[100px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 lg:gap-y-10">
          {projects.map(project => (
            <Link to={`/projects/${project.id}`} key={project.id} className="flex flex-col focus:outline-none focus:ring-0">
              <div className="relative group overflow-hidden rounded-[5px]">
                <img src={getImageUrl(project.image)} alt={t({ ru: project.title_ru, en: project.title_en })} className="w-full h-[250px] object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-5 right-5 w-2/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-right">
                  <h4 className="text-[16px] lg:text-[20px] font-bold text-white mb-1">
                    {t({ ru: project.title_ru, en: project.title_en })}
                  </h4>
                  <p className="text-[12px] lg:text-[14px] font-normal text-white whitespace-pre-wrap">
                    {t({ ru: project.description_ru, en: project.description_en })}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-[10px]">
                <h3 className="text-[16px] lg:text-[20px] font-bold text-black">
                  {t({ ru: project.title_ru, en: project.title_en })}
                </h3>
                <span className="text-[16px] lg:text-[20px] font-bold text-[#808080]">{project.year}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="h-[20px] lg:h-[60px]"></div>

      {/* Модальное окно заказа (адаптированное) */}
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

      {/* Модальное окно благодарности (адаптированное) */}
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

export default Projects;