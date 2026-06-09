export const initStudentModel = (defaultData) => {
  if (!localStorage.getItem('student_model')) {
    const data = { ...defaultData };
    if (!data.recent_performance) data.recent_performance = {};
    if (!data.learning_events) data.learning_events = [];
    if (!data.gamification) data.gamification = { xp: 0, level: 1, soft_streak: 0, badges: [] };
    if (!data.quests) data.quests = { daily: [], recovery: [] };
    if (!data.learning_behavior) data.learning_behavior = { effort_xp: 0, mistakes_repaired: 0, hints_used: 0, recovery_quests_completed: 0 };
    if (!data.anti_grind_log) data.anti_grind_log = {};
    localStorage.setItem('student_model', JSON.stringify(data));
  }
}

export const getStudentModel = () => {
  const dataStr = localStorage.getItem('student_model');
  if (!dataStr) return null;
  const data = JSON.parse(dataStr);
  
  // Data Migration / Defensive Initialization for old localStorage
  if (!data.skill_mastery) data.skill_mastery = {};
  if (!data.error_profile) data.error_profile = {};
  if (!data.zpd_band) data.zpd_band = { mixed: 1, math_logic: 1, vietnamese: 1 };
  if (!data.recent_performance) data.recent_performance = {};
  if (!data.learning_events) data.learning_events = [];
  if (!data.gamification) data.gamification = { xp: 0, level: 1, soft_streak: 0, badges: [] };
  if (!data.quests) data.quests = { daily: [], recovery: [] };
  if (!data.learning_behavior) data.learning_behavior = { effort_xp: 0, mistakes_repaired: 0, hints_used: 0, recovery_quests_completed: 0 };
  if (!data.anti_grind_log) data.anti_grind_log = {};
  
  // Phase 7 Additions
  if (!data.learning_path) data.learning_path = {
    currentDomain: "math_logic",
    currentSkill: null,
    completedNodes: [],
    recommendedNodes: [],
    lockedNodes: [],
    recoveryNodes: []
  };
  if (!data.practice_history) data.practice_history = [];
  
  return data;
}

export const updateStudentModel = (params) => {
  const { questionId, skillId, domain, isCorrect, difficulty, errorTags, hintUsed, timeSpentSec, isRecovery } = params;
  const model = getStudentModel();
  if (!model) return null;

  // 1. Mastery Calculation
  const difficultyMultiplier = { 1: 0.8, 2: 1.0, 3: 1.2 };
  const hintPenalty = { 0: 1.0, 1: 0.6, 2: 0.4, 3: 0.2 };
  
  const diffMult = difficultyMultiplier[difficulty] || 1.0;
  const hPenalty = hintPenalty[Math.min(hintUsed, 3)] || 0.2;
  
  let observedScore = 0;
  if (isCorrect) {
    observedScore = 1.0 * diffMult * hPenalty;
  } else {
    observedScore = -0.5 * diffMult;
  }

  const oldMastery = model.skill_mastery[skillId] !== undefined ? model.skill_mastery[skillId] : 0.5;
  const newMastery = Math.max(0, Math.min(1, 0.8 * oldMastery + 0.2 * observedScore));
  model.skill_mastery[skillId] = parseFloat(newMastery.toFixed(2));

  // 2. Recent Performance
  if (!model.recent_performance[skillId]) {
    model.recent_performance[skillId] = { attempts: 0, correct: 0, avg_hint_used: 0 };
  }
  const rp = model.recent_performance[skillId];
  rp.attempts += 1;
  if (isCorrect) rp.correct += 1;
  rp.avg_hint_used = (rp.avg_hint_used * (rp.attempts - 1) + hintUsed) / rp.attempts;

  // 3. Error Profile & Behavior
  model.learning_behavior.hints_used += hintUsed;

  if (!isCorrect && errorTags) {
    errorTags.forEach(tag => {
      if (tag === 'needs_review') return;
      model.error_profile[tag] = (model.error_profile[tag] || 0) + 1;
    });
    if (timeSpentSec < 5 && difficulty < 3) {
      model.error_profile['careless_reading'] = (model.error_profile['careless_reading'] || 0) + 1;
    }
  }

  if (isCorrect && hintUsed > 0) {
    model.learning_behavior.mistakes_repaired += 1;
  }

  if (isCorrect && isRecovery) {
    model.learning_behavior.recovery_quests_completed += 1;
  }

  // 4. ZPD Band Update
  if (rp.attempts % 3 === 0) {
    const accuracy = rp.correct / rp.attempts;
    let currentZpd = model.zpd_band[domain] || 1;
    
    if (accuracy >= 0.8 && rp.avg_hint_used < 1) {
      currentZpd = Math.min(3, currentZpd + 1);
    } else if (accuracy < 0.5 || (!isCorrect && rp.attempts >= 3 && rp.correct === 0)) {
      currentZpd = Math.max(1, currentZpd - 1);
      // Trigger Recovery Quest
      if (!model.quests.recovery.find(q => q.skillId === skillId)) {
          model.quests.recovery.push({ skillId, targetCorrect: 3, progress: 0 });
      }
    }
    model.zpd_band[domain] = currentZpd;
  }

  // 5. XP & Anti-Grind
  let earnedXp = 0;
  if (!model.anti_grind_log[questionId]) {
      // First time answering this question correctly
      if (isCorrect) {
          model.anti_grind_log[questionId] = true; // marked as solved
          
          if (hintUsed === 0) {
              earnedXp = 10;
          } else {
              earnedXp = 8; // correct after hint
          }
      } else {
          // Used a hint and failed?
          if (hintUsed > 0) earnedXp = 5; // Effort XP
      }
  } else {
      // Already solved before, only give XP if it's a recovery quest
      if (isRecovery && isCorrect) earnedXp = 10;
  }

  model.gamification.xp += earnedXp;
  model.learning_behavior.effort_xp += earnedXp;

  // Level Update
  const newLevel = 1 + Math.floor(Math.sqrt(model.gamification.xp / 100));
  const levelUp = newLevel > model.gamification.level;
  model.gamification.level = newLevel;

  // Streak Update
  if (isCorrect && hintUsed === 0) {
      model.gamification.soft_streak += 1;
  } else if (!isCorrect) {
      model.gamification.soft_streak = 0;
  }

  // 6. Badges (Behavioral)
  const newBadges = [];
  const addBadge = (id) => {
      if (!model.gamification.badges.includes(id)) {
          model.gamification.badges.push(id);
          newBadges.push(id);
      }
  };

  if (model.gamification.xp > 0) addBadge('first_star');
  if (model.gamification.soft_streak >= 3) addBadge('sharp_thinker');
  if (model.learning_behavior.mistakes_repaired >= 1) addBadge('careful_reader');
  if (model.learning_behavior.mistakes_repaired >= 3) addBadge('mistake_fixer');
  if (isCorrect && hintUsed > 0) addBadge('brave_learner');

  // Save Learning Event
  model.learning_events.push({
    questionId,
    skillId,
    domain,
    isCorrect,
    hintUsed,
    timeSpentSec,
    timestamp: new Date().toISOString()
  });

  localStorage.setItem('student_model', JSON.stringify(model));
  return { model, earnedXp, levelUp, newBadges };
}

export const clearStudentModel = () => {
    localStorage.removeItem('student_model');
}
