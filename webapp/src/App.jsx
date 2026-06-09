import React, { useState, useEffect } from 'react'
import DiagnosticTest from './components/DiagnosticTest'
import ParentDashboard from './components/ParentDashboard'
import LearningPath from './components/LearningPath'
import PracticeArena from './components/PracticeArena'
import SettingsModal from './components/SettingsModal'
import { initStudentModel, getStudentModel } from './utils/adaptiveEngine'
import defaultStudentData from './data/student_model.json'
import { useSettings } from './context/SettingsContext'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'test', 'dashboard', 'path', 'practice'
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const { soundEnabled, setSoundEnabled, t } = useSettings();

  useEffect(() => {
    initStudentModel(defaultStudentData);
    const model = getStudentModel();
    // Bỏ qua Welcome Screen và vào thẳng Lộ trình nếu học sinh đã làm xong bài chẩn đoán (xp > 0)
    if (model && model.gamification.xp > 0) {
      setCurrentScreen('path');
    }
  }, []);

  const handleSelectSkill = (skill) => {
    setSelectedSkill(skill);
    setCurrentScreen('practice');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{t('app.title')}</h1>
        <div className="header-controls">
          <button 
            className="header-btn" 
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? t('app.soundOn') : t('app.soundOff')}
          </button>
          
          {currentScreen !== 'path' && currentScreen !== 'test' && currentScreen !== 'home' && currentScreen !== 'practice' && (
            <button 
              className="header-btn" 
              onClick={() => setCurrentScreen('path')}
            >
              {t('learningPath.title')}
            </button>
          )}

          {currentScreen !== 'dashboard' && (
            <button 
              className="header-btn" 
              onClick={() => setCurrentScreen('dashboard')}
            >
              {t('app.dashboardBtn')}
            </button>
          )}
          
          <button 
            className="header-btn" 
            onClick={() => setShowSettings(true)}
          >
            {t('app.settingsBtn')}
          </button>
        </div>
      </header>
      
      <main className="app-main">
        {currentScreen === 'home' && (
          <div className="welcome-screen">
            <h2>{t('welcome.greeting')}</h2>
            <p>{t('welcome.intro')}</p>
            <div className="info-box">
              <p><strong>{t('welcome.goalLabel')}</strong> {t('welcome.goalText')}</p>
              <p><strong>{t('welcome.timeLabel')}</strong> {t('welcome.timeText')}</p>
              <p><strong>{t('welcome.hintLabel')}</strong> {t('welcome.hintText')}</p>
            </div>
            <button 
              className="start-btn" 
              onClick={() => setCurrentScreen('test')}
            >
              {t('welcome.startBtn')}
            </button>
          </div>
        )}
        
        {currentScreen === 'test' && <DiagnosticTest />}
        {currentScreen === 'dashboard' && <ParentDashboard onBack={() => setCurrentScreen('path')} />}
        {currentScreen === 'path' && <LearningPath onSelectSkill={handleSelectSkill} />}
        {currentScreen === 'practice' && <PracticeArena skill={selectedSkill} onBack={() => setCurrentScreen('path')} />}
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default App
