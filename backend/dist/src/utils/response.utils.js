"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaginated = exports.sendError = exports.sendSuccess = void 0;
const constants_1 = require("../constants");
const sendSuccess = (res, data, message = 'Thành công', statusCode = constants_1.HTTP_STATUS.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, errors) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
    });
};
exports.sendError = sendError;
const sendPaginated = (res, data, pagination, message = 'Thành công') => {
    return res.status(constants_1.HTTP_STATUS.OK).json({
        success: true,
        message,
        data,
        pagination,
    });
};
exports.sendPaginated = sendPaginated;
//# sourceMappingURL=response.utils.js.map