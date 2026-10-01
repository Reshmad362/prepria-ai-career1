import { coursesData } from '../frontend/src/data/coursesData.js';
import { randomizeQuizQuestions } from '../frontend/src/utils/quizUtils.js';

let totalQuestions = 0;
const countsBefore = { A: 0, B: 0, C: 0, D: 0 };
const countsAfter = { A: 0, B: 0, C: 0, D: 0 };

let maxRunBefore = 0;
let maxRunAfter = 0;

const posLetters = ['A', 'B', 'C', 'D'];

const courseStats = [];

coursesData.forEach(course => {
  let cQuestions = 0;
  let cBefore = { A: 0, B: 0, C: 0, D: 0 };
  let cAfter = { A: 0, B: 0, C: 0, D: 0 };
  let cRunBefore = 0;
  let cMaxRunBefore = 0;
  let lastPosBefore = null;

  let cRunAfter = 0;
  let cMaxRunAfter = 0;
  let lastPosAfter = null;

  const allCourseQuestions = [];

  (course.modules || []).forEach(mod => {
    const items = mod.items || mod.lessons || [];
    items.forEach(it => {
      const qList = it.quiz?.questions || it.questions || [];
      if (qList.length > 0) {
        allCourseQuestions.push(...qList);
      }
    });
  });

  if (course.finalAssessment?.questions) {
    allCourseQuestions.push(...course.finalAssessment.questions);
  }

  // Evaluate Before
  allCourseQuestions.forEach(q => {
    totalQuestions++;
    cQuestions++;
    const idx = q.correctIndex !== undefined ? q.correctIndex : 0;
    const letter = posLetters[idx] || 'A';
    countsBefore[letter] = (countsBefore[letter] || 0) + 1;
    cBefore[letter] = (cBefore[letter] || 0) + 1;

    if (letter === lastPosBefore) {
      cRunBefore++;
    } else {
      cRunBefore = 1;
      lastPosBefore = letter;
    }
    if (cRunBefore > cMaxRunBefore) cMaxRunBefore = cRunBefore;
    if (cRunBefore > maxRunBefore) maxRunBefore = cRunBefore;
  });

  // Evaluate After (using randomizeQuizQuestions with deterministic seed per quiz section)
  (course.modules || []).forEach(mod => {
    const items = mod.items || mod.lessons || [];
    items.forEach(it => {
      const qList = it.quiz?.questions || it.questions || [];
      if (qList.length > 0) {
        const randomized = randomizeQuizQuestions(qList, `${course.id}_${it.id}`);
        randomized.forEach(q => {
          const idx = q.correctIndex !== undefined ? q.correctIndex : 0;
          const letter = posLetters[idx] || 'A';
          countsAfter[letter] = (countsAfter[letter] || 0) + 1;
          cAfter[letter] = (cAfter[letter] || 0) + 1;

          if (letter === lastPosAfter) {
            cRunAfter++;
          } else {
            cRunAfter = 1;
            lastPosAfter = letter;
          }
          if (cRunAfter > cMaxRunAfter) cMaxRunAfter = cRunAfter;
          if (cRunAfter > maxRunAfter) maxRunAfter = cRunAfter;
        });
      }
    });
  });

  if (course.finalAssessment?.questions) {
    const randomized = randomizeQuizQuestions(course.finalAssessment.questions, `${course.id}_final`);
    randomized.forEach(q => {
      const idx = q.correctIndex !== undefined ? q.correctIndex : 0;
      const letter = posLetters[idx] || 'A';
      countsAfter[letter] = (countsAfter[letter] || 0) + 1;
      cAfter[letter] = (cAfter[letter] || 0) + 1;

      if (letter === lastPosAfter) {
        cRunAfter++;
      } else {
        cRunAfter = 1;
        lastPosAfter = letter;
      }
      if (cRunAfter > cMaxRunAfter) cMaxRunAfter = cRunAfter;
      if (cRunAfter > maxRunAfter) maxRunAfter = cRunAfter;
    });
  }

  courseStats.push({
    id: course.id,
    title: course.title,
    total: cQuestions,
    before: cBefore,
    maxRunBefore: cMaxRunBefore,
    after: cAfter,
    maxRunAfter: cMaxRunAfter
  });
});

console.log("=== PREPRIA QUIZ ANSWER POSITION DISTRIBUTION AUDIT ===");
console.log(`Total Courses: ${coursesData.length}`);
console.log(`Total Questions Audited: ${totalQuestions}`);
console.log("\nBEFORE RANDOMIZATION:");
console.log(`A: ${countsBefore.A} (${((countsBefore.A / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`B: ${countsBefore.B} (${((countsBefore.B / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`C: ${countsBefore.C} (${((countsBefore.C / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`D: ${countsBefore.D} (${((countsBefore.D / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`Longest identical-position run: ${maxRunBefore}`);

console.log("\nAFTER RANDOMIZATION:");
console.log(`A: ${countsAfter.A} (${((countsAfter.A / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`B: ${countsAfter.B} (${((countsAfter.B / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`C: ${countsAfter.C} (${((countsAfter.C / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`D: ${countsAfter.D} (${((countsAfter.D / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`Longest identical-position run: ${maxRunAfter}`);

console.log("\nSAMPLE COURSE BREAKDOWNS:");
courseStats.slice(0, 5).forEach(cs => {
  console.log(`\nCourse: ${cs.title} (${cs.id}) - ${cs.total} questions`);
  console.log(`  Before: A=${cs.before.A}, B=${cs.before.B}, C=${cs.before.C}, D=${cs.before.D} | MaxRun=${cs.maxRunBefore}`);
  console.log(`  After:  A=${cs.after.A}, B=${cs.after.B}, C=${cs.after.C}, D=${cs.after.D} | MaxRun=${cs.maxRunAfter}`);
});
