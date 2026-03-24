"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
function requireAuth(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid token' });
    }
}
