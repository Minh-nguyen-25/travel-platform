"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userConcurrencyLimit = exports.userRateLimit = void 0;
const constants_1 = require("../constants");
const response_utils_1 = require("../utils/response.utils");
const MAX_TRACKED_BUCKETS = 10_000;
const userRateLimit = ({ namespace, maxRequests, windowMs, }) => {
    const buckets = new Map();
    return (req, res, next) => {
        if (!req.user) {
            (0, response_utils_1.sendError)(res, 'Chưa xác thực', constants_1.HTTP_STATUS.UNAUTHORIZED);
            return;
        }
        const now = Date.now();
        const key = `${namespace}:${req.user.id}`;
        let bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + windowMs };
            buckets.set(key, bucket);
        }
        const remaining = Math.max(0, maxRequests - bucket.count - 1);
        res.setHeader('X-RateLimit-Limit', String(maxRequests));
        res.setHeader('X-RateLimit-Remaining', String(remaining));
        res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1_000)));
        if (bucket.count >= maxRequests) {
            res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000))));
            (0, response_utils_1.sendError)(res, 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau', constants_1.HTTP_STATUS.TOO_MANY_REQUESTS);
            return;
        }
        bucket.count += 1;
        if (buckets.size > MAX_TRACKED_BUCKETS) {
            for (const [bucketKey, candidate] of buckets) {
                if (candidate.resetAt <= now)
                    buckets.delete(bucketKey);
            }
            while (buckets.size > MAX_TRACKED_BUCKETS) {
                const oldestKey = buckets.keys().next().value;
                if (!oldestKey)
                    break;
                buckets.delete(oldestKey);
            }
        }
        next();
    };
};
exports.userRateLimit = userRateLimit;
const userConcurrencyLimit = ({ maxGlobal, maxPerUser, }) => {
    let activeGlobal = 0;
    const activeByUser = new Map();
    return (req, res, next) => {
        if (!req.user) {
            (0, response_utils_1.sendError)(res, 'Chưa xác thực', constants_1.HTTP_STATUS.UNAUTHORIZED);
            return;
        }
        const userId = req.user.id;
        const activeForUser = activeByUser.get(userId) ?? 0;
        if (activeGlobal >= maxGlobal || activeForUser >= maxPerUser) {
            res.setHeader('Retry-After', '5');
            (0, response_utils_1.sendError)(res, 'Đang có quá nhiều yêu cầu xử lý đồng thời, vui lòng thử lại sau', constants_1.HTTP_STATUS.TOO_MANY_REQUESTS);
            return;
        }
        activeGlobal += 1;
        activeByUser.set(userId, activeForUser + 1);
        let released = false;
        const release = () => {
            if (released)
                return;
            released = true;
            activeGlobal = Math.max(0, activeGlobal - 1);
            const remaining = (activeByUser.get(userId) ?? 1) - 1;
            if (remaining <= 0)
                activeByUser.delete(userId);
            else
                activeByUser.set(userId, remaining);
        };
        res.once('finish', release);
        res.once('close', release);
        next();
    };
};
exports.userConcurrencyLimit = userConcurrencyLimit;
//# sourceMappingURL=rateLimit.middleware.js.map