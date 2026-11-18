/**
 * Demo data for StudySphere.
 * All dates are relative to TODAY, so the app always looks "live"
 * (e.g. an assignment is always due today, exams are always upcoming).
 *
 * Demo login:  alex@studysphere.io  /  password123
 */
const { addDays } = require('../utils/dates');
const { hashPassword } = require('../utils/password');

/** 56 days of study history (used for streak + analytics charts) */
function buildStudyLog() {
  const baseHours = [4.5, 6, 3.5, 7, 5.5, 2, 4]; // Mon..Sun pattern
  const baseTasks = [3, 5, 2, 6, 4, 1, 3];
  const log = [];
  for (let i = 55; i >= 0; i--) {
    const date = addDays(-i);
    const day = (new Date(date + 'T00:00:00').getDay() + 6) % 7;
    let hours = baseHours[day] + ((55 - i) / 55) * 1.5; // slow upward trend
    let tasksDone = baseTasks[day];
    if (i === 13) { hours = 0; tasksDone = 0; }          // one missed day -> streak resets
    if (i === 0) { hours = 3.5; tasksDone = 2; }         // today so far
    log.push({ date: addDays(-i), hours: Math.round(hours * 2) / 2, tasksDone });
  }
  return log;
}

function buildSeed() {
  return {
    users: [
      {
        id: 1,
        name: 'Alex Johnson',
        email: 'alex@studysphere.io',
        course: 'Computer Science · Year 3',
        passwordHash: hashPassword('password123'),
      },
    ],
    sessions: [],

    tasks: [
      { id: 1, title: 'Complete Data Structures Assignment', category: 'CS301', priority: 'high', progress: 65, done: false, due: addDays(0) },
      { id: 2, title: 'Read Chapter 7 - Organic Chemistry', category: 'CHEM201', priority: 'medium', progress: 30, done: false, due: addDays(1) },
      { id: 3, title: 'Write Literature Review Draft', category: 'ENG401', priority: 'high', progress: 20, done: false, due: addDays(3) },
      { id: 4, title: 'Physics Problem Set #4', category: 'PHY201', priority: 'low', progress: 100, done: true, due: addDays(-2) },
      { id: 5, title: 'Prepare Seminar Presentation Slides', category: 'CS401', priority: 'medium', progress: 50, done: false, due: addDays(5) },
      { id: 6, title: 'Math Tutorial Exercise Set', category: 'MATH301', priority: 'low', progress: 80, done: false, due: addDays(4) },
      { id: 7, title: 'Revise Binary Tree notes', category: 'CS301', priority: 'low', progress: 100, done: true, due: addDays(-1) },
      { id: 8, title: 'Submit lab attendance form', category: 'General', priority: 'low', progress: 100, done: true, due: addDays(-3) },
    ],

    assignments: [
      { id: 1, title: 'Binary Search Tree Implementation', subject: 'CS301', description: 'Implement insert, delete and search operations and write unit tests using JUnit.', progress: 65, status: 'in-progress', due: addDays(0) },
      { id: 2, title: 'Organic Synthesis Lab Report', subject: 'CHEM201', description: 'Document the synthesis of aspirin: reactions, observations, yield calculations and sources of error.', progress: 30, status: 'in-progress', due: addDays(1) },
      { id: 3, title: 'Post-Colonial Literature Review', subject: 'ENG401', description: 'Critically analyse three post-colonial novels on identity, power and resistance.', progress: 20, status: 'pending', due: addDays(7) },
      { id: 4, title: 'Wave Optics Problem Set #4', subject: 'PHY201', description: 'Solve 20 problems on diffraction, interference and polarisation (Chapter 10).', progress: 100, status: 'submitted', due: addDays(-2) },
      { id: 5, title: 'Multivariable Calculus Tutorial', subject: 'MATH301', description: 'Exercises on partial derivatives, gradient vectors and double integrals (Tutorial Sheet 5).', progress: 80, status: 'in-progress', due: addDays(4) },
      { id: 6, title: 'AI Seminar Presentation', subject: 'CS401', description: 'Prepare a 15-minute talk on Transformer architectures and their use in NLP.', progress: 50, status: 'in-progress', due: addDays(9) },
    ],

    exams: [
      { id: 1, subject: 'Data Structures', code: 'CS301', date: addDays(20), prep: 70, room: 'Hall A' },
      { id: 2, subject: 'Organic Chemistry', code: 'CHEM201', date: addDays(22), prep: 55, room: 'Hall B' },
      { id: 3, subject: 'Calculus III', code: 'MATH301', date: addDays(27), prep: 40, room: 'Hall A' },
      { id: 4, subject: 'English Literature', code: 'ENG401', date: addDays(30), prep: 25, room: 'Hall C' },
    ],

    notes: [
      { id: 1, title: 'Big-O Cheat Sheet', subject: 'CS301', icon: '💡', favorite: true, updatedAt: addDays(-8), content: 'Time and space complexities at a glance:\n- O(1) hash lookups\n- O(log n) binary search\n- O(n log n) merge sort\n- O(n^2) bubble sort\nAlways state best, average and worst case.' },
      { id: 2, title: 'SN1 vs SN2 Mechanisms', subject: 'CHEM201', icon: '⚗️', favorite: true, updatedAt: addDays(-10), content: 'SN1 is unimolecular, forms a carbocation and gives racemisation. SN2 is bimolecular with backside attack and inverts configuration (Walden inversion). Tertiary substrates favour SN1, primary favour SN2.' },
      { id: 3, title: 'Binary Trees & Graph Traversal', subject: 'CS301', icon: '🌳', favorite: false, updatedAt: addDays(-7), content: 'DFS uses a stack and goes as deep as possible. BFS uses a queue and goes level by level. Inorder traversal of a BST gives sorted output. Pre/post order is used for expression trees.' },
      { id: 4, title: 'Things Fall Apart - Analysis', subject: 'ENG401', icon: '📖', favorite: false, updatedAt: addDays(-9), content: "Achebe's critique of colonialism through Okonkwo's fall. Themes: masculinity, tradition vs change, impact of colonial rule on Igbo culture. The narrative voice mirrors oral tradition." },
      { id: 5, title: 'Partial Derivatives & Gradient', subject: 'MATH301', icon: '∑', favorite: false, updatedAt: addDays(-11), content: 'df/dx treats y as constant. The gradient points in the direction of steepest ascent. Critical points occur where the gradient is zero. Use the Hessian matrix for the second derivative test.' },
      { id: 6, title: 'Wave-Particle Duality', subject: 'PHY201', icon: '⚡', favorite: false, updatedAt: addDays(-13), content: 'de Broglie wavelength = h / p. The double-slit experiment shows the wave nature of electrons. Heisenberg: dx * dp >= h-bar / 2.' },
      { id: 7, title: 'Transformer Architecture', subject: 'CS401', icon: '🤖', favorite: false, updatedAt: addDays(-14), content: 'Self-attention uses Q, K and V matrices. Multi-head attention looks at different positions at once. Positional encoding replaces recurrence. BERT is encoder-only, GPT is decoder-only.' },
      { id: 8, title: 'Aspirin Synthesis - Lab Observations', subject: 'CHEM201', icon: '🧪', favorite: false, updatedAt: addDays(-16), content: 'Esterification of salicylic acid with acetic anhydride, catalyst H2SO4. Theoretical yield 2.84 g, actual 2.41 g, so 84.9% yield. Errors: incomplete reaction and loss during filtration.' },
    ],

    // day: Monday = 0 ... Sunday = 6, start: hour in 24h format
    timetable: [
      { id: 1, day: 0, start: 9, code: 'CS301', subject: 'Data Structures', room: 'Rm 301' },
      { id: 2, day: 2, start: 9, code: 'CS301', subject: 'Data Structures', room: 'Rm 301' },
      { id: 3, day: 4, start: 9, code: 'CS301', subject: 'Data Structures', room: 'Rm 301' },
      { id: 4, day: 1, start: 11, code: 'CHEM201', subject: 'Organic Chemistry', room: 'Lab 2' },
      { id: 5, day: 3, start: 11, code: 'CHEM201', subject: 'Organic Chemistry', room: 'Lab 2' },
      { id: 6, day: 5, start: 11, code: 'CHEM201', subject: 'Chemistry Lab', room: 'Lab 1' },
      { id: 7, day: 0, start: 13, code: 'PHY201', subject: 'Physics', room: 'Rm 202' },
      { id: 8, day: 2, start: 13, code: 'PHY201', subject: 'Physics Lab', room: 'Lab 3' },
      { id: 9, day: 4, start: 13, code: 'PHY201', subject: 'Physics', room: 'Rm 202' },
      { id: 10, day: 1, start: 14, code: 'ENG401', subject: 'English Literature', room: 'Rm 104' },
      { id: 11, day: 2, start: 14, code: 'ENG401', subject: 'English Literature', room: 'Rm 104' },
      { id: 12, day: 4, start: 14, code: 'ENG401', subject: 'English Seminar', room: 'Rm 105' },
      { id: 13, day: 0, start: 16, code: 'MATH301', subject: 'Calculus III', room: 'Rm 201' },
      { id: 14, day: 2, start: 16, code: 'MATH301', subject: 'Calculus III', room: 'Rm 201' },
      { id: 15, day: 3, start: 16, code: 'MATH301', subject: 'Math Tutorial', room: 'Rm 203' },
    ],

    subjects: [
      { code: 'CS301', name: 'Data Structures', score: 85, target: 90 },
      { code: 'CHEM201', name: 'Organic Chemistry', score: 72, target: 85 },
      { code: 'ENG401', name: 'English Literature', score: 90, target: 85 },
      { code: 'PHY201', name: 'Physics', score: 68, target: 80 },
      { code: 'MATH301', name: 'Calculus III', score: 78, target: 85 },
      { code: 'CS401', name: 'AI Seminar', score: 88, target: 90 },
    ],

    studyLog: buildStudyLog(),

    focusSessions: [
      { id: 1, minutes: 25, date: addDays(-2) },
      { id: 2, minutes: 25, date: addDays(-2) },
      { id: 3, minutes: 25, date: addDays(-1) },
      { id: 4, minutes: 25, date: addDays(-1) },
      { id: 5, minutes: 25, date: addDays(0) },
      { id: 6, minutes: 25, date: addDays(0) },
    ],
  };
}

module.exports = { buildSeed };
