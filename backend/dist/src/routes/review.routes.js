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
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminReviewRoutes = exports.destinationReviewRoutes = void 0;
const express_1 = require("express");
const reviewController = __importStar(require("../controllers/review.controller"));
const constants_1 = require("../constants");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const review_validator_1 = require("../validators/review.validator");
exports.destinationReviewRoutes = (0, express_1.Router)({ mergeParams: true });
exports.destinationReviewRoutes.get('/', (0, validate_middleware_1.validate)(review_validator_1.reviewDestinationIdParamsSchema, 'params'), (0, validate_middleware_1.validate)(review_validator_1.reviewListQuerySchema, 'query'), reviewController.getDestinationReviews);
exports.destinationReviewRoutes.get('/me', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(review_validator_1.reviewDestinationIdParamsSchema, 'params'), reviewController.getMyReview);
exports.destinationReviewRoutes.post('/', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(review_validator_1.reviewDestinationIdParamsSchema, 'params'), upload_middleware_1.uploadMultiple, (0, validate_middleware_1.validate)(review_validator_1.createReviewSchema), reviewController.createReview);
exports.destinationReviewRoutes.get('/:reviewId', (0, validate_middleware_1.validate)(review_validator_1.reviewDestinationIdParamsSchema.extend(review_validator_1.reviewIdParamsSchema.shape), 'params'), reviewController.getPublicReview);
const reviewRoutes = (0, express_1.Router)();
reviewRoutes.use(auth_middleware_1.authenticate);
reviewRoutes.patch('/:reviewId', (0, validate_middleware_1.validate)(review_validator_1.reviewIdParamsSchema, 'params'), upload_middleware_1.uploadMultiple, (0, validate_middleware_1.validate)(review_validator_1.updateReviewSchema), reviewController.updateReview);
reviewRoutes.delete('/:reviewId/images/:imageId', (0, validate_middleware_1.validate)(review_validator_1.reviewImageParamsSchema, 'params'), reviewController.deleteReviewImage);
reviewRoutes.delete('/:reviewId', (0, validate_middleware_1.validate)(review_validator_1.reviewIdParamsSchema, 'params'), reviewController.deleteReview);
exports.adminReviewRoutes = (0, express_1.Router)();
exports.adminReviewRoutes.use(auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(constants_1.ROLE.ADMIN));
exports.adminReviewRoutes.get('/', (0, validate_middleware_1.validate)(review_validator_1.adminReviewListQuerySchema, 'query'), reviewController.getAdminReviews);
exports.adminReviewRoutes.patch('/:reviewId/visibility', (0, validate_middleware_1.validate)(review_validator_1.reviewIdParamsSchema, 'params'), (0, validate_middleware_1.validate)(review_validator_1.reviewVisibilitySchema), reviewController.setReviewVisibility);
exports.adminReviewRoutes.delete('/:reviewId', (0, validate_middleware_1.validate)(review_validator_1.reviewIdParamsSchema, 'params'), reviewController.deleteReviewAsAdmin);
exports.default = reviewRoutes;
//# sourceMappingURL=review.routes.js.map