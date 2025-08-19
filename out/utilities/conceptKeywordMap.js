"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conceptRegexMap = exports.conceptKeywordMap = void 0;
exports.conceptKeywordMap = {
    // JavaScript: Async
    Promises: ["new Promise", ".then(", ".catch("],
    "Async/Await": ["async function", "await "],
    "Fetch API": ["fetch(", "axios.get(", "axios.post("],
    // React
    "React Components": ["function ", "return (", "export default"],
    JSX: ["return (", "<div>", "<h1>", "</>"],
    "React State": ["useState(", "this.state", "this.setState"],
    "React Props": ["props.", "({ props", "function Component(props)"],
    useEffect: ["useEffect("],
    "React Hooks": ["useState(", "useEffect(", "useContext(", "useReducer("],
    // General JavaScript
    "Arrow Functions": ["=>"],
    "Array Methods": [".map(", ".filter(", ".reduce(", ".forEach("],
    // Node.js / Express
    "Express.js": ["const express", "app.get(", "app.post(", "app.use("],
    Middleware: ["next(", "app.use("],
    Routing: ["app.get(", "app.post(", "router.get("],
    // SQL
    "SQL Joins": ["JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN"],
    "SQL Select": ["SELECT ", "FROM ", "WHERE "],
    // Auth / Security
    Authentication: ["jwt.sign(", "bcrypt.hash(", "passport.authenticate("],
    JWT: ["jwt.sign(", "jwt.verify("],
    // Git
    "Git Basics": ["git init", "git add", "git commit", "git status"],
    "Branches & Merging": ["git checkout -b", "git merge", "git branch"],
    // Python
    "List Comprehension": ["[x for x in"],
    Decorators: ["@app.route", "@login_required", "@staticmethod"],
    // Algorithms / Patterns
    Recursion: ["function", "return", "recursive call (match in regex)"],
    "Binary Search": ["while (low <= high)", "mid = (low + high) / 2"],
    DFS: ["stack.push(", "visited.add(", "recursive DFS"],
    BFS: ["queue.push(", "while (queue.length)", "visited.add("],
    // Misc
    "Environment Variables": ["process.env", "dotenv.config("],
    "Unit Testing": ["describe(", "it(", "expect(", "assert.equal("],
};
exports.conceptRegexMap = {
    // 🔁 Recursion — function calls itself
    Recursion: [
        /function\s+(\w+)\s*\([^)]*\)\s*{[^{}]*\1\(/, // JS-style recursion
        /def\s+(\w+)\s*\([^)]*\):[^:]*\1\(/, // Python-style recursion
    ],
    // 🔐 JWT usage
    JWT: [
        /\bjwt\.sign\s*\(/,
        /\bjwt\.verify\s*\(/,
        /\brequire\(['"]jsonwebtoken['"]\)/,
    ],
    // 🧪 Unit Testing
    "Unit Testing": [
        /\bdescribe\s*\(/,
        /\bit\s*\(/,
        /\bexpect\s*\(/,
        /\bassert\.(equal|strictEqual|deepEqual)\s*\(/,
    ],
    // 🔂 useEffect hooks
    useEffect: [
        /useEffect\s*\(\s*\(\)\s*=>/, // useEffect(() => { ... })
        /useEffect\s*\(\s*async\s*\(\)\s*=>/, // useEffect(async () => { ... })
    ],
    // 📦 Express.js routing
    Routing: [
        /app\.(get|post|put|delete)\s*\(/,
        /router\.(get|post|put|delete)\s*\(/,
    ],
    // 🧼 Express.js middleware
    Middleware: [
        /function\s*\([^)]*req[^)]*,\s*res[^)]*,\s*next[^)]*\)\s*{/,
        /app\.use\s*\(/,
    ],
    // 🔄 Async/Await
    "Async/Await": [/\basync function\b/, /\bawait\s+\w+/],
    // 🔄 Promises
    Promises: [/new\s+Promise\s*\(/, /\.then\s*\(/, /\.catch\s*\(/],
    // 🌐 Fetch API
    "Fetch API": [/fetch\s*\(/, /axios\.(get|post|put|delete)\s*\(/],
    // 🧠 SQL Joins
    "SQL Joins": [
        /\bJOIN\b/,
        /\bLEFT\s+JOIN\b/,
        /\bRIGHT\s+JOIN\b/,
        /\bINNER\s+JOIN\b/,
    ],
    // 🔐 Authentication
    Authentication: [
        /bcrypt\.(hash|compare)\s*\(/,
        /passport\.authenticate\s*\(/,
        /require\(['"]passport['"]\)/,
    ],
    // 💾 useState React Hooks
    "React State": [
        /const\s*\[\s*\w+,\s*\w+\s*\]\s*=\s*useState\s*\(/,
        /this\.state\s*=/,
        /this\.setState\s*\(/,
    ],
    // 🔃 React Props
    "React Props": [
        /props\.\w+/,
        /function\s+\w+\s*\(\s*props\s*\)/,
        /\(\s*{[^}]*}\s*\)\s*=>\s*{/,
    ],
    // 📥 Environment Variables
    "Environment Variables": [/process\.env\.\w+/, /dotenv\.config\s*\(\s*\)/],
    // 🔁 List Comprehension (Python)
    "List Comprehension": [/\[.*for\s+\w+\s+in\s+\w+.*\]/],
    // 🧪 Decorators (Python/Flask)
    Decorators: [/@\w+/, /@app\.route/, /@login_required/],
};
//# sourceMappingURL=conceptKeywordMap.js.map