import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  getAboutSettings,
  getSocialLinks,
  getFooterSettings,
  getTeamMembers,
  getFAQ,
  sendRequest,
} from '../services/api';

const About = () => {
  const { lang, setLang } = useLanguage();
  const token = localStorage.getItem('access_token');

  const [aboutSettings, setAboutSettings] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [footerSettings, setFooterSettings] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [faqItems, setFaqItems] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [openFaqs, setOpenFaqs] = useState([]);

  const translations = {
    header: { ru: 'Заказать проект', en: 'Order a project' },
    menuAbout: { ru: 'О бюро', en: 'About' },
    menuInteriors: { ru: 'Интерьеры', en: 'Interiors' },
    menuServices: { ru: 'Услуги', en: 'Services' },
    menuNews: { ru: 'Новости', en: 'News' },
    menuReviews: { ru: 'Отзывы', en: 'Reviews' },
    menuContacts: { ru: 'Контакты', en: 'Contacts' },
    menuFaq: { ru: 'FAQ', en: 'FAQ' },
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
    pageTitle: { ru: 'О БЮРО', en: 'ABOUT' },
    errorNameRequired: { ru: 'Введите имя', en: 'Name is required' },
    errorPhoneInvalid: { ru: 'Телефон должен содержать только цифры', en: 'Phone number must contain only digits' },
    errorEmailInvalid: { ru: 'Введите корректный email', en: 'Enter a valid email' },
    errorQuestionRequired: { ru: 'Введите вопрос', en: 'Question is required' },
    errorConsentRequired: { ru: 'Подтвердите согласие с политикой конфиденциальности', en: 'You must agree to the privacy policy' }
  };

  const t = (obj) => obj?.[lang] || obj?.ru || '';
  const tSimple = (obj) => obj?.[lang] || obj?.ru || '';

  useEffect(() => {
    getAboutSettings().then(res => res.data?.[0] && setAboutSettings(res.data[0]));
    getSocialLinks().then(res => setSocialLinks(res.data || []));
    getFooterSettings().then(res => res.data?.[0] && setFooterSettings(res.data[0]));
    getTeamMembers().then(res => setTeamMembers(res.data || []));
    getFAQ().then(res => setFaqItems(res.data || []));
  }, []);

  // Форма заказа (такая же, как в Contacts)
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
            className="w-[277px] h-[50px] bg-[#353535] rounded-[5px] text-white text-[24px] font-normal hover:underline transition disabled:opacity-50 focus:outline-none focus:ring-0"
          >
            {localStatus === 'sending' ? tSimple(translations.formSending) : tSimple(translations.formSubmit)}
          </button>
        </div>
      </form>
    );
  };

  const openOrderModal = () => setShowOrderModal(true);

  const toggleFaq = (index) => {
    if (openFaqs.includes(index)) {
      setOpenFaqs(openFaqs.filter(i => i !== index));
    } else {
      setOpenFaqs([...openFaqs, index]);
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

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const scrollToElement = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };
      if (!scrollToElement()) {
        let attempts = 0;
        const interval = setInterval(() => {
          if (scrollToElement() || attempts >= 10) clearInterval(interval);
          attempts++;
        }, 100);
      }
    }
  }, [location]);

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
      {/* Заголовок страницы */}
      <div className="px-5 xl:px-[100px]">
        <h1 className="text-[20px] lg:text-[32px] font-light text-black text-left mt-[20px] lg:mt-[60px] mb-[20px] lg:mb-[40px]">
          {tSimple(translations.pageTitle)}
        </h1>
      </div>

      {/* Текст "О бюро" (page_text) */}
      {aboutSettings?.page_text_ru && (
        <div className="px-5 xl:px-[100px] mb-[20px] lg:mb-[40px]">
          <div className="text-[16px] lg:text-[20px] font-normal text-black whitespace-pre-wrap">
            {t({ ru: aboutSettings.page_text_ru, en: aboutSettings.page_text_en })}
          </div>
        </div>
      )}

      {/* Блок руководителя */}
      <div className="px-5 xl:px-[100px] mb-[40px]">
        <div className="flex flex-row gap-4 items-start">
          <div className="flex-shrink-0">
            <img
              src={aboutSettings?.image || '/team/fedor.jpg'}
              alt="Руководитель"
              className="w-[105px] h-[125px] lg:w-[220px] lg:h-[240px] object-cover rounded-[5px]"
            />
          </div>
          <div className="flex-1 flex flex-col gap-[5px]">
            <p className="text-[16px] lg:text-[20px] font-bold text-black leading-none">
              {t({ ru: aboutSettings?.name_ru, en: aboutSettings?.name_en }) || 'ФЕДОР РАЩЕВСКИЙ'}
            </p>
            <p className="text-[16px] lg:text-[20px] font-normal text-black">
              {t({ ru: aboutSettings?.position_ru, en: aboutSettings?.position_en }) || 'Руководитель бюро'}
            </p>
            <p className="text-[16px] lg:text-[20px] italic text-black">
              {t({ ru: aboutSettings?.quote_ru, en: aboutSettings?.quote_en }) || '— Создаем пространства, куда всегда хочется возвращаться.'}
            </p>
            <div className="mt-[10px] whitespace-pre-wrap">
              <p className="text-[16px] lg:text-[20px] font-normal text-black">
                {t({ ru: aboutSettings?.text_ru, en: aboutSettings?.text_en }) ||
                  'Минимализм. Изысканность. Искусство.\nПроектируем дома, апартаменты и отели для тех, кто ценит интеллект в деталях.\nСовмещаем чистую геометрию с теплом эксклюзивности.\nСоздаём пространства, куда всегда хочется возвращаться.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Другие сотрудники – на <640px 1 колонка, 640-1280px 2 колонки, ≥1280px 3 колонки */}
      {teamMembers.length > 0 && (
        <div className="px-5 xl:px-[100px] mb-[40px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 gap-y-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex flex-row gap-4 items-start">
                <img
                  src={member.image}
                  alt={t({ ru: member.name_ru, en: member.name_en })}
                  className="w-[105px] h-[125px] lg:w-[220px] lg:h-[240px] object-cover rounded-[5px] flex-shrink-0"
                />
                <div className="flex flex-col gap-[5px]">
                  <h3 className="text-[16px] lg:text-[20px] font-bold text-black leading-none">
                    {t({ ru: member.name_ru, en: member.name_en })}
                  </h3>
                  <p className="text-[16px] lg:text-[20px] font-normal text-black break-words">
                    {t({ ru: member.position_ru, en: member.position_en })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ – расстояние между вопросами 10px на мобилке, 40px на ПК */}
      {faqItems.length > 0 && (
        <div id="faq" className="px-5 xl:px-[100px] mt-[20px] lg:mt-[60px]">
          <h2 className="text-[20px] lg:text-[32px] font-light text-black text-left mb-[20px] lg:mb-[40px]">
            {tSimple(translations.menuFaq)}
          </h2>
          <div className="flex flex-col gap-[10px] lg:gap-10">
            {faqItems.map((item, idx) => (
              <div key={item.id} className="rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className={`w-full min-h-[50px] py-2 flex items-center justify-between px-5 text-left text-[14px] lg:text-[18px] font-bold transition-colors focus:outline-none focus:ring-0 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'
                  } hover:bg-gray-100`}
                >
                  <span className="text-black pr-4 break-words">{t({ ru: item.question_ru, en: item.question_en })}</span>
                  <svg
                    className={`w-6 h-6 text-[#858585] transform transition-transform duration-200 flex-shrink-0 ${openFaqs.includes(idx) ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaqs.includes(idx) && (
                  <div className="px-5 py-4 bg-white border-t border-gray-100 text-black text-[14px] lg:text-[16px] leading-relaxed whitespace-pre-wrap">
                    {t({ ru: item.answer_ru, en: item.answer_en })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Форма связи – полностью как в Contacts, заголовок с переносом */}
      <div className="px-5 xl:px-[100px] mt-[20px] lg:mt-[40px] mb-[20px] lg:mb-[40px]">
        <div className="w-full rounded-[5px] border border-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] bg-[#F8F8F8] p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10">
            <div className="md:w-1/3 flex items-center justify-center md:justify-start">
              <h2 className="text-[24px] md:text-[32px] lg:text-[40px] font-bold text-black text-center md:text-left break-words whitespace-normal">
                {tSimple(translations.formTitle)}
              </h2>
            </div>
            <div className="md:w-2/3">
              <OrderForm isModal={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно заказа */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowOrderModal(false)}>
          <div className="relative w-full max-w-[1321px] mx-4 bg-white rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-8 md:p-10" onClick={(e) => e.stopPropagation()}>
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
                       w-[350px] h-[250px] sm:w-[600px] sm:h-[400px]"
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

export default About;