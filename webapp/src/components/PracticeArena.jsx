import React, { useState, useEffect } from 'react';
import { updateStudentModel, getStudentModel } from '../utils/adaptiveEngine';
import { getQuestionsForSkill } from '../utils/itemBankNormalizer';
import confetti from 'canvas-confetti';
import { useSettings } from '../context/SettingsContext';
import './DiagnosticTest.css'; // Reusing diagnostic styles

const playSound = (type, soundEnabled) => {
  if (!soundEnabled) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);
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

export default function PracticeArena({ skill, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [animateState, setAnimateState] = useState('');
  
  const [resultState, setResultState] = useState(null); // 'clear', 'assisted_clear', 'needs_review'
  
  const { soundEnabled, t, language } = useSettings();

  useEffect(() => {
    if (skill) {
      const q = getQuestionsForSkill(skill.id, 5);
      setQuestions(q);
    }
  }, [skill]);

  if (!skill) return null;

  if (questions.length === 0 && !showIntro) {
    return (
      <div className="diagnostic-container finished">
        <h2>{t('practice.noDataTitle')}</h2>
        <p>{t('practice.noDataText')}</p>
        <button onClick={onBack} className="primary-btn">{t('practice.backToMap')}</button>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="diagnostic-container">
        <div className="glass-panel" style={{padding: '40px', textAlign: 'center'}}>
          <h2 style={{color: 'var(--accent-blue)', marginTop: 0}}>{t('practice.introTitle')}</h2>
          <h3>{skill.name[language] || skill.name.en}</h3>
          
          <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', margin: '20px 0'}}>
            <p style={{fontSize: '18px', lineHeight: '1.6'}}>{skill.introText[language] || skill.introText.en}</p>
          </div>
          
          <div style={{color: 'var(--accent-yellow)', fontWeight: 'bold', marginBottom: '30px'}}>
            🎯 {t('practice.goal')}
          </div>
          
          <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
            <button className="primary-btn" onClick={() => {
              setShowIntro(false);
              setStartTime(Date.now());
            }}>
              {t('practice.startBtn')} 🚀
            </button>
            <button className="back-btn" onClick={onBack} style={{padding: '10px 20px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '12px'}}>
              {t('practice.backToMap')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resultState) {
    const isSuccess = resultState === 'clear' || resultState === 'assisted_clear';
    return (
      <div className="diagnostic-container finished">
        <h2>{isSuccess ? t('practice.questCompleted') : t('practice.questFailed')}</h2>
        
        {isSuccess ? (
          <div style={{margin: '20px 0'}}>
            <h3 style={{color: 'var(--accent-green)'}}>
              {resultState === 'clear' ? t('practice.completeQuest') : t('practice.assistedClear')}
            </h3>
            <p>Con đã làm đúng {correctCount} câu và dùng {totalHintsUsed} gợi ý.</p>
          </div>
        ) : (
          <div style={{margin: '20px 0'}}>
            <h3 style={{color: 'var(--accent-red)'}}>{t('practice.recoveryQuest')}</h3>
            <p>{t('practice.questFailedText')}</p>
          </div>
        )}

        <button onClick={onBack} className="primary-btn">{t('practice.backToMap')}</button>
      </div>
    );
  }

  const question = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    
    setIsAnswerChecked(true);
    const timeSpentSec = (Date.now() - startTime) / 1000;
    const isCorrectAns = selectedOption === question.answer;
    
    const result = updateStudentModel({
      questionId: question.id,
      skillId: skill.id,
      domain: question.domain || 'mixed',
      isCorrect: isCorrectAns,
      difficulty: question.difficulty || 1,
      errorTags: question.error_tags || [],
      hintUsed: hintLevel,
      timeSpentSec: timeSpentSec,
      isRecovery: false
    });

    if (isCorrectAns) {
      setIsCorrect(true);
      playSound('success', soundEnabled);
      setAnimateState('glow');
      setCorrectCount(prev => prev + 1);
      setTimeout(() => setAnimateState(''), 1000);
      
      if (result && result.levelUp) {
         confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      setIsCorrect(false);
      playSound('error', soundEnabled);
      setAnimateState('shake');
      setTimeout(() => setAnimateState(''), 500);
      if (hintLevel === 0) setHintLevel(1);
    }
    
    setTotalHintsUsed(prev => prev + hintLevel);
  };

  const handleNext = () => {
    // Kiem tra dieu kien ket thuc
    const newCorrect = isCorrect ? correctCount : correctCount;
    if (newCorrect >= 3) {
      if (totalHintsUsed <= 2) setResultState('clear');
      else setResultState('assisted_clear');
      
      // Save practice history
      savePracticeHistory(newCorrect, 'clear');
      return;
    }
    
    if (currentIndex >= questions.length - 1) {
      setResultState('needs_review');
      savePracticeHistory(newCorrect, 'needs_review');
      return;
    }

    setCurrentIndex(prev => prev + 1);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setHintLevel(0);
    setStartTime(Date.now());
  };

  const savePracticeHistory = (correct, status) => {
     const model = getStudentModel();
     if (model) {
       model.practice_history.push({
         skillId: skill.id,
         attemptedAt: new Date().toISOString(),
         result: status,
         correct: correct,
         total: currentIndex + 1,
         hintsUsed: totalHintsUsed
       });
       localStorage.setItem('student_model', JSON.stringify(model));
     }
  };

  return (
    <div className="diagnostic-container">
      <div className="gamification-bar">
        <div className="level-badge" style={{background: 'var(--accent-blue)'}}>
          {skill.name[language] || skill.name.en}
        </div>
        <div className="progress-bar" style={{fontSize: '14px', color: 'var(--text-muted)'}}>
          Đúng: <strong style={{color: 'var(--accent-green)'}}>{correctCount}/3</strong> &nbsp;|&nbsp; Lượt: {currentIndex + 1}/5
        </div>
      </div>
      
      <div className={`question-card ${animateState}`}>
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
              <button key={key} className={optionClass} onClick={() => !isAnswerChecked && setSelectedOption(key)} disabled={isAnswerChecked && isCorrect}>
                <span className="option-key">{key}</span> {value}
              </button>
            );
          })}
        </div>

        <div className="actions">
          {!isAnswerChecked || !isCorrect ? (
             <button className="primary-btn" onClick={handleCheckAnswer} disabled={!selectedOption || (isAnswerChecked && !isCorrect && hintLevel > question.hint_levels.length)}>
               {t('test.checkBtn')}
             </button>
          ) : (
             <button className="next-btn" onClick={handleNext}>
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
            <button className="hint-btn" onClick={() => setHintLevel(prev => prev + 1)}>
              {t('test.moreHintsBtn')}
            </button>
          )}
          {hintLevel > 0 && hintLevel <= question.hint_levels.length && (
             <button className="retry-btn" onClick={() => { setIsAnswerChecked(false); setSelectedOption(null); }}>
               {t('test.retryBtn')}
             </button>
          )}
          <button className="next-btn" onClick={handleNext} style={{marginLeft: '10px', backgroundColor: 'var(--space-light)', border: '1px solid var(--glass-border)', color: 'var(--text-main)'}}>
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
    </div>
  );
}
