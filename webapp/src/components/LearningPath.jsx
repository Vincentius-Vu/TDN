import React, { useState, useEffect } from 'react';
import { getStudentModel } from '../utils/adaptiveEngine';
import { SKILL_GRAPH, DOMAINS } from '../data/SkillGraph';
import { useSettings } from '../context/SettingsContext';
import './LearningPath.css';

export default function LearningPath({ onSelectSkill }) {
  const [studentData, setStudentData] = useState(null);
  const [activeDomain, setActiveDomain] = useState('math_logic');
  const { t, language } = useSettings();

  useEffect(() => {
    setStudentData(getStudentModel());
  }, []);

  if (!studentData) return null;

  const getStatus = (skill, domainId) => {
    const mastery = studentData.skill_mastery[skill.id] || 0;
    const prerequisitesMet = skill.prerequisites.every(p => (studentData.skill_mastery[p] || 0) >= 0.5);

    if (!prerequisitesMet) return 'locked';
    if (mastery >= 0.8) return 'mastered';
    
    // Check if there is a recovery quest
    const hasRecovery = studentData.quests?.recovery?.find(q => q.skillId === skill.id);
    // If it's not a new skill (mastery !== 0) and mastery < 0.5, it needs review
    const hasAttempted = studentData.recent_performance && studentData.recent_performance[skill.id]?.attempts > 0;
    
    if (hasRecovery || (hasAttempted && mastery < 0.5)) return 'needs_review';
    
    const domainZpd = studentData.zpd_band[domainId] || 1;
    if (domainZpd >= skill.zpdLevel) return 'recommended';
    
    return 'available';
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'locked': return { label: t('learningPath.locked'), color: 'var(--text-muted)', icon: '🔒' };
      case 'mastered': return { label: t('learningPath.mastered'), color: 'var(--accent-yellow)', icon: '⭐' };
      case 'needs_review': return { label: t('learningPath.needsReview'), color: 'var(--accent-red)', icon: '🚨' };
      case 'recommended': return { label: t('learningPath.recommended'), color: 'var(--accent-green)', icon: '🔥' };
      default: return { label: t('learningPath.available'), color: 'var(--accent-blue)', icon: '📍' };
    }
  };

  return (
    <div className="learning-path-container">
      <h2 style={{textAlign: 'center', marginBottom: '20px'}}>{t('learningPath.title')}</h2>
      
      <div className="domain-tabs">
        {DOMAINS.map(domain => (
          <button 
            key={domain.id}
            className={`domain-tab ${activeDomain === domain.id ? 'active' : ''}`}
            onClick={() => setActiveDomain(domain.id)}
          >
            {domain.icon} {domain.name[language] || domain.name.en}
          </button>
        ))}
      </div>

      <div className="skills-map">
        {SKILL_GRAPH[activeDomain]?.map(skill => {
          const status = getStatus(skill, activeDomain);
          const statusInfo = getStatusInfo(status);
          const mastery = studentData.skill_mastery[skill.id] || 0;

          return (
            <div key={skill.id} className={`skill-node glass-panel status-${status}`}>
              <div className="node-header">
                <span className="node-icon">{statusInfo.icon}</span>
                <span className="node-status" style={{color: statusInfo.color}}>{statusInfo.label}</span>
              </div>
              <h3 className="node-title">{skill.name[language] || skill.name.en}</h3>
              
              {status !== 'locked' && (
                <div className="node-progress">
                  <div className="progress-track">
                    <div className="progress-fill" style={{width: `${Math.round(mastery * 100)}%`, background: statusInfo.color}}></div>
                  </div>
                  <span className="mastery-val">{Math.round(mastery * 100)}%</span>
                </div>
              )}

              <button 
                className="practice-btn" 
                disabled={status === 'locked'}
                onClick={() => onSelectSkill(skill)}
              >
                {t('learningPath.practiceBtn')}
              </button>
            </div>
          );
        })}
        
        {(!SKILL_GRAPH[activeDomain] || SKILL_GRAPH[activeDomain].length === 0) && (
          <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)', gridColumn: '1 / -1'}}>
            Updating stations for this domain...
          </div>
        )}
      </div>
    </div>
  );
}
