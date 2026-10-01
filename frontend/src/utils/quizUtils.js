/**
 * PREPRIA Safe Quiz Option Randomization & Grading Utility
 * 
 * Prevents predictable correct-answer patterns (e.g., A, A, A, B, C, C, C)
 * while strictly preserving:
 * 1. Semantic truth and correct answer validity.
 * 2. Entire option objects (id, text, isCorrect, explanation, feedback).
 * 3. Question-explanation binding.
 * 4. Standard ordering for binary choices (True/False, Yes/No).
 * 5. Positional choices ("All of the above", "None of the above") pinned to the end.
 * 6. Multi-select correct answer sets (correctIndices / correctAnswers).
 * 7. Accurate submission payload mapping to backend grading keys.
 */

export const BINARY_OPTION_PATTERNS = [
  ['true', 'false'],
  ['yes', 'no']
];

export const POSITIONAL_OPTION_PATTERNS = [
  /^all\s+of\s+the\s+above/i,
  /^none\s+of\s+the\s+above/i,
  /^both\s+[a-d]\s+and\s+[a-d]/i,
  /^neither\s+[a-d]\s+nor\s+[a-d]/i
];

/**
 * Normalizes option to text string for comparison/pattern matching.
 */
export function getOptionText(opt) {
  if (opt === null || opt === undefined) return '';
  if (typeof opt === 'object') {
    return String(opt.text || opt.label || opt.value || opt.id || '').trim();
  }
  return String(opt).trim();
}

/**
 * Checks if an option is equal to another option (handles string or object).
 */
export function areOptionsEqual(optA, optB) {
  if (optA === optB) return true;
  if (typeof optA === 'object' && typeof optB === 'object' && optA && optB) {
    if (optA.id && optB.id) return optA.id === optB.id;
    if (optA.value && optB.value) return optA.value === optB.value;
    return getOptionText(optA) === getOptionText(optB);
  }
  return getOptionText(optA) === getOptionText(optB);
}

/**
 * Checks if a question has binary True/False or Yes/No options.
 */
export function isBinaryChoice(options) {
  if (!Array.isArray(options) || options.length !== 2) return false;
  const clean = options.map(o => getOptionText(o).toLowerCase());
  return BINARY_OPTION_PATTERNS.some(
    ([first, second]) => (clean[0] === first && clean[1] === second) || (clean[0] === second && clean[1] === first)
  );
}

/**
 * Checks if an option represents a positional choice (e.g. All of the above).
 */
export function isPositionalOption(option) {
  const text = getOptionText(option);
  if (!text) return false;
  return POSITIONAL_OPTION_PATTERNS.some(rx => rx.test(text));
}

/**
 * Deterministic PRNG using a string or number seed.
 */
export function createSeededRandom(seed) {
  let s = 0;
  if (typeof seed === 'number') {
    s = seed;
  } else if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      s = ((s << 5) - s) + seed.charCodeAt(i);
      s |= 0;
    }
  } else {
    s = Math.floor(Math.random() * 1000000);
  }
  
  return function nextRandom() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Safely shuffles an array using Fisher-Yates with a given RNG function.
 */
export function fisherYatesShuffle(array, rng = Math.random) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffles the options of a single question and updates correctIndex / correctIndices.
 * 
 * @param {Object} question - The raw question object
 * @param {Function} rng - PRNG function
 * @param {number|null} avoidIndex - An index to avoid if possible (prevents repeating runs)
 * @returns {Object} A new question object with randomized options and updated indices.
 */
