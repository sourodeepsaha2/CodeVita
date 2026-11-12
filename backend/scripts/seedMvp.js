require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/user');
const Problem = require('../src/models/problem');

const read = (lines) => `const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);\n${lines}`;
const js = (body) => ({ language: 'javascript', CompleteCode: read(body), initialCode: read(body) });
const problems = [
  {
    title: 'Pair Sum', difficulty: 'Easy', tags: 'Array',
    description: 'Given an integer array and a target, return the indices of the two distinct values whose sum equals the target. Input: n, n integers, then target. Print the two indices in ascending order.',
    solution: `const n = Number(lines[0]); const nums = lines.slice(1, n + 1).map(Number); const target = Number(lines[n + 1]); const seen = new Map(); let answer = [-1, -1]; for (let i = 0; i < n; i++) { const other = target - nums[i]; if (seen.has(other)) { answer = [seen.get(other), i]; break; } seen.set(nums[i], i); } console.log(answer.join(' '));`,
    cases: [['4\n2 7 11 15\n9', '0 1'], ['3\n3 2 4\n6', '1 2'], ['2\n3 3\n6', '0 1']],
  },
  {
    title: 'Maximum Subarray', difficulty: 'Medium', tags: 'Array',
    description: 'Find the largest sum of any non-empty contiguous subarray. Input: n followed by n integers. Print the maximum sum.',
    solution: `const n = Number(lines[0]); const nums = lines.slice(1, n + 1).map(Number); let best = nums[0], current = nums[0]; for (let i = 1; i < n; i++) { current = Math.max(nums[i], current + nums[i]); best = Math.max(best, current); } console.log(best);`,
    cases: [['9\n-2 1 -3 4 -1 2 1 -5 4', '6'], ['5\n5 4 -1 7 8', '23'], ['3\n-8 -2 -5', '-2']],
  },
  {
    title: 'Valid Brackets', difficulty: 'Easy', tags: 'Stack',
    description: 'Return true when every opening bracket is closed by the right type in the correct order. Input is one line containing brackets. Print true or false.',
    solution: `const s = lines.join(''); const stack = []; const pairs = { ')': '(', ']': '[', '}': '{' }; let valid = true; for (const ch of s) { if ('([{'.includes(ch)) stack.push(ch); else if (stack.pop() !== pairs[ch]) { valid = false; break; } } console.log(valid && stack.length === 0 ? 'true' : 'false');`,
    cases: [['()[]{}', 'true'], ['(]', 'false'], ['{[]}', 'true']],
  },
  {
    title: 'First Unique Character', difficulty: 'Easy', tags: 'String',
    description: 'Find the index of the first character that appears exactly once, or print -1 if none exists. Input is one lowercase string.',
    solution: `const s = lines.join(''); const counts = new Map(); for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1); console.log([...s].findIndex(ch => counts.get(ch) === 1));`,
    cases: [['leetcode', '0'], ['aabb', '-1'], ['loveleetcode', '2']],
  },
  {
    title: 'Binary Search', difficulty: 'Easy', tags: 'Array',
    description: 'Given a sorted integer array and a target, return its index or -1 if absent. Input: n, n sorted integers, then target.',
    solution: `const n = Number(lines[0]); const nums = lines.slice(1, n + 1).map(Number); const target = Number(lines[n + 1]); let lo = 0, hi = n - 1, answer = -1; while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); if (nums[mid] === target) { answer = mid; break; } if (nums[mid] < target) lo = mid + 1; else hi = mid - 1; } console.log(answer);`,
    cases: [['6\n-1 0 3 5 9 12\n9', '4'], ['4\n1 3 5 7\n2', '-1'], ['1\n5\n5', '0']],
  },
  {
    title: 'Climbing Steps', difficulty: 'Easy', tags: 'DP',
    description: 'You can climb one or two steps at a time. Count the distinct ways to reach step n. Input is n; print the number of ways.',
    solution: `const n = Number(lines[0]); let a = 1, b = 1; for (let i = 2; i <= n; i++) { [a, b] = [b, a + b]; } console.log(n === 0 ? 1 : b);`,
    cases: [['2', '2'], ['3', '3'], ['5', '8']],
  },
  {
    title: 'Move Zeroes', difficulty: 'Easy', tags: 'Array',
    description: 'Move all zeroes to the end while preserving the relative order of non-zero values. Input: n followed by n integers. Print the resulting array.',
    solution: `const n = Number(lines[0]); const nums = lines.slice(1, n + 1).map(Number); const result = nums.filter(x => x !== 0).concat(nums.filter(x => x === 0)); console.log(result.join(' '));`,
    cases: [['5\n0 1 0 3 12', '1 3 12 0 0'], ['3\n0 0 1', '1 0 0'], ['4\n1 2 3 4', '1 2 3 4']],
  },
  {
    title: 'Contains Duplicate', difficulty: 'Easy', tags: 'Array',
    description: 'Determine whether any value appears at least twice. Input: n followed by n integers. Print true or false.',
    solution: `const n = Number(lines[0]); const nums = lines.slice(1, n + 1); console.log(new Set(nums).size !== n ? 'true' : 'false');`,
    cases: [['4\n1 2 3 1', 'true'], ['4\n1 2 3 4', 'false'], ['3\n0 0 1', 'true']],
  },
  {
    title: 'Product Except Self', difficulty: 'Medium', tags: 'Array',
    description: 'Return an array where each position is the product of all other values. Do not use division. Input: n followed by n integers.',
    solution: `const n = Number(lines[0]); const nums = lines.slice(1, n + 1).map(Number); const result = Array(n).fill(1); let prefix = 1; for (let i = 0; i < n; i++) { result[i] = prefix; prefix *= nums[i]; } let suffix = 1; for (let i = n - 1; i >= 0; i--) { result[i] *= suffix; suffix *= nums[i]; } console.log(result.join(' '));`,
    cases: [['4\n1 2 3 4', '24 12 8 6'], ['3\n-1 1 0', '0 0 -1'], ['2\n3 5', '5 3']],
  },
  {
    title: 'Longest Unique Window', difficulty: 'Medium', tags: 'String',
    description: 'Return the length of the longest substring with no repeated characters. Input is one line of text.',
    solution: `const s = lines.join(' '); const last = new Map(); let start = 0, best = 0; for (let i = 0; i < s.length; i++) { if (last.has(s[i])) start = Math.max(start, last.get(s[i]) + 1); last.set(s[i], i); best = Math.max(best, i - start + 1); } console.log(best);`,
    cases: [['abcabcbb', '3'], ['bbbbb', '1'], ['pwwkew', '3']],
  },
].map((item) => {
  const reference = js(item.solution);
  const starterCode = read('// TODO: solve the problem and print the result.');
  return {
    title: item.title,
    description: item.description,
    difficulty: item.difficulty,
    tags: item.tags,
    visibleTestCases: item.cases.slice(0, 1).map(([input, output]) => ({ input, output, explanation: 'Use the constraints and ordering rules described above to derive the result.' })),
    hiddenTestCases: item.cases.slice(1).map(([input, output]) => ({ input, output })),
    startCode: [{ language: 'javascript', CompleteCode: starterCode }],
    referenceSolution: [{ language: reference.language, initialCode: reference.initialCode }],
  };
});

async function seed() {
  if (!process.env.DB_CONNECT_STRING) throw new Error('DB_CONNECT_STRING is required.');
  const emailId = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!emailId || !password || password.length < 12) throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.');
  await mongoose.connect(process.env.DB_CONNECT_STRING);
  let admin = await User.findOne({ emailId });
  if (!admin) {
    const [firstName, ...lastName] = (process.env.ADMIN_NAME || 'Code Vita Admin').trim().split(/\s+/);
    admin = await User.create({ firstName, lastName: lastName.join(' ') || 'Admin', emailId, password: await bcrypt.hash(password, 10), role: 'admin' });
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    admin.password = await bcrypt.hash(password, 10);
    await admin.save();
  }
  for (const problem of problems) {
    await Problem.findOneAndUpdate({ title: problem.title }, { ...problem, problemCreator: admin._id }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  }
  console.log(`Seeded ${problems.length} Code Vita practice problems.`);
}

if (require.main === module) {
  seed().catch((error) => { console.error('Could not seed Code Vita:', error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
}

module.exports = { seed, problems };
