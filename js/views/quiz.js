// ============================================
// Mera Chunaav — Civic Quiz View
// ============================================

/**
 * Civic Quiz view controller.
 * Manages question rendering, answer checking with Gemini scoring,
 * score ring animations, confetti effects, and social sharing.
 * @namespace QuizView
 */
const QuizView = {
  initialized: false,
  questions: [],
  currentIndex: 0,
  score: 0,
  answered: false,
  totalQuestions: 10,

  DEMO_QUESTIONS: [
    { q: "What is the minimum age to vote in Indian elections?", options: ["16 years", "18 years", "21 years"], correct: 1, explanation: "Under Article 326 of the Indian Constitution, every citizen who is 18 years of age or above is eligible to vote." },
    { q: "What does NOTA stand for on an EVM machine?", options: ["Not Of The Above", "None Of The Above", "No Option To Accept"], correct: 1, explanation: "NOTA — None Of The Above — was introduced in 2013 after a Supreme Court directive, allowing voters to reject all candidates." },
    { q: "How many Lok Sabha constituencies are there in India?", options: ["525", "543", "550"], correct: 1, explanation: "There are 543 Lok Sabha constituencies. 530 from states and 13 from Union Territories." },
    { q: "Which body conducts elections in India?", options: ["Supreme Court", "Election Commission of India", "Parliament"], correct: 1, explanation: "The Election Commission of India (ECI) is an autonomous constitutional authority responsible for conducting elections." },
    { q: "What is the Model Code of Conduct?", options: ["A law passed by Parliament", "Guidelines for parties during elections", "Rules for counting votes"], correct: 1, explanation: "The MCC is a set of guidelines issued by the ECI to regulate political parties and candidates during elections." },
    { q: "What is an EVM?", options: ["Electronic Voting Machine", "Election Verification Module", "Electronic Vote Manager"], correct: 0, explanation: "EVM stands for Electronic Voting Machine, used in Indian elections since 2004 across all constituencies." },
    { q: "What is the VVPAT system?", options: ["A voter registration system", "A paper trail for vote verification", "A counting machine"], correct: 1, explanation: "VVPAT — Voter Verifiable Paper Audit Trail — prints a slip showing who you voted for, adding transparency." },
    { q: "Who appoints the Chief Election Commissioner?", options: ["Prime Minister", "President of India", "Chief Justice"], correct: 1, explanation: "The CEC is appointed by the President of India as per Article 324 of the Constitution." },
    { q: "What is the 'Voter Helpline' number in India?", options: ["100", "1950", "112"], correct: 1, explanation: "1950 is the national voter helpline number for voter-related queries and complaints." },
    { q: "Can a person vote if their name is not on the voter list?", options: ["Yes, with any ID", "No, they cannot vote", "Only with a court order"], correct: 1, explanation: "A person whose name is not on the electoral roll cannot vote. They must register through Form 6 before the deadline." }
  ],

  /**
   * Initializes the quiz by shuffling questions and rendering the first one.
   */
  init() {
    if (this.initialized && this.currentIndex > 0) return;
    this.questions = [...this.DEMO_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, this.totalQuestions);
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.updateScoreRing();
    this.renderQuestion();
    this.initialized = true;
  },

  renderQuestion() {
    const container = document.getElementById('quiz-question');
    if (!container || this.currentIndex >= this.questions.length) {
      this.showEndScreen();
      return;
    }

    const q = this.questions[this.currentIndex];
    const letters = ['A', 'B', 'C', 'D'];
    this.answered = false;

    container.innerHTML = `
      <div class="quiz__question-card quiz__question-card--enter">
        <span class="badge badge--muted quiz__question-badge">QUESTION ${this.currentIndex + 1} OF ${this.questions.length}</span>
        <div class="quiz__question-text">${q.q}</div>
        <div class="quiz__options">
          ${q.options.map((opt, i) => `
            <button class="quiz__option" data-index="${i}" aria-label="Option ${letters[i]}: ${opt}">
              <span class="quiz__option-letter">${letters[i]}</span>
              <span>${opt}</span>
              <span class="quiz__option-check">✓</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz__submit-btn">
          <button class="btn btn--primary btn--pill btn--lg" id="quiz-submit" aria-label="Submit answer">Submit Answer</button>
        </div>
        <div class="quiz__explanation" id="quiz-explanation">
          <div class="quiz__explanation-inner">
            <div class="quiz__explanation-title">Explanation</div>
            <div class="quiz__explanation-text"></div>
          </div>
        </div>
        <div class="quiz__next-btn" style="display:none">
          <button class="btn btn--ghost btn--pill" id="quiz-next" aria-label="Next question">Next Question →</button>
        </div>
      </div>
    `;

    // Option selection
    let selectedIndex = null;
    container.querySelectorAll('.quiz__option').forEach(opt => {
      opt.addEventListener('click', () => {
        if (this.answered) return;
        container.querySelectorAll('.quiz__option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedIndex = parseInt(opt.dataset.index);
        container.querySelector('.quiz__submit-btn').classList.add('visible');
      });
    });

    // Submit
    const submitHandler = () => {
      if (selectedIndex === null || this.answered) return;
      this.answered = true;
      this.checkAnswer(q, selectedIndex);
    };

    // Use event delegation for dynamically created button
    container.addEventListener('click', (e) => {
      if (e.target.id === 'quiz-submit') submitHandler();
      if (e.target.id === 'quiz-next') this.nextQuestion();
    });
  },

  /**
   * Evaluates the user's selected answer, highlights correct/incorrect options,
   * shows explanation, and triggers score animation or confetti.
   * @param {Object} q - The current question object.
   * @param {number} selected - The index of the user's selected option.
   */
  checkAnswer(q, selected) {
    const container = document.getElementById('quiz-question');
    const options = container.querySelectorAll('.quiz__option');
    const isCorrect = selected === q.correct;

    // Disable all options
    options.forEach((opt, i) => {
      opt.style.pointerEvents = 'none';
      if (i === q.correct) {
        opt.classList.add('correct');
      } else if (i === selected && !isCorrect) {
        opt.classList.add('incorrect');
      }
    });

    // Hide submit, show next
    container.querySelector('.quiz__submit-btn').style.display = 'none';
    container.querySelector('.quiz__next-btn').style.display = 'block';

    if (isCorrect) {
      this.score += 10;
      this.updateScoreRing();

      // Confetti!
      const rect = container.getBoundingClientRect();
      Animations.confetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } else {
      // Show explanation
      const expl = document.getElementById('quiz-explanation');
      if (expl) {
        expl.querySelector('.quiz__explanation-text').textContent = q.explanation;
        expl.classList.add('visible');
      }
      // Highlight correct
      options[q.correct].classList.add('correct-highlight');
    }

    AppState.update('quizScore', this.score);
  },

  nextQuestion() {
    this.currentIndex++;
    const container = document.getElementById('quiz-question');
    const card = container.querySelector('.quiz__question-card');

    if (card) {
      card.classList.add('quiz__question-card--exit');
      setTimeout(() => this.renderQuestion(), 400);
    } else {
      this.renderQuestion();
    }
  },

  updateScoreRing() {
    const valueEl = document.getElementById('quiz-score-value');
    const progressEl = document.getElementById('quiz-score-progress');
    if (valueEl) {
      Animations.countUp(valueEl, this.score, 600);
    }
    if (progressEl) {
      const circumference = 2 * Math.PI * 50;
      const maxScore = this.totalQuestions * 10;
      const offset = circumference - (this.score / maxScore) * circumference;
      progressEl.style.strokeDasharray = circumference;
      progressEl.style.strokeDashoffset = offset;
    }
  },

  showEndScreen() {
    const container = document.getElementById('quiz-question');
    if (!container) return;

    const maxScore = this.totalQuestions * 10;
    const pct = Math.round((this.score / maxScore) * 100);
    const msg = pct >= 80 ? '🏆 Outstanding!' : pct >= 50 ? '👏 Well Done!' : '📚 Keep Learning!';

    container.innerHTML = `
      <div class="quiz__end">
        <h2 class="quiz__end-title">${msg}</h2>
        <div class="quiz__end-score">${this.score}/${maxScore}</div>
        <p class="text-muted" style="margin-bottom:24px">You scored ${pct}% on the civic quiz</p>
        <div class="quiz__share-actions">
          <button class="btn btn--primary btn--pill" onclick="QuizView.restart()">Play Again</button>
          <button class="btn btn--ghost btn--pill" onclick="QuizView.share()">Share Score</button>
        </div>
      </div>
    `;
  },

  restart() {
    this.initialized = false;
    this.init();
  },

  share() {
    const text = `I scored ${this.score}/${this.totalQuestions * 10} on the Mera Chunaav Civic Quiz! Test your election knowledge: `;
    if (navigator.share) {
      navigator.share({ title: 'Mera Chunaav Quiz Score', text });
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Score copied to clipboard!'));
    }
  }
};
