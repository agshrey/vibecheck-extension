"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conceptRegexMap = exports.conceptKeywordMap = void 0;
exports.conceptKeywordMap = {
    Promises: ["new Promise", ".then", ".catch"],
    "Async/Await": ["async function", "await "],
    useEffect: ["useEffect("],
    "React State": ["useState(", "this.state", "setState"],
    "SQL Joins": ["JOIN", "LEFT JOIN", "RIGHT JOIN"],
    "Express.js": ["const express", "app.get(", "app.post("],
    "REST APIs": ["GET /", "POST /", "fetch(", "axios"],
    Authentication: ["jwt.sign(", "bcrypt", "passport"],
    Classes: ["class ", "extends ", "constructor("],
    Recursion: ["function", "return", "function call to self (regex)"],
};
exports.conceptRegexMap = {
    Recursion: [/function\s+(\w+)\s*\(.*\)\s*{[\s\S]*\1\(/], // function calling itself
    JWT: [/\b(jwt\.sign|jwt\.verify)\b/],
    useEffect: [/useEffect\(/],
};
//# sourceMappingURL=conceptKeywordMap.js.map