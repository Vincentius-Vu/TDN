import React from 'react';
import { useSettings } from '../context/SettingsContext';

export default function SettingsModal({ onClose }) {
  const { theme, setTheme, language, setLanguage, soundEnabled, setSoundEnabled, t } = useSettings();

  return (
    <div className="settings-overlay">
      <div className="glass-panel settings-modal">
        <h2 style={{marginTop: 0, textAlign: 'center'}}>{t('settings.title')}</h2>
        
        <div className="setting-row">
          <label><strong>{t('settings.language')}</strong></label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">🇬🇧 English</option>
            <option value="vi">🇻🇳 Tiếng Việt</option>
          </select>
        </div>

        <div className="setting-row">
          <label><strong>{t('settings.theme')}</strong></label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="dark">{t('settings.themeDark')}</option>
            <option value="light">{t('settings.themeLight')}</option>
          </select>
        </div>

        <div className="setting-row">
          <label><strong>{t('settings.sound')}</strong></label>
          <button 
            className="toggle-btn" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{background: soundEnabled ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)', color: soundEnabled ? 'white' : 'var(--text-muted)'}}
          >
            {soundEnabled ? t('settings.on') : t('settings.off')}
          </button>
        </div>

        <button className="primary-btn" onClick={onClose} style={{width: '100%', marginTop: '20px'}}>
          {t('settings.close')}
        </button>
      </div>
    </div>
  );
}
