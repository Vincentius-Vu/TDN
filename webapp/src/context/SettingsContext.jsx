import React, { createContext, useState, useEffect, useContext } from 'react';
import en from '../locales/en';
import vi from '../locales/vi';

const SettingsContext = createContext();

const translations = { en, vi };

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'vi');
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('sound_enabled') !== 'false');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('sound_enabled', soundEnabled);
  }, [soundEnabled]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (let k of keys) {
      if (value[k] === undefined) {
        // Fallback to English if key missing in Vietnamese
        let fallbackValue = translations['en'];
        for (let fallbackK of keys) {
           if (!fallbackValue) return key;
           fallbackValue = fallbackValue[fallbackK];
        }
        return fallbackValue || key;
      }
      value = value[k];
    }
    return value;
  };

  return (
    <SettingsContext.Provider value={{ theme, setTheme, language, setLanguage, soundEnabled, setSoundEnabled, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
