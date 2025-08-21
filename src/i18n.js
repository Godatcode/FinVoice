import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import pa from './locales/pa.json';
import or from './locales/or.json';
import kn from './locales/kn.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    bn: { translation: bn },
    pa: { translation: pa },
    or: { translation: or },
    kn: { translation: kn },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
