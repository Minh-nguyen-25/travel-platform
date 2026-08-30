"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedTrip = exports.disableTripShare = exports.enableTripShare = exports.getCostSummary = exports.reorderItineraries = exports.deleteItinerary = exports.updateItinerary = exports.getItinerary = exports.createItinerary = exports.getItineraries = exports.deleteTripDay = exports.updateTripDay = exports.getTripDay = exports.createTripDay = exports.getTripDays = exports.deleteTrip = exports.updateTrip = exports.getTrip = exports.createTrip = exports.getTrips = void 0;
const constants_1 = require("../constants");
const app_error_1 = require("../utils/app-error");
const ai_draft_utils_1 = require("../utils/ai-draft.utils");
const response_utils_1 = require("../utils/response.utils");
const trip_service_1 = require("../services/trip.service");
const getAuthenticatedUserId = (req) => {
    if (!req.user) {
        throw new app_error_1.AppError('Bạn cần đăng nhập để thực hiện thao tác này', constants_1.HTTP_STATUS.UNAUTHORIZED);
    }
    return req.user.id;
};
const getIdParam = (req, name) => Number(req.params[name]);
const getTrips = async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const result = await trip_service_1.tripService.getTrips(userId, req.query);
    (0, response_utils_1.sendPaginated)(res, result.data, result.pagination, 'Lấy danh sách chuyến đi thành công');
};
exports.getTrips = getTrips;
const createTrip = async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const { aiRawData, aiProofToken, ...input } = req.body;
    const isVerifiedAiDraft = Boolean(aiRawData &&
        aiProofToken &&
        (0, ai_draft_utils_1.verifyAiDraftProof)(aiProofToken, userId, input, aiRawData));
    if ((aiRawData || aiProofToken) && !isVerifiedAiDraft) {
        throw new app_error_1.AppError('Bản nháp AI không hợp lệ hoặc đã hết hạn', constants_1.HTTP_STATUS.FORBIDDEN);
    }
    const trip = await trip_service_1.tripService.createTrip(userId, input, {
        isAiGenerated: isVerifiedAiDraft,
        aiRawData: isVerifiedAiDraft ? aiRawData ?? null : null,
    });
    (0, response_utils_1.sendSuccess)(res, trip, 'Tạo chuyến đi thành công', constants_1.HTTP_STATUS.CREATED);
};
exports.createTrip = createTrip;
const getTrip = async (req, res) => {
    const trip = await trip_service_1.tripService.getTrip(getAuthenticatedUserId(req), getIdParam(req, 'tripId'));
    (0, response_utils_1.sendSuccess)(res, trip, 'Lấy chi tiết chuyến đi thành công');
};
exports.getTrip = getTrip;
const updateTrip = async (req, res) => {
    const trip = await trip_service_1.tripService.updateTrip(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), req.body);
    (0, response_utils_1.sendSuccess)(res, trip, 'Cập nhật chuyến đi thành công');
};
exports.updateTrip = updateTrip;
const deleteTrip = async (req, res) => {
    await trip_service_1.tripService.deleteTrip(getAuthenticatedUserId(req), getIdParam(req, 'tripId'));
    (0, response_utils_1.sendSuccess)(res, null, 'Xóa chuyến đi thành công');
};
exports.deleteTrip = deleteTrip;
const getTripDays = async (req, res) => {
    const days = await trip_service_1.tripService.getTripDays(getAuthenticatedUserId(req), getIdParam(req, 'tripId'));
    (0, response_utils_1.sendSuccess)(res, days, 'Lấy danh sách ngày trong chuyến đi thành công');
};
exports.getTripDays = getTripDays;
const createTripDay = async (req, res) => {
    const day = await trip_service_1.tripService.createTripDay(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), req.body);
    (0, response_utils_1.sendSuccess)(res, day, 'Tạo ngày trong chuyến đi thành công', constants_1.HTTP_STATUS.CREATED);
};
exports.createTripDay = createTripDay;
const getTripDay = async (req, res) => {
    const day = await trip_service_1.tripService.getTripDay(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), getIdParam(req, 'dayId'));
    (0, response_utils_1.sendSuccess)(res, day, 'Lấy chi tiết ngày trong chuyến đi thành công');
};
exports.getTripDay = getTripDay;
const updateTripDay = async (req, res) => {
    const day = await trip_service_1.tripService.updateTripDay(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), getIdParam(req, 'dayId'), req.body);
    (0, response_utils_1.sendSuccess)(res, day, 'Cập nhật ngày trong chuyến đi thành công');
};
exports.updateTripDay = updateTripDay;
const deleteTripDay = async (req, res) => {
    await trip_service_1.tripService.deleteTripDay(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), getIdParam(req, 'dayId'));
    (0, response_utils_1.sendSuccess)(res, null, 'Xóa ngày trong chuyến đi thành công');
};
exports.deleteTripDay = deleteTripDay;
const getItineraries = async (req, res) => {
    const itineraries = await trip_service_1.tripService.getItineraries(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), getIdParam(req, 'dayId'));
    (0, response_utils_1.sendSuccess)(res, itineraries, 'Lấy danh sách điểm trong lịch trình thành công');
};
exports.getItineraries = getItineraries;
const createItinerary = async (req, res) => {
    const itinerary = await trip_service_1.tripService.createItinerary(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), getIdParam(req, 'dayId'), req.body);
    (0, response_utils_1.sendSuccess)(res, itinerary, 'Thêm điểm vào lịch trình thành công', constants_1.HTTP_STATUS.CREATED);
};
exports.createItinerary = createItinerary;
const getItinerary = async (req, res) => {
    const itinerary = await trip_service_1.tripService.getItinerary(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), getIdParam(req, 'dayId'), getIdParam(req, 'itineraryId'));
    (0, response_utils_1.sendSuccess)(res, itinerary, 'Lấy chi tiết điểm trong lịch trình thành công');
};
exports.getItinerary = getItinerary;
const updateItinerary = async (req, res) => {
    const itinerary = await trip_service_1.tripService.updateItinerary(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), getIdParam(req, 'dayId'), getIdParam(req, 'itineraryId'), req.body);
    (0, response_utils_1.sendSuccess)(res, itinerary, 'Cập nhật điểm trong lịch trình thành công');
};
exports.updateItinerary = updateItinerary;
const deleteItinerary = async (req, res) => {
    await trip_service_1.tripService.deleteItinerary(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), getIdParam(req, 'dayId'), getIdParam(req, 'itineraryId'));
    (0, response_utils_1.sendSuccess)(res, null, 'Xóa điểm khỏi lịch trình thành công');
};
exports.deleteItinerary = deleteItinerary;
const reorderItineraries = async (req, res) => {
    const itineraries = await trip_service_1.tripService.reorderItineraries(getAuthenticatedUserId(req), getIdParam(req, 'tripId'), getIdParam(req, 'dayId'), req.body);
    (0, response_utils_1.sendSuccess)(res, itineraries, 'Sắp xếp lịch trình thành công');
};
exports.reorderItineraries = reorderItineraries;
const getCostSummary = async (req, res) => {
    const summary = await trip_service_1.tripService.getCostSummary(getAuthenticatedUserId(req), getIdParam(req, 'tripId'));
    (0, response_utils_1.sendSuccess)(res, summary, 'Tính tổng chi phí dự tính thành công');
};
exports.getCostSummary = getCostSummary;
const enableTripShare = async (req, res) => {
    const share = await trip_service_1.tripService.enableTripShare(getAuthenticatedUserId(req), getIdParam(req, 'tripId'));
    (0, response_utils_1.sendSuccess)(res, share, 'Bật chia sẻ chuyến đi thành công');
};
exports.enableTripShare = enableTripShare;
const disableTripShare = async (req, res) => {
    await trip_service_1.tripService.disableTripShare(getAuthenticatedUserId(req), getIdParam(req, 'tripId'));
    (0, response_utils_1.sendSuccess)(res, null, 'Đã thu hồi liên kết chia sẻ');
};
exports.disableTripShare = disableTripShare;
const getSharedTrip = async (req, res) => {
    const trip = await trip_service_1.tripService.getSharedTrip(String(req.params.shareToken));
    res.setHeader('Cache-Control', 'no-store');
    (0, response_utils_1.sendSuccess)(res, trip, 'Lấy lịch trình được chia sẻ thành công');
};
exports.getSharedTrip = getSharedTrip;
//# sourceMappingURL=trip.controller.js.map