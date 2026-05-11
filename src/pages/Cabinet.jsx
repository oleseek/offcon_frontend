import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import {
  getProfile,
  getUserRequests,
  setAuthToken,
  getSocialLinks,
  getFooterSettings,
  sendRequest,
  deleteRequest,
} from '../services/api';

const Cabinet = () => {
  const { lang, setLang } = useLanguage();
  const token = localStorage.getItem('access_token');

  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socialLinks, setSocialLinks] = useState([]);
  const [footerSettings, setFooterSettings] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewPhoto, setReviewPhoto] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Типы и стили для отображения
  const projectTypes = {
    apartment: { ru: 'Квартира', en: 'Apartment' },
    house: { ru: 'Дом', en: 'House' },
    hotel: { ru: 'Отель', en: 'Hotel' },
    resort: { ru: 'База отдыха', en: 'Resort' },
  };
  const styleTypes = {
    scandi: { ru: 'Сканди', en: 'Scandi' },
    minimalism: { ru: 'Минимализм', en: 'Minimalism' },
    loft: { ru: 'Лофт', en: 'Loft' },
    classic: { ru: 'Классика', en: 'Classic' },
  };
  const statusList = [
    { value: 'sent', label: { ru: 'Отправлен запрос', en: 'Request sent' }, progress: 0 },
    { value: 'discussed', label: { ru: 'Обсудили проект', en: 'Project discussed' }, progress: 25 },
    { value: 'tz', label: { ru: 'Сформировано ТЗ', en: 'TOR formed' }, progress: 50 },
    { value: 'in_progress', label: { ru: 'Проект в работе', en: 'Project in progress' }, progress: 75 },
    { value: 'ready', label: { ru: 'Проект готов', en: 'Project ready' }, progress: 100 },
  ];

  const t = (obj) => obj?.[lang] || obj?.ru || '';
  const tStatus = (statusValue) => {
    const s = statusList.find(s => s.value === statusValue);
    return s ? t(s.label) : statusValue;
  };

  // Общие переводы для хедера/футера (добавлены menuHome, cabinet, login)
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
    errorNameRequired: { ru: 'Введите имя', en: 'Name is required' },
    errorPhoneInvalid: { ru: 'Телефон должен содержать только цифры', en: 'Phone number must contain only digits' },
    errorEmailInvalid: { ru: 'Введите корректный email', en: 'Enter a valid email' },
    errorQuestionRequired: { ru: 'Введите вопрос', en: 'Question is required' },
    errorConsentRequired: { ru: 'Подтвердите согласие с политикой конфиденциальности', en: 'You must agree to the privacy policy' }
  };
  const tSimple = (obj) => obj?.[lang] || obj?.ru || '';

  // Адаптированная форма заказа (как в About/Contacts)
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

  const openReviewModal = (reqId) => {
    setCurrentRequestId(reqId);
    setReviewText('');
    setReviewRating(5);
    setReviewPhoto(null);
    setReviewModalOpen(true);
  };

  const submitReview = async () => {
    if (!reviewText.trim()) {
      alert(t({ ru: 'Напишите текст отзыва', en: 'Please write a review' }));
      return;
    }
    setReviewSubmitting(true);
    const formData = new FormData();
    formData.append('text_ru', reviewText);
    formData.append('text_en', reviewText);
    formData.append('rating', reviewRating);
    formData.append('request_id', currentRequestId);
    if (reviewPhoto) formData.append('photo', reviewPhoto);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/feedback/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      alert(t({ ru: 'Спасибо за отзыв!', en: 'Thank you for your review!' }));
      setReviewModalOpen(false);
      setRequests(prev => prev.map(req =>
        req.id === currentRequestId ? { ...req, review_submitted: true } : req
      ));
    } catch (err) {
      alert(t({ ru: 'Ошибка при отправке отзыва', en: 'Failed to submit review' }));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t({ ru: 'Удалить эту заявку?', en: 'Delete this request?' }))) return;
    setDeletingId(id);
    try {
      await deleteRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(t({ ru: 'Ошибка при удалении', en: 'Delete failed' }));
    } finally {
      setDeletingId(null);
    }
  };

  const openOrderModal = () => setShowOrderModal(true);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowOrderModal(false);
        setShowModal(false);
        setReviewModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await getProfile();
        setProfile(profileRes.data);
        const requestsRes = await getUserRequests();
        setRequests(requestsRes.data);
        const socialRes = await getSocialLinks();
        setSocialLinks(socialRes.data || []);
        const footerRes = await getFooterSettings();
        setFooterSettings(footerRes.data?.[0] || null);
      } catch (error) {
        if (error.response?.status === 401) window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    window.location.href = '/';
  };

  if (loading) return <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">Загрузка...</div>;

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
        {/* Заголовок и кнопка выхода */}
        <div className="flex justify-between items-center mb-5 lg:mb-10 mt-[20px] lg:mt-[60px]">
          <h1 className="text-[20px] lg:text-[32px] font-light text-black">
            {t({ ru: 'ЛИЧНЫЙ КАБИНЕТ', en: 'PERSONAL ACCOUNT' })}
          </h1>
          <button onClick={handleLogout} className="text-[16px] lg:text-[20px] font-light text-black hover:underline focus:outline-none focus:ring-0">
            {t({ ru: 'Выйти', en: 'Logout' })}
          </button>
        </div>

        {/* Информация о пользователе */}
        <div className="mb-5 lg:mb-10">
          <p className="text-[16px] lg:text-[20px] font-bold text-black mb-2 lg:mb-5">
            {t({ ru: 'Имя:', en: 'Name:' })} <span className="font-normal">{profile?.name}</span>
          </p>
          <p className="text-[16px] lg:text-[20px] font-bold text-black">
            Email: <span className="font-normal">{profile?.email}</span>
          </p>
        </div>

        {/* Заголовок Мои проекты */}
        <h2 className="text-[16px] lg:text-[20px] font-bold text-black mb-5">
          {t({ ru: 'Мои проекты', en: 'My projects' })}
        </h2>

        {/* Контейнер с карточками заявок */}
        <div className="space-y-5 lg:space-y-6">
          {requests.length === 0 && (
            <p className="text-gray-500 text-[16px]">
              {t({ ru: 'У вас пока нет заявок. Оставьте заявку на сайте, и мы свяжемся с вами.', en: 'You have no requests yet. Leave a request on the website and we will contact you.' })}
            </p>
          )}

          {requests.map((req) => {
            const hasDetails = req.project_type || req.style || req.area;
            const isReady = req.status === 'ready';
            const canReview = isReady && !req.review_submitted;
            return (
              <div key={req.id} className="bg-white p-5 lg:p-6 rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-gray-500 text-[14px] lg:text-[16px]">{new Date(req.created_at).toLocaleDateString()}</p>
                  <button
                    onClick={() => handleDelete(req.id)}
                    disabled={deletingId === req.id}
                    className="text-red-500 hover:text-red-700 hover:underline text-[14px] lg:text-[16px] disabled:opacity-50 focus:outline-none focus:ring-0"
                  >
                    {deletingId === req.id ? t({ ru: 'Удаление...', en: 'Deleting...' }) : t({ ru: 'Удалить', en: 'Delete' })}
                  </button>
                </div>

                <p className="text-[16px] lg:text-[20px] font-bold text-black mb-4">
                  {t({ ru: 'Вопрос:', en: 'Question:' })} <span className="font-normal">{req.question || '—'}</span>
                </p>

                {hasDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-[14px] lg:text-[16px] font-bold text-gray-700 mb-1">{t({ ru: 'Тип пространства', en: 'Space type' })}</div>
                        <div className="text-[14px] lg:text-[16px] text-black">{t(projectTypes[req.project_type] || {}) || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[14px] lg:text-[16px] font-bold text-gray-700 mb-1">{t({ ru: 'Стиль', en: 'Style' })}</div>
                        <div className="text-[14px] lg:text-[16px] text-black">{t(styleTypes[req.style] || {}) || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[14px] lg:text-[16px] font-bold text-gray-700 mb-1">{t({ ru: 'Площадь, м²', en: 'Area, m²' })}</div>
                        <div className="text-[14px] lg:text-[16px] text-black">{req.area || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[14px] lg:text-[16px] font-bold text-gray-700 mb-1">{t({ ru: 'Статус проекта', en: 'Project status' })}</div>
                        <div className="text-[14px] lg:text-[16px] text-black">{tStatus(req.status)}</div>
                      </div>
                    </div>

                    {/* Прогресс-бар */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[14px] lg:text-[16px] text-gray-600 mb-1">
                        <span>{t({ ru: 'Прогресс проекта', en: 'Project progress' })}</span>
                        <span>{req.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-[#353535] h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${req.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Этапы */}
                    <div className="grid grid-cols-5 gap-1 text-center mt-3">
                      {statusList.map((stage) => {
                        const isActive = req.progress >= stage.progress;
                        return (
                          <div key={stage.value} className="text-xs">
                            <div className={`w-2 h-2 mx-auto rounded-full mb-1 ${isActive ? 'bg-[#353535]' : 'bg-gray-300'}`}></div>
                            <span className={`text-[10px] ${isActive ? 'text-[#353535] font-medium' : 'text-gray-400'}`}>
                              {t(stage.label)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Кнопка отзыва */}
                    {canReview && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => openReviewModal(req.id)}
                          className="w-full max-w-[277px] h-[35px] lg:h-[50px] bg-transparent border border-[#353535] rounded-[5px] text-[#353535] text-[16px] lg:text-[24px] transition hover:shadow-md hover:underline focus:outline-none focus:ring-0"
                        >
                          {t({ ru: 'Оставить отзыв', en: 'Leave a review' })}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
                  {t({ ru: 'Свяжитесь с нами', en: 'Contact us' })}
                </h2>
              </div>
              <div className="md:w-2/3">
                <OrderForm isModal={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка благодарности (адаптированная) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div
            className="relative bg-white rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] flex flex-col justify-center items-center text-center p-5
                       w-[300px] h-[200px] sm:w-[600px] sm:h-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl focus:outline-none focus:ring-0">×</button>
            <p className="text-[20px] sm:text-[32px] font-light text-black mb-3 sm:mb-5">
              {t({ ru: 'Спасибо за оставленную заявку!', en: 'Thank you for your request!' })}
            </p>
            <p className="text-[14px] sm:text-[20px] italic font-light text-black">
              {t({ ru: 'Мы свяжемся с вами в ближайшее время.', en: 'We will contact you shortly.' })}
            </p>
          </div>
        </div>
      )}

      {/* Модальное окно отзыва (адаптированное) */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !reviewSubmitting && setReviewModalOpen(false)}>
          <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-[5px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => !reviewSubmitting && setReviewModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl focus:outline-none focus:ring-0">×</button>
            <h2 className="text-[20px] lg:text-[32px] font-bold text-black mb-6">
              {t({ ru: 'Оставить отзыв', en: 'Leave a review' })}
            </h2>

            <div className="mb-5">
              <label className="block text-[16px] lg:text-[20px] font-normal text-gray-500 mb-2">{t({ ru: 'Ваш отзыв', en: 'Your review' })}</label>
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-3 border rounded-[5px] text-black text-[14px] lg:text-[16px] focus:outline-none focus:ring-2 focus:ring-[#353535]"
                disabled={reviewSubmitting}
              ></textarea>
            </div>

            <div className="mb-5">
              <label className="block text-[16px] lg:text-[20px] font-normal text-gray-500 mb-2">{t({ ru: 'Рейтинг', en: 'Rating' })}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none transition"
                    disabled={reviewSubmitting}
                  >
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={star <= reviewRating ? "black" : "none"}
                        fillOpacity={star <= reviewRating ? 0.5 : 0}
                        stroke="black"
                        strokeOpacity={star <= reviewRating ? 0 : 0.5}
                        strokeWidth="0.5"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[16px] lg:text-[20px] font-normal text-gray-500 mb-2">{t({ ru: 'Фото (необязательно)', en: 'Photo (optional)' })}</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="text-[14px] lg:text-[16px] text-black break-all">{reviewPhoto ? reviewPhoto.name : t({ ru: 'Файл не выбран', en: 'No file chosen' })}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReviewPhoto(e.target.files[0])}
                  disabled={reviewSubmitting}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 flex-wrap">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="w-[120px] h-[35px] lg:h-[40px] bg-transparent border border-[#353535] rounded-[5px] text-[#353535] text-[16px] lg:text-[20px] transition hover:shadow-md hover:underline focus:outline-none focus:ring-0"
                disabled={reviewSubmitting}
              >
                {t({ ru: 'Отмена', en: 'Cancel' })}
              </button>
              <button
                onClick={submitReview}
                disabled={reviewSubmitting}
                className="w-[120px] h-[35px] lg:h-[40px] bg-[#353535] rounded-[5px] text-white text-[16px] lg:text-[20px] font-normal hover:underline transition disabled:opacity-50 focus:outline-none focus:ring-0"
              >
                {reviewSubmitting ? t({ ru: 'Отправка...', en: 'Sending...' }) : t({ ru: 'Отправить', en: 'Send' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Cabinet;