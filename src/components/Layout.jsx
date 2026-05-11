import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ 
  children, 
  socialLinks, 
  footerSettings, 
  onOrderClick, 
  lang, 
  setLang, 
  translations,
  token = null
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const t = (obj) => obj?.[lang] || obj?.ru || '';

  // Все пункты меню (для мобильного меню)
  const allMenuItems = [
    { to: '/', labelKey: 'menuHome', defaultLabel: 'Главная' },
    { to: '/about', labelKey: 'menuAbout', defaultLabel: 'О бюро' },
    { to: '/projects', labelKey: 'menuInteriors', defaultLabel: 'Интерьеры' },
    { to: '/services', labelKey: 'menuServices', defaultLabel: 'Услуги' },
    { to: '/reviews', labelKey: 'menuReviews', defaultLabel: 'Отзывы' },
    { to: '/contacts', labelKey: 'menuContacts', defaultLabel: 'Контакты' },
    { to: '/about#faq', labelKey: 'menuFaq', defaultLabel: 'FAQ' },
    { to: '/news', labelKey: 'menuNews', defaultLabel: 'Новости' },
  ];

  // Для десктопа исключаем "Главную"
  const desktopMenuItems = allMenuItems.filter(item => item.to !== '/');

  const profileLink = token ? '/cabinet' : '/login';
  const profileText = token 
    ? (translations.cabinet ? t(translations.cabinet) : 'ЛК')
    : (translations.login ? t(translations.login) : 'Войти');

  const getMobileLabel = (item) => {
    if (item.labelKey && translations[item.labelKey]) {
      return t(translations[item.labelKey]);
    }
    return item.defaultLabel;
  };

  const getFooterContact = () => {
    if (footerSettings) {
      return {
        address: t({ ru: footerSettings.address_ru, en: footerSettings.address_en }),
        addressUrl: footerSettings.address_map_url,
        email: footerSettings.email,
        phone: footerSettings.phone,
        inn: t({ ru: footerSettings.inn_ru, en: footerSettings.inn_en }),
      };
    }
    return {
      address: 'Москва, ул. Вятская, 27, стр. 7',
      addressUrl: '#',
      email: 'info@offcon.ru',
      phone: '+7 499 394 45 10',
      inn: 'ООО "ОФИСНАУ", ИНН: 774318551032',
    };
  };

  const contacts = getFooterContact();

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.1)]">
        {/* Десктопный хедер */}
        <div className="hidden lg:flex items-center justify-between h-[80px] px-6 xl:px-[100px]">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link to="/" className="block transition duration-200 hover:opacity-80">
              <img src="/logo.svg" alt="OFFCON" className="w-[67px] h-[60px]" />
            </Link>
            <div className="flex gap-1 text-[clamp(16px,1.25vw,20px)]">
              <button onClick={() => setLang('ru')} className={`${lang === 'ru' ? 'text-[#353535] font-medium' : 'text-[#7C7C7C]'} hover:underline transition focus:outline-none focus:ring-0`}>RU</button>
              <button onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-[#353535] font-medium' : 'text-[#7C7C7C]'} hover:underline transition focus:outline-none focus:ring-0`}>EN</button>
            </div>
            <button onClick={onOrderClick} className="bg-transparent border-none text-[clamp(14px,1.25vw,20px)] cursor-pointer transition duration-200 hover:underline focus:outline-none focus:ring-0 whitespace-nowrap">
              {t(translations.header)}
            </button>
            <div className="w-[2px] h-[31px] bg-[#353535] rounded-full"></div>
            <div className="flex gap-2.5">
              {socialLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="transition duration-200 hover:opacity-80">
                  <img src={link.icon} alt={link.name} className="h-4 w-auto" />
                </a>
              ))}
            </div>
          </div>
          <nav className="flex items-center gap-2.5 flex-nowrap justify-end">
            {desktopMenuItems.map((item, idx) => (
              <Link key={idx} to={item.to} className="text-[#353535] text-[clamp(16px,1.25vw,20px)] no-underline hover:underline transition whitespace-nowrap focus:outline-none focus:ring-0">
                {t(translations[item.labelKey])}
              </Link>
            ))}
            <Link to={profileLink} className="text-[#353535] text-[clamp(16px,1.25vw,20px)] no-underline hover:underline transition whitespace-nowrap focus:outline-none focus:ring-0">
              {profileText}
            </Link>
          </nav>
        </div>

        {/* Мобильный хедер */}
        <div className="lg:hidden flex items-center justify-between h-[60px] px-5">
          <div className="w-10 flex justify-start">
            <button onClick={() => setMobileMenuOpen(true)} className="focus:outline-none focus:ring-0">
              <img src="/logo.svg" alt="OFFCON" className="w-[40px] h-[40px]" />
            </button>
          </div>
          <div className="flex justify-center">
            <div className="flex gap-1 text-[16px]">
              <button onClick={() => setLang('ru')} className={`${lang === 'ru' ? 'text-[#353535] font-medium' : 'text-[#7C7C7C]'} hover:underline transition focus:outline-none focus:ring-0`}>RU</button>
              <button onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-[#353535] font-medium' : 'text-[#7C7C7C]'} hover:underline transition focus:outline-none focus:ring-0`}>EN</button>
            </div>
          </div>
          <div className="w-10 flex justify-end">
            <button onClick={onOrderClick} className="text-[#353535] text-[16px] hover:underline whitespace-nowrap focus:outline-none focus:ring-0">
              {t(translations.header)}
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню (бургер) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute top-0 left-0 bottom-0 w-[200px] bg-white shadow-xl flex flex-col p-5 overflow-y-auto">
            <div className="absolute top-[10px] left-[20px] w-[40px] h-[40px] pointer-events-none">
              <img src="/logo.svg" alt="OFFCON" className="w-full h-full" />
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-5 right-5 text-[#353535] text-[24px] focus:outline-none focus:ring-0 z-10">×</button>
            <div className="mt-[60px] flex flex-col gap-5 mb-5">
              {allMenuItems.map((item, idx) => (
                <Link key={idx} to={item.to} className="text-[#000000] text-[16px] font-normal hover:underline" onClick={() => setMobileMenuOpen(false)}>
                  {getMobileLabel(item)}
                </Link>
              ))}
              <Link to={profileLink} className="text-[#000000] text-[16px] font-normal hover:underline" onClick={() => setMobileMenuOpen(false)}>
                {profileText}
              </Link>
            </div>
            <div className="flex gap-[10px] mb-5">
              {socialLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                  <img src={link.icon} alt={link.name} className="h-[25px] w-auto" />
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-5 mt-auto">
              <div className="flex flex-col gap-5 text-left">
                <a href={contacts.addressUrl} target="_blank" rel="noopener noreferrer" className="text-black text-[16px] font-normal hover:underline">
                  {contacts.address}
                </a>
                <a href={`mailto:${contacts.email}`} className="text-black text-[16px] font-normal hover:underline">{contacts.email}</a>
                <a href={`tel:${contacts.phone.replace(/\D/g, '')}`} className="text-black text-[16px] font-normal hover:underline">{contacts.phone}</a>
                <p className="text-[#8E8E8E] text-[16px] font-normal whitespace-pre-line">{contacts.inn}</p>
              </div>
              <Link to="/privacy" className="text-[#8E8E8E] text-[16px] font-normal hover:underline whitespace-pre-line" onClick={() => setMobileMenuOpen(false)}>
                {t(translations.footerPrivacy) || 'Политика\nконфиденциальности'}
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="pt-[80px] lg:pt-[80px] flex-grow">
        {children}
      </main>

      <footer className="hidden md:block bg-[#353535] w-full min-h-[240px] py-8">
        <div className="w-full px-6 xl:px-[100px] flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-2.5">
            {footerSettings ? (
              <>
                <a href={footerSettings.address_map_url || '#'} target="_blank" rel="noopener noreferrer" className="text-[20px] font-normal text-[#FAFAFA] hover:underline focus:outline-none">
                  {t({ ru: footerSettings.address_ru, en: footerSettings.address_en })}
                </a>
                <a href={`mailto:${footerSettings.email}`} className="text-[20px] font-normal text-[#FAFAFA] hover:underline focus:outline-none">
                  {footerSettings.email}
                </a>
                <a href={`tel:${footerSettings.phone_raw || footerSettings.phone}`} className="text-[20px] font-normal text-[#FAFAFA] hover:underline focus:outline-none">
                  {footerSettings.phone}
                </a>
                <p className="text-[20px] font-normal text-[#8E8E8E] mt-2.5">
                  {t({ ru: footerSettings.inn_ru, en: footerSettings.inn_en })}
                </p>
              </>
            ) : (
              <>
                <a href="https://yandex.ru/maps/-/CPGtBZME" target="_blank" rel="noopener noreferrer" className="text-[20px] font-normal text-[#FAFAFA] hover:underline">
                  Москва, ул. Вятская, 27, стр. 7
                </a>
                <a href="mailto:info@offcon.ru" className="text-[20px] font-normal text-[#FAFAFA] hover:underline">
                  info@offcon.ru
                </a>
                <a href="tel:+74993944510" className="text-[20px] font-normal text-[#FAFAFA] hover:underline">
                  +7 499 394 45 10
                </a>
                <p className="text-[20px] font-normal text-[#8E8E8E] mt-2.5">
                  ООО "ОФИСНАУ", ИНН: 774318551032
                </p>
              </>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-5">
              <div className="flex gap-2.5">
                {socialLinks.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
                    <img src={link.icon} alt={link.name} className="h-4 w-auto filter brightness-0 invert" />
                  </a>
                ))}
              </div>
              <img src="/logo.svg" alt="OFFCON" className="h-[60px] w-auto filter brightness-0 invert" />
            </div>
            <Link to="/privacy" className="text-[20px] font-normal text-[#8E8E8E] hover:underline mt-2.5 focus:outline-none">
              {t(translations.footerPrivacy)}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;