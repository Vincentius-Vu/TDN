import React, { useState, useEffect } from 'react';
import { getStudentModel, clearStudentModel } from '../utils/adaptiveEngine';
import { useSettings } from '../context/SettingsContext';
import './ParentDashboard.css';

export default function ParentDashboard({ onBack }) {
  const [studentData, setStudentData] = useState(null);
  const { t, language } = useSettings();

  useEffect(() => {
    const data = getStudentModel();
    setStudentData(data);
  }, []);

  if (!studentData) {
    return <div style={{textAlign: 'center', padding: '50px'}}>{language === 'vi' ? 'Chưa có dữ liệu học tập.' : 'No learning data available.'}</div>;
  }

  const getSkillName = (id) => {
    const namesVi = {
      'fraction_basic': 'Phân số cơ bản',
      'fraction_comparison': 'So sánh Phân số',
      'fraction_word_problem': 'Giải toán Phân số',
      'reading_main_idea': 'Đọc hiểu Ý chính',
      'reading_inference': 'Đọc hiểu Suy luận',
      'general_knowledge': 'Kiến thức chung'
    };
    const namesEn = {
      'fraction_basic': 'Basic Fractions',
      'fraction_comparison': 'Fraction Comparison',
      'fraction_word_problem': 'Fraction Word Problems',
      'reading_main_idea': 'Reading Main Idea',
      'reading_inference': 'Reading Inference',
      'general_knowledge': 'General Knowledge'
    };
    return language === 'vi' ? (namesVi[id] || id) : (namesEn[id] || id);
  };

  const errorNameMappingVi = {
    'concept_error': 'Lỗi Khái niệm',
    'calculation_error': 'Lỗi Tính toán',
    'lcm_error': 'Lỗi Tìm BCNN',
    'word_problem_comprehension': 'Không hiểu đề bài',
    'detail_vs_main_idea': 'Nhầm chi tiết với ý chính',
    'inference_error': 'Suy luận sai',
    'superficial_reading': 'Đọc qua loa',
    'careless_reading': 'Đọc ẩu (Làm quá nhanh)',
    'fraction_addition': 'Lỗi cộng phân số',
    'needs_review': 'Cần ôn tập thêm'
  };

  const errorNameMappingEn = {
    'concept_error': 'Concept Error',
    'calculation_error': 'Calculation Error',
    'lcm_error': 'LCM Error',
    'word_problem_comprehension': 'Word Problem Comprehension',
    'detail_vs_main_idea': 'Detail vs Main Idea',
    'inference_error': 'Inference Error',
    'superficial_reading': 'Superficial Reading',
    'careless_reading': 'Careless Reading (Rushing)',
    'fraction_addition': 'Fraction Addition Error',
    'needs_review': 'Needs Review'
  };
  
  const errorNameMapping = language === 'vi' ? errorNameMappingVi : errorNameMappingEn;

  const toPercent = (val) => `${Math.round(val * 100)}%`;

  const generateRecommendations = () => {
    let recs = [];
    if (studentData.error_profile['careless_reading'] >= 1) {
      recs.push({
        type: 'warning',
        title: language === 'vi' ? '⚠️ Đọc ẩu/Làm nhanh' : '⚠️ Careless Reading / Rushing',
        text: language === 'vi' ? 'Con có xu hướng làm bài quá nhanh (dưới 5 giây) và chọn sai. Ba mẹ nên nhắc con đọc kỹ đề bài hơn.' : 'Child tends to answer too quickly (under 5s) and makes mistakes. Encourage careful reading.'
      });
    }

    if (studentData.zpd_band.math_logic < 2) {
      recs.push({
        type: 'alert',
        title: language === 'vi' ? '🚨 Cần kèm thêm môn Toán' : '🚨 Math Support Needed',
        text: language === 'vi' ? 'Mức độ ZPD của Toán đang thấp. Hãy cùng con ôn lại Khái niệm Phân số bằng hình ảnh trực quan (chia bánh pizza).' : 'Math ZPD level is low. Review fraction concepts using visual aids (e.g. pizza slices).'
      });
    } else if (studentData.zpd_band.math_logic >= 3) {
      recs.push({
        type: 'success',
        title: language === 'vi' ? '🚀 Toán đang xuất sắc' : '🚀 Excellent in Math',
        text: language === 'vi' ? 'Con học Toán rất tốt. Có thể giao thêm các bài toán đố phức tạp hoặc toán tư duy logic.' : 'Child is doing great in Math. You can provide more complex word problems or logical puzzles.'
      });
    }
    
    if (recs.length === 0) {
      recs.push({
        type: 'info',
        title: language === 'vi' ? '✅ Tiếp tục phát huy' : '✅ Keep it up',
        text: language === 'vi' ? 'Con đang duy trì phong độ ổn định ở các kỹ năng.' : 'Child is maintaining a steady performance across skills.'
      });
    }
    return recs;
  };

  const handleClearData = () => {
    const msg = language === 'vi' ? 'Ba mẹ có chắc chắn muốn xoá toàn bộ dữ liệu học tập của con?' : 'Are you sure you want to clear all learning data?';
    if (window.confirm(msg)) {
      clearStudentModel();
      window.location.reload();
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h2>{t('dashboard.title')}</h2>
          <p>{t('dashboard.subtitle')}</p>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
           <button onClick={onBack} className="back-btn">{t('dashboard.backBtn')}</button>
           <button onClick={handleClearData} className="clear-btn">{t('dashboard.clearDataBtn')}</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card mastery-card glass-panel">
          <h3>{t('dashboard.masteryTitle')}</h3>
          <p className="card-desc">{t('dashboard.zpdDesc')} <strong style={{color: 'var(--accent-purple)'}}>{studentData.zpd_band?.mixed || 1}</strong></p>
          <ul className="skill-list">
            {Object.entries(studentData.skill_mastery).map(([skill, value]) => (
              <li key={skill}>
                <div className="skill-name">{getSkillName(skill)}</div>
                <div className="progress-track" style={{background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '12px', marginTop: '5px'}}>
                  <div 
                    className={`progress-fill ${value >= 0.8 ? 'excellent' : value >= 0.5 ? 'good' : 'needs-work'}`} 
                    style={{
                      width: toPercent(value), 
                      background: value >= 0.8 ? 'var(--accent-green)' : value >= 0.5 ? 'var(--accent-blue)' : 'var(--accent-red)',
                      height: '100%', borderRadius: '10px'
                    }}
                  ></div>
                </div>
                <div className="skill-value" style={{textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)'}}>{toPercent(value)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card behavior-card glass-panel" style={{padding: '20px'}}>
          <h3>{t('dashboard.behaviorTitle')}</h3>
          <p className="card-desc">{t('dashboard.behaviorDesc')}</p>
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            <li style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span>{t('dashboard.effortXp')}</span>
              <strong style={{color: 'var(--accent-yellow)'}}>{studentData.learning_behavior?.effort_xp || 0} XP</strong>
            </li>
            <li style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span>{t('dashboard.mistakesRepaired')}</span>
              <strong style={{color: 'var(--accent-green)'}}>{studentData.learning_behavior?.mistakes_repaired || 0} {t('dashboard.times')}</strong>
            </li>
            <li style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span>{t('dashboard.hintsUsed')}</span>
              <strong style={{color: 'var(--accent-blue)'}}>{studentData.learning_behavior?.hints_used || 0} {t('dashboard.times')}</strong>
            </li>
            <li style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span>{t('dashboard.questsCompleted')}</span>
              <strong style={{color: 'var(--accent-purple)'}}>{studentData.learning_behavior?.recovery_quests_completed || 0} Quest</strong>
            </li>
          </ul>
        </div>

        <div className="card error-card glass-panel">
          <h3>{t('dashboard.errorTitle')}</h3>
          <p className="card-desc">{t('dashboard.errorDesc')}</p>
          <ul className="error-list">
            {Object.entries(studentData.error_profile).map(([err, count]) => {
              if (count === 0) return null;
              return (
                <li key={err}>
                  <span className="error-icon">🚩</span>
                  <span className="error-name">{errorNameMapping[err] || err}</span>
                  <span className="error-count" style={{color: 'var(--accent-red)'}}>{count} {t('dashboard.times')}</span>
                </li>
              );
            })}
            {Object.values(studentData.error_profile).every(v => v === 0) && (
              <li><span className="error-name" style={{color: 'var(--accent-green)'}}>{t('dashboard.noErrors')}</span></li>
            )}
          </ul>
        </div>

        <div className="card recommendation-card glass-panel">
          <h3>{t('dashboard.nextStepsTitle')}</h3>
          <p className="card-desc">{t('dashboard.nextStepsDesc')}</p>
          <div className="recommendation-content">
             {generateRecommendations().map((rec, idx) => (
               <div key={idx} className={`rec-item rec-${rec.type}`} style={{background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', marginBottom: '10px'}}>
                  <h4 style={{color: rec.type === 'success' ? 'var(--accent-green)' : rec.type === 'warning' ? 'var(--accent-yellow)' : rec.type === 'alert' ? 'var(--accent-red)' : 'var(--accent-blue)'}}>{rec.title}</h4>
                  <p>{rec.text}</p>
               </div>
             ))}
          </div>
        </div>

        <div className="card badge-card glass-panel" style={{gridColumn: '1 / -1', marginTop: '20px'}}>
          <h3>{t('dashboard.badgeTitle')}</h3>
          <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px'}}>
            {studentData.gamification?.badges?.length > 0 ? (
              studentData.gamification.badges.map(b => (
                <div key={b} style={{background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', textAlign: 'center', width: '120px'}}>
                  <div style={{fontSize: '30px'}}>🎖️</div>
                  <div style={{fontSize: '12px', marginTop: '5px', fontWeight: 'bold'}}>{
                    b === 'first_star' ? (language === 'vi' ? 'Ngôi Sao Đầu Tiên' : 'First Star') :
                    b === 'sharp_thinker' ? (language === 'vi' ? 'Tư Duy Nhạy Bén' : 'Sharp Thinker') :
                    b === 'careful_reader' ? (language === 'vi' ? 'Người Đọc Cẩn Thận' : 'Careful Reader') :
                    b === 'mistake_fixer' ? (language === 'vi' ? 'Chuyên Gia Sửa Lỗi' : 'Mistake Fixer') :
                    b === 'brave_learner' ? (language === 'vi' ? 'Chiến Binh Dũng Cảm' : 'Brave Learner') : b
                  }</div>
                </div>
              ))
            ) : (
              <p style={{color: 'var(--text-muted)'}}>{t('dashboard.noBadges')}</p>
            )}
          </div>
        </div>
        
        {studentData.practice_history && studentData.practice_history.length > 0 && (
          <div className="card history-card glass-panel" style={{gridColumn: '1 / -1', marginTop: '20px'}}>
            <h3>🕒 {language === 'vi' ? 'Lịch sử Luyện tập' : 'Practice History'}</h3>
            <div style={{overflowX: 'auto', marginTop: '15px'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left'}}>
                <thead>
                  <tr style={{borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)'}}>
                    <th style={{padding: '10px'}}>{language === 'vi' ? 'Thời gian' : 'Time'}</th>
                    <th style={{padding: '10px'}}>{language === 'vi' ? 'Kỹ năng' : 'Skill'}</th>
                    <th style={{padding: '10px'}}>{language === 'vi' ? 'Kết quả' : 'Result'}</th>
                    <th style={{padding: '10px'}}>{language === 'vi' ? 'Số câu đúng' : 'Correct'}</th>
                    <th style={{padding: '10px'}}>{language === 'vi' ? 'Gợi ý' : 'Hints Used'}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...studentData.practice_history].reverse().slice(0, 10).map((hist, idx) => (
                    <tr key={idx} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                      <td style={{padding: '10px'}}>{new Date(hist.attemptedAt).toLocaleString()}</td>
                      <td style={{padding: '10px'}}>{getSkillName(hist.skillId)}</td>
                      <td style={{padding: '10px', color: hist.result === 'clear' ? 'var(--accent-green)' : hist.result === 'assisted_clear' ? 'var(--accent-yellow)' : 'var(--accent-red)'}}>
                        {hist.result === 'clear' ? (language === 'vi' ? 'Hoàn thành' : 'Clear') : 
                         hist.result === 'assisted_clear' ? (language === 'vi' ? 'HT có gợi ý' : 'Assisted Clear') : 
                         (language === 'vi' ? 'Cần ôn tập' : 'Needs Review')}
                      </td>
                      <td style={{padding: '10px'}}>{hist.correct}/{hist.total}</td>
                      <td style={{padding: '10px'}}>{hist.hintsUsed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
