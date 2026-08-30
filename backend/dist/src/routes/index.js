"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const trip_routes_1 = __importDefault(require("./trip.routes"));
const user_routes_1 = __importStar(require("./user.routes"));
const preference_routes_1 = __importDefault(require("./preference.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const map_routes_1 = __importDefault(require("./map.routes"));
const ai_routes_1 = __importDefault(require("./ai.routes"));
const destination_routes_1 = __importStar(require("./destination.routes"));
const category_routes_1 = __importStar(require("./category.routes"));
const review_routes_1 = __importStar(require("./review.routes"));
const favorite_routes_1 = __importStar(require("./favorite.routes"));
const router = (0, express_1.Router)();
// Health check — endpoint duy nhất trong Core
// Feature routes sẽ được thêm vào đây khi thành viên hoàn thành feature của mình
// Ví dụ: router.use('/auth', authRoutes);
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Travel Platform API is running',
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
        },
    });
});
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/trips', trip_routes_1.default);
router.use('/travel-preferences', preference_routes_1.default);
router.use('/admin/analytics', analytics_routes_1.default);
router.use('/maps', map_routes_1.default);
router.use('/ai', ai_routes_1.default);
router.use('/destinations/:destinationId/reviews', review_routes_1.destinationReviewRoutes);
router.use('/destinations/:destinationId/favorite', favorite_routes_1.destinationFavoriteRoutes);
router.use('/destinations/:destinationId/favorites', favorite_routes_1.destinationFavoriteRoutes);
router.use('/destinations', destination_routes_1.default);
router.use('/categories', category_routes_1.default);
router.use('/reviews', review_routes_1.default);
router.use('/favorites', favorite_routes_1.default);
router.use('/admin/destinations', destination_routes_1.adminDestinationRoutes);
router.use('/admin/categories', category_routes_1.adminCategoryRoutes);
router.use('/admin/reviews', review_routes_1.adminReviewRoutes);
router.use('/admin/users', user_routes_1.adminUserRoutes);
exports.default = router;
//# sourceMappingURL=index.js.map