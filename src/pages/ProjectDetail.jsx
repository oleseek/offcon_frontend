import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { getProjects, getSocialLinks, getFooterSettings, sendRequest } from '../services/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const token = localStorage.getItem('access_token');

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socialLinks, setSocialLinks] = useState([]);
  const [footerSettings, setFooterSettings] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [imageHeight, setImageHeight] = useState(200);

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
    bannerBtnOrder: { ru: 'Заказать проект', en: 'Order a project' },
    bannerBtnInteriors: { ru: 'Интерьеры', en: 'Interiors' },
    learnMore: { ru: 'Узнать больше', en: 'Learn more' },
    hideText: { ru: 'Скрыть текст', en: 'Hide text' },
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
    const fetchProject = async () => {
      try {
        const res = await getProjects();
        const found = res.data?.find(p => p.id === parseInt(id));
        if (found) setProject(found);
        else navigate('/projects');
      } catch (err) {
        console.error(err);
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, navigate]);

  useEffect(() => {
    getSocialLinks().then(res => setSocialLinks(res.data || [])).catch(() => {});
    getFooterSettings().then(res => res.data?.[0] && setFooterSettings(res.data[0])).catch(() => {});
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowOrderModal(false);
        setShowModal(false);
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Динамическая высота для image2 и image3 на экранах 500-1024px
  useEffect(() => {
    const updateHeight = () => {
      const width = window.innerWidth;
      if (width <= 500) {
        setImageHeight(200);
      } else if (width >= 1024) {
        setImageHeight(350);
      } else {
        const ratio = (width - 500) / (1024 - 500);
        const height = 200 + ratio * 150;
        setImageHeight(height);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const openOrderModal = () => setShowOrderModal(true);
  const openLightbox = (img) => setLightboxImage(img);
  const closeLightbox = () => setLightboxImage(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-black text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!project) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `/${imagePath}`;
  };

  const gallery = project.gallery_images
    ? project.gallery_images.map(img => img.image)
    : (project.gallery || []);

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
      {/* Заголовок */}
      <div className="px-5 xl:px-[100px]">
        <h1 className="text-[20px] lg:text-[32px] font-light text-black text-left mt-[20px] lg:mt-[60px] mb-[20px] lg:mb-[40px]">
          {tSimple(translations.pageTitle)}
        </h1>
      </div>

      {/* Баннер – без закруглений */}
      <div className="relative w-full h-[150px] lg:h-[330px] overflow-hidden">
        <img
          src={getImageUrl(project.image)}
          alt={t({ ru: project.title_ru, en: project.title_en })}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-[20px] lg:text-[32px] font-bold text-center px-4">
            {t({ ru: project.title_ru, en: project.title_en })}
          </span>
        </div>
      </div>

      {/* Кнопки под баннером */}
      <div className="flex justify-center gap-5 mt-5 px-5 lg:px-0">
        <button
          onClick={openOrderModal}
          className="w-full lg:w-[277px] h-[35px] lg:h-[50px] bg-transparent border border-[#353535] rounded-[5px] text-[#353535] text-[16px] lg:text-[24px] transition hover:shadow-md hover:underline focus:outline-none focus:ring-0"
        >
          {tSimple(translations.bannerBtnOrder)}
        </button>
        <Link
          to="/projects"
          className="w-full lg:w-[277px] h-[35px] lg:h-[50px] bg-transparent border border-[#353535] rounded-[5px] text-[#353535] text-[16px] lg:text-[24px] transition hover:shadow-md hover:underline flex items-center justify-center focus:outline-none focus:ring-0"
        >
          {tSimple(translations.bannerBtnInteriors)}
        </Link>
      </div>

      {/* Блок с участниками и image2 – с отступами и динамической высотой */}
      <div className="mt-[20px] lg:mt-[60px]">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 px-5 lg:px-0">
          <div className="flex-1 lg:ml-[100px]">
            {project.participants_ru && (
              <div className="text-[16px] lg:text-[20px] font-normal text-black whitespace-pre-wrap">
                {t({ ru: project.participants_ru, en: project.participants_en })}
              </div>
            )}
          </div>
          {project.image2 && (
            <div className="w-full lg:w-[730px] flex-shrink-0 lg:mr-[100px]">
              <img
                src={getImageUrl(project.image2)}
                alt=""
                style={{ height: `${imageHeight}px` }}
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Блок с деталями и image3 – аналогично */}
      <div className="mt-[20px] lg:mt-[40px]">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 px-5 lg:px-0">
          {project.image3 && (
            <div className="w-full lg:w-[485px] flex-shrink-0 lg:ml-[100px] order-first lg:order-none">
              <img
                src={getImageUrl(project.image3)}
                alt=""
                style={{ height: `${imageHeight}px` }}
                className="w-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 lg:mr-[100px]">
            {project.details_ru && (
              <div className="text-[16px] lg:text-[20px] font-normal text-black whitespace-pre-wrap">
                {t({ ru: project.details_ru, en: project.details_en })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Галерея – на всю ширину, без отступов */}
      {gallery.length > 0 && (
        <div className="w-full mt-[20px] lg:mt-[60px]">
          {/* Десктопная версия */}
          <div className="hidden lg:block">
            {(() => {
              const rows = [];
              for (let i = 0; i < gallery.length; i += 3) rows.push(gallery.slice(i, i + 3));
              return rows.map((row, rowIdx) => {
                let leftW, middleW, rightW;
                if (rowIdx === 0) { leftW = '30.2083%'; middleW = '38.1944%'; rightW = '30.2083%'; }
                else if (rowIdx === 1) { leftW = '36.1111%'; middleW = '26.3889%'; rightW = '36.1111%'; }
                else { leftW = '30.2083%'; middleW = '38.1944%'; rightW = '30.2083%'; }
                const items = [...row];
                while (items.length < 3) items.push(null);
                return (
                  <div key={rowIdx} className="flex justify-start mb-[10px]" style={{ gap: '10px' }}>
                    {items[0] && (
                      <div className="group relative cursor-pointer overflow-hidden" style={{ width: leftW }} onClick={() => openLightbox(items[0])}>
                        <img src={getImageUrl(items[0])} alt="Фото галереи" className="w-full h-[220px] object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    {items[1] && (
                      <div className="group relative cursor-pointer overflow-hidden" style={{ width: middleW }} onClick={() => openLightbox(items[1])}>
                        <img src={getImageUrl(items[1])} alt="Фото галереи" className="w-full h-[220px] object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    {items[2] && (
                      <div className="group relative cursor-pointer overflow-hidden" style={{ width: rightW }} onClick={() => openLightbox(items[2])}>
                        <img src={getImageUrl(items[2])} alt="Фото галереи" className="w-full h-[220px] object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          {/* Мобильная версия – 2 колонки, чередование, без скруглений */}
          <div className="block lg:hidden">
            <div className="flex flex-col gap-2">
              {(() => {
                const pairs = [];
                for (let i = 0; i < gallery.length; i += 2) {
                  pairs.push(gallery.slice(i, i + 2));
                }
                return pairs.map((pair, pairIdx) => {
                  const isEvenRow = pairIdx % 2 === 0;
                  const hasOneItem = pair.length === 1;
                  return (
                    <div key={pairIdx} className="flex gap-2">
                      <div
                        className={`group relative cursor-pointer overflow-hidden ${
                          hasOneItem ? 'w-full' : isEvenRow ? 'flex-[2]' : 'flex-[1]'
                        }`}
                        onClick={() => openLightbox(pair[0])}
                      >
                        <img
                          src={getImageUrl(pair[0])}
                          alt="Фото галереи"
                          className="w-full h-[clamp(110px,15vw,220px)] object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      {!hasOneItem && (
                        <div
                          className={`group relative cursor-pointer overflow-hidden ${
                            isEvenRow ? 'flex-[1]' : 'flex-[2]'
                          }`}
                          onClick={() => openLightbox(pair[1])}
                        >
                          <img
                            src={getImageUrl(pair[1])}
                            alt="Фото галереи"
                            className="w-full h-[clamp(110px,15vw,220px)] object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Кнопка "Узнать больше"/"Скрыть текст" */}
      {project.full_description_ru && (
        <div className="flex justify-center mt-[20px] lg:mt-[40px] px-5 lg:px-0">
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="w-full lg:w-[277px] h-[35px] lg:h-[50px] bg-transparent border border-[#353535] rounded-[5px] text-[#353535] text-[16px] lg:text-[24px] transition hover:shadow-md hover:underline focus:outline-none focus:ring-0"
          >
            {showFullDescription ? tSimple(translations.hideText) : tSimple(translations.learnMore)}
          </button>
        </div>
      )}
      {showFullDescription && project.full_description_ru && (
        <div className="px-5 xl:px-[100px] mt-[20px] lg:mt-[40px] text-[16px] lg:text-[20px] font-normal text-black whitespace-pre-wrap">
          {t({ ru: project.full_description_ru, en: project.full_description_en })}
        </div>
      )}

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

      {/* Лайтбокс */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={closeLightbox}>
          <div className="relative max-w-[1200px] max-h-[600px] w-full h-full flex items-center justify-center p-4">
            <img src={getImageUrl(lightboxImage)} alt="" className="max-w-full max-h-full object-contain" />
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-4xl opacity-0 hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-0"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProjectDetail;