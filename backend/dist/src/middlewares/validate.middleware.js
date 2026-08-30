"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const response_utils_1 = require("../utils/response.utils");
const constants_1 = require("../constants");
// Ví dụ dùng:
// router.post('/register', validate(registerSchema), authController.register)
// router.get('/destinations', validate(paginationSchema, 'query'), destinationController.getAll)
const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        const result = schema.safeParse(req[target]);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            (0, response_utils_1.sendError)(res, 'Dữ liệu không hợp lệ', constants_1.HTTP_STATUS.UNPROCESSABLE, errors);
            return;
        }
        // Gán dữ liệu đã được validate và parse lại vào request
        req[target] = result.data;
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map