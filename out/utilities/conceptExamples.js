"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conceptExamples = void 0;
exports.conceptExamples = {
    Promises: [
        `const p = new Promise((resolve, reject) => {...});`,
        `fetch("/api").then(res => res.json())`,
    ],
    "Async/Await": [
        `async function getData() { const res = await fetch(url); }`,
        `await axios.get("/api/data")`,
    ],
    "React State": [
        `const [count, setCount] = useState(0);`,
        `this.setState({ loggedIn: true });`,
    ],
    useEffect: [
        `useEffect(() => { fetchData(); }, []);`,
        `useEffect(() => { console.log("mounted"); });`,
    ],
    "Express.js": [
        `const express = require('express'); const app = express();`,
        `app.get('/api', (req, res) => res.send("hi"));`,
    ],
    "SQL Joins": [
        `SELECT * FROM users JOIN orders ON users.id = orders.user_id;`,
        `LEFT JOIN products ON sales.product_id = products.id`,
    ],
    Authentication: [
        `const token = jwt.sign({ id: user.id }, secret);`,
        `bcrypt.hash(password, saltRounds)`,
    ],
    Recursion: [
        `function factorial(n) { if (n <= 1) return 1; return n * factorial(n - 1); }`,
        `function dfs(node) { for (child of node.children) dfs(child); }`,
    ],
    "Array Methods": [
        `[1, 2, 3].map(x => x * 2)`,
        `arr.filter(item => item.active)`,
    ],
    "Unit Testing": [
        `describe("add()", () => { it("adds numbers", () => { expect(add(1, 2)).toBe(3); }); });`,
        `assert.equal(sum(2, 3), 5);`,
    ],
};
//# sourceMappingURL=conceptExamples.js.map