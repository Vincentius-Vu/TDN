import React, { useState, useEffect } from 'react';
import itemsBank from '../data/items_bank.json';
import { updateStudentModel, getStudentModel } from '../utils/adaptiveEngine';
import confetti from 'canvas-confetti';
import { useSettings } from '../context/SettingsContext';
import './DiagnosticTest.css';

// Web Audio API for Soft Pop (Success) and Gentle Thud (Error)
const playSound = (type, soundEnabled) => {
  if (!soundEnabled) return;
  
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'error') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }
};

export default function DiagnosticTest() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [animateState, setAnimateState] = useState(''); // 'shake', 'glow', ''
  const [showBadgeModal, setShowBadgeModal] = useState(null);
  
  const { soundEnabled, t, language } = useSettings();
  
  useEffect(() => {
    const model = getStudentModel();
    if (model) setScore(model.gamification.xp);
  }, []);
  
  const question = itemsBank[currentQuestionIndex];

  const handleOptionSelect = (optionKey) => {
    if (!isAnswerChecked) {
      setSelectedOption(optionKey);
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    
    setIsAnswerChecked(true);
    const timeSpentSec = (Date.now() - startTime) / 1000;
    const isCorrectAns = selectedOption === question.answer;
    
    const result = updateStudentModel({
      questionId: question.id,
      skillId: question.skill || 'general_knowledge',
      domain: question.domain || 'mixed',
      isCorrect: isCorrectAns,
      difficulty: question.difficulty || 2,
      errorTags: question.error_tags || [],
      hintUsed: hintLevel,
      timeSpentSec: timeSpentSec,
      isRecovery: false // MVP default
    });

    if (isCorrectAns) {
      setIsCorrect(true);
      playSound('success', soundEnabled);
      setAnimateState('glow');
      setTimeout(() => setAnimateState(''), 1000);

      if (result) {
          setScore(result.model.gamification.xp);
          
          if (result.levelUp) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#c084fc', '#38bdf8', '#fcd34d'] });
          }
          if (result.newBadges && result.newBadges.length > 0) {
            confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
            setShowBadgeModal(result.newBadges[0]); // Show the first newly unlocked badge
          }
      }
    } else {
      setIsCorrect(false);
      playSound('error', soundEnabled);
      setAnimateState('shake');
      setTimeout(() => setAnimateState(''), 500);

      if (hintLevel === 0) setHintLevel(1);
    }
  };

  const handleRequestHint = () => {
    if (hintLevel < question.hint_levels.length) {
      setHintLevel(hintLevel + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < itemsBank.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setIsCorrect(null);
      setHintLevel(0);
      setStartTime(Date.now());
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="diagnostic-container finished">
        <h2>{t('test.finishedTitle')}</h2>
        <p>{t('test.xpEarned')} <strong>{score} XP</strong></p>
        <p>{t('test.analyzingZpd')}</p>
        <button onClick={() => window.location.reload()} className="primary-btn">{t('test.goHomeBtn')}</button>
      </div>
    );
  }

  return (
    <div className="diagnostic-container">
      <div className="gamification-bar">
        <div className="level-badge">Level {getStudentModel()?.gamification?.level || 1}</div>
        <div className="xp-container">✨ {score} XP</div>
        <div className="progress-bar" style={{fontSize: '14px', color: 'var(--text-muted)'}}>
          {t('test.question')} {currentQuestionIndex + 1} / {itemsBank.length}
        </div>
      </div>
      
      <div className={`question-card ${animateState}`}>
        <div className="skill-badge">{question.domain === 'math_logic' ? t('test.mathLogic') : t('test.vietnamese')}</div>
        <h3 className="question-content">{question.content}</h3>
        
        <div className="options-grid">
          {Object.entries(question.options).map(([key, value]) => {
            let optionClass = "option-btn";
            if (selectedOption === key) optionClass += " selected";
            if (isAnswerChecked) {
              if (isCorrect && key === question.answer) optionClass += " correct";
              else if (!isCorrect && selectedOption === key) optionClass += " incorrect";
            }
            
            return (
              <button 
                key={key} 
                className={optionClass}
                onClick={() => handleOptionSelect(key)}
                disabled={isAnswerChecked && isCorrect}
              >
                <span className="option-key">{key}</span> {value}
              </button>
            );
          })}
        </div>

        <div className="actions">
          {!isAnswerChecked || !isCorrect ? (
             <button 
              className="primary-btn" 
              onClick={handleCheckAnswer}
              disabled={!selectedOption || (isAnswerChecked && !isCorrect && hintLevel > question.hint_levels.length)}
             >
               {t('test.checkBtn')}
             </button>
          ) : (
             <button className="next-btn" onClick={handleNextQuestion}>
               {t('test.nextBtn')}
             </button>
          )}
        </div>
      </div>

      {isAnswerChecked && !isCorrect && (
        <div className="feedback-section incorrect-feedback">
          <h4>{t('test.incorrect')}</h4>
          
          <div className="hints-container">
            {question.hint_levels.slice(0, hintLevel).map((hint, idx) => (
              <div key={idx} className="hint-box">
                <strong>{t('test.hintPrefix')} {idx + 1}:</strong> {hint}
              </div>
            ))}
            
            {hintLevel === question.hint_levels.length && (
              <div className="solution-box">
                <strong>{t('test.solutionPrefix')}</strong> {question.solution}
              </div>
            )}
          </div>
          
          {hintLevel < question.hint_levels.length && (
            <button className="hint-btn" onClick={handleRequestHint}>
              {t('test.moreHintsBtn')}
            </button>
          )}
          
          {hintLevel > 0 && hintLevel <= question.hint_levels.length && (
             <button className="retry-btn" onClick={() => {
               setIsAnswerChecked(false);
               setSelectedOption(null);
             }}>
               {t('test.retryBtn')}
             </button>
          )}
          
          <button className="next-btn" onClick={handleNextQuestion} style={{marginLeft: '10px', backgroundColor: 'var(--space-light)', border: '1px solid var(--glass-border)', color: 'var(--text-main)'}}>
            {t('test.skipBtn')}
          </button>
        </div>
      )}
      
      {isAnswerChecked && isCorrect && (
        <div className="feedback-section correct-feedback">
          <h4>{t('test.correct')}</h4>
          <p><strong>{t('test.explanation')}</strong> {question.solution}</p>
        </div>
      )}

      {/* Badge Modal */}
      {showBadgeModal && (
        <div className="settings-overlay">
          <div className="glass-panel settings-modal" style={{textAlign: 'center'}}>
            <div style={{fontSize: '60px', marginBottom: '20px'}}>🏆</div>
            <h2 style={{color: 'var(--accent-yellow)'}}>
              {language === 'vi' ? 'Huy Hiệu Mới!' : 'New Badge Unlocked!'}
            </h2>
            <h3 style={{color: 'var(--text-main)'}}>{
              showBadgeModal === 'first_star' ? (language === 'vi' ? 'Ngôi Sao Đầu Tiên' : 'First Star') :
              showBadgeModal === 'sharp_thinker' ? (language === 'vi' ? 'Tư Duy Nhạy Bén' : 'Sharp Thinker') :
              showBadgeModal === 'careful_reader' ? (language === 'vi' ? 'Người Đọc Cẩn Thận' : 'Careful Reader') :
              showBadgeModal === 'mistake_fixer' ? (language === 'vi' ? 'Chuyên Gia Sửa Lỗi' : 'Mistake Fixer') :
              showBadgeModal === 'brave_learner' ? (language === 'vi' ? 'Chiến Binh Dũng Cảm' : 'Brave Learner') : showBadgeModal
            }</h3>
            <p style={{color: 'var(--text-muted)'}}>
              {language === 'vi' ? 'Con đang làm rất tốt, tiếp tục phát huy nhé!' : 'You are doing great, keep it up!'}
            </p>
            <button className="primary-btn" onClick={() => setShowBadgeModal(null)} style={{marginTop: '20px'}}>
              {language === 'vi' ? 'Tiếp tục hành trình 🚀' : 'Continue Journey 🚀'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
