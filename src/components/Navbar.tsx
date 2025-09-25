import React from 'react';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <nav>
      <ul>
        <li>{t('navbar.water_guard')}</li>
        <li>{t('navbar.rural_water_management')}</li>
        <li>{t('navbar.login')}</li>
        <li>{t('navbar.register')}</li>
        <li>
          <select onChange={(e) => changeLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
            <option value="te">తెలుగు</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
