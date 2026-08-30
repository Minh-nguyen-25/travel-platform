"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsOverviewQuerySchema = void 0;
const zod_1 = require("zod");
const analytics_service_1 = require("../services/analytics.service");
const optionalBoundedInteger = (field, maximum) => zod_1.z.coerce
    .number({ invalid_type_error: `${field} phải là số` })
    .int(`${field} phải là số nguyên`)
    .min(1, `${field} phải lớn hơn hoặc bằng 1`)
    .max(maximum, `${field} không được vượt quá ${maximum}`)
    .optional();
exports.analyticsOverviewQuerySchema = zod_1.z
    .object({
    periodDays: optionalBoundedInteger('periodDays', analytics_service_1.MAX_ANALYTICS_PERIOD_DAYS),
    popularDestinationLimit: optionalBoundedInteger('popularDestinationLimit', analytics_service_1.MAX_ANALYTICS_RANKING_LIMIT),
    topCityLimit: optionalBoundedInteger('topCityLimit', analytics_service_1.MAX_ANALYTICS_RANKING_LIMIT),
})
    .strict();
//# sourceMappingURL=analytics.validator.js.map