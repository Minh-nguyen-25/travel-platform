"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const passport_1 = __importDefault(require("./config/passport"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const app = (0, express_1.default)();
// ─── Security Middleware ───────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ─── OAuth (Passport) ─────────────────────────────────────────────────────────
app.use(passport_1.default.initialize());
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1', routes_1.default);
// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint không tồn tại',
    });
});
// ─── Global Error Handler (phải đặt cuối cùng) ────────────────────────────────
app.use(errorHandler_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map