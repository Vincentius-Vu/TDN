const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BOT_TYPES = {
  STRONG: 'strong',
  WEAK: 'weak',
  CARELESS: 'careless',
  RANDOM: 'random'
};

const itemsBank = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/items_bank.json'), 'utf-8'));
const TOTAL_QUESTIONS = 10;

async function runBot(botType) {
  console.log(`\n🤖 Bắt đầu khởi chạy Bot: [${botType.toUpperCase()}]`);
  
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  // Clear local storage by visiting a blank page on the domain first
  await page.goto('http://localhost:5173');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Click start test
  await page.waitForSelector('.start-btn');
  await page.click('.start-btn');
  
  await page.waitForSelector('.diagnostic-container');
  
  let stats = { correct: 0, hintsUsed: 0, timeTotal: 0 };

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const question = itemsBank[i];
    const correctAns = question.answer;
    
    await page.waitForSelector('.options-grid button');
    
    // Simulate thinking time
    let thinkTime = 5000; 
    let willCorrect = false;
    let hintsToUse = 0;

    if (botType === BOT_TYPES.STRONG) {
      willCorrect = Math.random() < 0.85;
      hintsToUse = Math.random() < 0.1 ? 1 : 0;
      thinkTime = 1000 + Math.random() * 500;
    } else if (botType === BOT_TYPES.WEAK) {
      willCorrect = Math.random() < 0.35;
      hintsToUse = Math.floor(Math.random() * 3) + 1; // 1 to 3 hints
      thinkTime = 2000 + Math.random() * 1000;
    } else if (botType === BOT_TYPES.CARELESS) {
      willCorrect = Math.random() < 0.5;
      hintsToUse = 0;
      thinkTime = 200 + Math.random() * 300; // VERY FAST
    } else { // RANDOM
      willCorrect = Math.random() < 0.25; // 4 options
      hintsToUse = Math.floor(Math.random() * 4);
      thinkTime = 500 + Math.random() * 1000;
    }

    await new Promise(r => setTimeout(r, thinkTime));
    stats.timeTotal += thinkTime;

    // Use hints if planned
    for (let h = 0; h < hintsToUse; h++) {
        // Just click a random wrong answer to trigger hint, then retry
        const wrongOptions = ['A', 'B', 'C', 'D'].filter(opt => opt !== correctAns);
        const randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        
        // Select wrong option
        await page.evaluate((opt) => {
            const btns = Array.from(document.querySelectorAll('.options-grid button'));
            const targetBtn = btns.find(b => b.querySelector('.option-key').innerText === opt);
            if(targetBtn) targetBtn.click();
        }, randomWrong);
        
        // Click Check Answer
        await page.click('.actions .primary-btn');
        await new Promise(r => setTimeout(r, 500));
        
        // Click Hint
        const hintBtn = await page.$('.hint-btn');
        if (hintBtn) {
            await hintBtn.click();
            stats.hintsUsed++;
            await new Promise(r => setTimeout(r, 500));
        }
        
        // Click Retry
        const retryBtn = await page.$('.retry-btn');
        if (retryBtn) {
            await retryBtn.click();
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // Final answer selection
    const finalAns = willCorrect ? correctAns : ['A', 'B', 'C', 'D'].filter(opt => opt !== correctAns)[Math.floor(Math.random() * 3)];
    
    await page.evaluate((opt) => {
        const btns = Array.from(document.querySelectorAll('.options-grid button'));
        const targetBtn = btns.find(b => b.querySelector('.option-key').innerText === opt);
        if(targetBtn) targetBtn.click();
    }, finalAns);

    await page.click('.actions .primary-btn');
    if (willCorrect) stats.correct++;
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Go to next
    const nextBtn = await page.$('.next-btn');
    if (nextBtn) {
        await nextBtn.click();
    } else {
        // If wrong and max hints, maybe it forces next? No, wait, in UI if wrong we can click next if we don't retry? 
        // Wait, UI doesn't have "Next" if wrong. It requires retry.
        // Let's modify DiagnosticTest.jsx to allow Next even if wrong to prevent infinite loop.
        // Actually, if wrong, you MUST retry until right? NO, my UI has retry, but does it have next?
        // Let's check UI logic.
    }
  }

  // To avoid getting stuck, let's just dump localStorage
  console.log(`Đã hoàn thành ${TOTAL_QUESTIONS} câu. Thu thập kết quả...`);
  
  // Go to Dashboard
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.header-btn');
  await page.click('.header-btn');
  await page.waitForSelector('.dashboard-container');
  
  await page.screenshot({ path: `report_${botType}.png`, fullPage: true });

  const studentModel = await page.evaluate(() => JSON.parse(localStorage.getItem('student_model')));
  
  const logData = {
      simulation_id: `sim_${Date.now()}`,
      bot_type: botType,
      total_questions: TOTAL_QUESTIONS,
      accuracy: stats.correct / TOTAL_QUESTIONS,
      avg_hint_used: stats.hintsUsed / TOTAL_QUESTIONS,
      mastery_after: studentModel.skill_mastery,
      zpd_after: studentModel.zpd_band,
      top_errors: studentModel.error_profile
  };

  fs.writeFileSync(`bot_log_${botType}.json`, JSON.stringify(logData, null, 2));
  console.log(`✅ Kết quả Bot [${botType}] đã được lưu vào bot_log_${botType}.json và report_${botType}.png`);
  
  await browser.close();
}

async function main() {
    const type = process.argv[2] || BOT_TYPES.RANDOM;
    if (type === 'all') {
        await runBot(BOT_TYPES.RANDOM);
        await runBot(BOT_TYPES.STRONG);
        await runBot(BOT_TYPES.WEAK);
        await runBot(BOT_TYPES.CARELESS);
    } else {
        await runBot(type);
    }
}

main().catch(console.error);
