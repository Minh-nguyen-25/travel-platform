"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const response_utils_1 = require("../utils/response.utils");
const constants_1 = require("../constants");
// Dùng sau authenticate middleware
// Ví dụ: router.delete('/users/:id', authenticate, requireRole('ADMIN'), controller)
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_utils_1.sendError)(res, 'Chưa xác thực', constants_1.HTTP_STATUS.UNAUTHORIZED);
            return;
        }
        if (!roles.includes(req.user.role)) {
            (0, response_utils_1.sendError)(res, 'Bạn không có quyền thực hiện hành động này', constants_1.HTTP_STATUS.FORBIDDEN);
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=role.middleware.js.map