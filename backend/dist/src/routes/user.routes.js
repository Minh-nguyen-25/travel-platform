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
exports.adminUserRoutes = void 0;
const express_1 = require("express");
const constants_1 = require("../constants");
const userController = __importStar(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const user_validator_1 = require("../validators/user.validator");
const userRoutes = (0, express_1.Router)();
userRoutes.use(auth_middleware_1.authenticate);
userRoutes.get('/me', userController.getMe);
userRoutes.patch('/me', (0, validate_middleware_1.validate)(user_validator_1.updateProfileSchema), userController.updateMe);
userRoutes.patch('/me/password', (0, validate_middleware_1.validate)(user_validator_1.changePasswordSchema), userController.changePassword);
userRoutes.post('/me/avatar', upload_middleware_1.uploadSingle, userController.uploadAvatar);
userRoutes.delete('/me/avatar', userController.deleteAvatar);
exports.adminUserRoutes = (0, express_1.Router)();
exports.adminUserRoutes.use(auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(constants_1.ROLE.ADMIN));
exports.adminUserRoutes.get('/', (0, validate_middleware_1.validate)(user_validator_1.adminUserListQuerySchema, 'query'), userController.getAdminUsers);
exports.adminUserRoutes.get('/:userId', (0, validate_middleware_1.validate)(user_validator_1.userIdParamsSchema, 'params'), userController.getAdminUser);
exports.adminUserRoutes.patch('/:userId/status', (0, validate_middleware_1.validate)(user_validator_1.userIdParamsSchema, 'params'), (0, validate_middleware_1.validate)(user_validator_1.updateUserStatusSchema), userController.setUserStatus);
exports.adminUserRoutes.patch('/:userId/role', (0, validate_middleware_1.validate)(user_validator_1.userIdParamsSchema, 'params'), (0, validate_middleware_1.validate)(user_validator_1.updateUserRoleSchema), userController.setUserRole);
exports.default = userRoutes;
//# sourceMappingURL=user.routes.js.map