export function randomizeQuestionOptions(question, rng = Math.random, avoidIndex = null) {
  if (!question || !Array.isArray(question.options) || question.options.length <= 1) {
    return { ...question };
  }

  const rawOptions = [...question.options];
  
  // Identify originally correct option values / objects
  const isMultiSelect = Array.isArray(question.correctIndices) || Array.isArray(question.correctAnswers);
  let correctOptionValues = [];

  if (Array.isArray(question.correctIndices)) {
    correctOptionValues = question.correctIndices.map(idx => rawOptions[idx]).filter(Boolean);
  } else if (Array.isArray(question.correctAnswers)) {
    correctOptionValues = rawOptions.filter(opt => question.correctAnswers.includes(getOptionText(opt)));
  } else {
    const origCorrectIdx = typeof question.correctIndex === 'number' ? question.correctIndex : 0;
    const correctOpt = rawOptions[origCorrectIdx] !== undefined ? rawOptions[origCorrectIdx] : rawOptions[0];
    correctOptionValues = [correctOpt];
  }

  // 1. Binary choices: preserve canonical order ("True" / "Yes" first, "False" / "No" second)
  if (isBinaryChoice(rawOptions)) {
    const isFirstTrueOrYes = /^(true|yes)$/i.test(getOptionText(rawOptions[0]));
    const canonicalOptions = isFirstTrueOrYes ? [rawOptions[0], rawOptions[1]] : [rawOptions[1], rawOptions[0]];
    
    if (isMultiSelect) {
      const newIndices = correctOptionValues
        .map(co => canonicalOptions.findIndex(o => areOptionsEqual(o, co)))
        .filter(idx => idx !== -1);
      return {
        ...question,
        options: canonicalOptions,
        correctIndices: newIndices,
        correctIndex: newIndices[0] ?? 0
      };
    }

    const newCorrectIdx = canonicalOptions.findIndex(o => areOptionsEqual(o, correctOptionValues[0]));
    return {
      ...question,
      options: canonicalOptions,
      correctIndex: newCorrectIdx !== -1 ? newCorrectIdx : (question.correctIndex ?? 0)
    };
  }

  // 2. Separate standard options from positional options ("All of the above", "None of the above")
  const standardOpts = [];
  const positionalOpts = [];

  rawOptions.forEach(opt => {
    if (isPositionalOption(opt)) {
      positionalOpts.push(opt);
    } else {
      standardOpts.push(opt);
    }
  });

  // Shuffle standard options
  let shuffledStandard = fisherYatesShuffle(standardOpts, rng);

  // Reassemble full options with positional options pinned at the end
  let newOptions = [...shuffledStandard, ...positionalOpts];

  // If single-select correct option is in standardOpts and ended up at avoidIndex, shift standard options
  if (
    !isMultiSelect &&
    avoidIndex !== null &&
    avoidIndex >= 0 &&
    avoidIndex < newOptions.length &&
    areOptionsEqual(newOptions[avoidIndex], correctOptionValues[0]) &&
    shuffledStandard.length > 2
  ) {
    shuffledStandard = [shuffledStandard[shuffledStandard.length - 1], ...shuffledStandard.slice(0, shuffledStandard.length - 1)];
    newOptions = [...shuffledStandard, ...positionalOpts];
  }

  if (isMultiSelect) {
    const newCorrectIndices = correctOptionValues
      .map(co => newOptions.findIndex(opt => areOptionsEqual(opt, co)))
      .filter(idx => idx !== -1)
      .sort((a, b) => a - b);

    return {
      ...question,
      options: newOptions,
      correctIndices: newCorrectIndices,
      correctIndex: newCorrectIndices[0] ?? 0
    };
  }

  const newCorrectIdx = newOptions.findIndex(opt => areOptionsEqual(opt, correctOptionValues[0]));

  return {
    ...question,
    options: newOptions,
    correctIndex: newCorrectIdx !== -1 ? newCorrectIdx : (question.correctIndex ?? 0)
  };
}

/**
 * Randomizes options across an entire list of questions for a quiz or final assessment.
 * Ensures balanced option distributions and prevents repetitive correct-answer patterns.
 * 
 * @param {Array} questions - Array of question objects
 * @param {string|number|null} seed - Optional seed for deterministic reproduction
 * @returns {Array} Shuffled questions with updated correctIndex / correctIndices
 */
export function randomizeQuizQuestions(questions, seed = null) {
  if (!Array.isArray(questions) || questions.length === 0) return [];

  const rng = seed !== null ? createSeededRandom(seed) : Math.random;
  const result = [];
  let consecutiveCount = 1;
  let lastCorrectIndex = -1;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    // If last two questions had the same correctIndex, actively avoid that index for this question
    const avoidIndex = consecutiveCount >= 2 ? lastCorrectIndex : null;
    
    const randomized = randomizeQuestionOptions(q, rng, avoidIndex);
    
    if (randomized.correctIndex === lastCorrectIndex) {
      consecutiveCount += 1;
    } else {
      consecutiveCount = 1;
      lastCorrectIndex = randomized.correctIndex;
    }

    result.push(randomized);
  }

  return result;
}
