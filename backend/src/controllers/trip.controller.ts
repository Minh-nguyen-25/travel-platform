import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../utils/app-error';
import { sendPaginated, sendSuccess } from '../utils/response.utils';
import { tripService } from '../services/trip.service';
import {
  CreateItineraryInput,
  CreateTripDayInput,
  CreateTripInput,
  ReorderItinerariesInput,
  TripListQuery,
  UpdateItineraryInput,
  UpdateTripDayInput,
  UpdateTripInput,
} from '../types/trip.types';

const getAuthenticatedUserId = (req: Request): number => {
  if (!req.user) {
    throw new AppError('Bạn cần đăng nhập để thực hiện thao tác này', HTTP_STATUS.UNAUTHORIZED);
  }

  return req.user.id;
};

const getIdParam = (req: Request, name: 'tripId' | 'dayId' | 'itineraryId'): number =>
  Number(req.params[name]);

export const getTrips = async (req: Request, res: Response): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  const result = await tripService.getTrips(userId, req.query as unknown as TripListQuery);

  sendPaginated(res, result.data, result.pagination, 'Lấy danh sách chuyến đi thành công');
};

export const createTrip = async (req: Request, res: Response): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  const trip = await tripService.createTrip(userId, req.body as CreateTripInput);

  sendSuccess(res, trip, 'Tạo chuyến đi thành công', HTTP_STATUS.CREATED);
};

export const getTrip = async (req: Request, res: Response): Promise<void> => {
  const trip = await tripService.getTrip(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId')
  );

  sendSuccess(res, trip, 'Lấy chi tiết chuyến đi thành công');
};

export const updateTrip = async (req: Request, res: Response): Promise<void> => {
  const trip = await tripService.updateTrip(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    req.body as UpdateTripInput
  );

  sendSuccess(res, trip, 'Cập nhật chuyến đi thành công');
};

export const deleteTrip = async (req: Request, res: Response): Promise<void> => {
  await tripService.deleteTrip(getAuthenticatedUserId(req), getIdParam(req, 'tripId'));
  sendSuccess(res, null, 'Xóa chuyến đi thành công');
};

export const getTripDays = async (req: Request, res: Response): Promise<void> => {
  const days = await tripService.getTripDays(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId')
  );

  sendSuccess(res, days, 'Lấy danh sách ngày trong chuyến đi thành công');
};

export const createTripDay = async (req: Request, res: Response): Promise<void> => {
  const day = await tripService.createTripDay(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    req.body as CreateTripDayInput
  );

  sendSuccess(res, day, 'Tạo ngày trong chuyến đi thành công', HTTP_STATUS.CREATED);
};

export const getTripDay = async (req: Request, res: Response): Promise<void> => {
  const day = await tripService.getTripDay(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    getIdParam(req, 'dayId')
  );

  sendSuccess(res, day, 'Lấy chi tiết ngày trong chuyến đi thành công');
};

export const updateTripDay = async (req: Request, res: Response): Promise<void> => {
  const day = await tripService.updateTripDay(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    getIdParam(req, 'dayId'),
    req.body as UpdateTripDayInput
  );

  sendSuccess(res, day, 'Cập nhật ngày trong chuyến đi thành công');
};

export const deleteTripDay = async (req: Request, res: Response): Promise<void> => {
  await tripService.deleteTripDay(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    getIdParam(req, 'dayId')
  );

  sendSuccess(res, null, 'Xóa ngày trong chuyến đi thành công');
};

export const getItineraries = async (req: Request, res: Response): Promise<void> => {
  const itineraries = await tripService.getItineraries(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    getIdParam(req, 'dayId')
  );

  sendSuccess(res, itineraries, 'Lấy danh sách điểm trong lịch trình thành công');
};

export const createItinerary = async (req: Request, res: Response): Promise<void> => {
  const itinerary = await tripService.createItinerary(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    getIdParam(req, 'dayId'),
    req.body as CreateItineraryInput
  );

  sendSuccess(res, itinerary, 'Thêm điểm vào lịch trình thành công', HTTP_STATUS.CREATED);
};

export const getItinerary = async (req: Request, res: Response): Promise<void> => {
  const itinerary = await tripService.getItinerary(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    getIdParam(req, 'dayId'),
    getIdParam(req, 'itineraryId')
  );

  sendSuccess(res, itinerary, 'Lấy chi tiết điểm trong lịch trình thành công');
};

export const updateItinerary = async (req: Request, res: Response): Promise<void> => {
  const itinerary = await tripService.updateItinerary(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    getIdParam(req, 'dayId'),
    getIdParam(req, 'itineraryId'),
    req.body as UpdateItineraryInput
  );

  sendSuccess(res, itinerary, 'Cập nhật điểm trong lịch trình thành công');
};

export const deleteItinerary = async (req: Request, res: Response): Promise<void> => {
  await tripService.deleteItinerary(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    getIdParam(req, 'dayId'),
    getIdParam(req, 'itineraryId')
  );

  sendSuccess(res, null, 'Xóa điểm khỏi lịch trình thành công');
};

export const reorderItineraries = async (req: Request, res: Response): Promise<void> => {
  const itineraries = await tripService.reorderItineraries(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId'),
    getIdParam(req, 'dayId'),
    req.body as ReorderItinerariesInput
  );

  sendSuccess(res, itineraries, 'Sắp xếp lịch trình thành công');
};

export const getCostSummary = async (req: Request, res: Response): Promise<void> => {
  const summary = await tripService.getCostSummary(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId')
  );

  sendSuccess(res, summary, 'Tính tổng chi phí dự tính thành công');
};

export const enableTripShare = async (req: Request, res: Response): Promise<void> => {
  const share = await tripService.enableTripShare(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId')
  );

  sendSuccess(res, share, 'Bật chia sẻ chuyến đi thành công');
};

export const disableTripShare = async (req: Request, res: Response): Promise<void> => {
  await tripService.disableTripShare(
    getAuthenticatedUserId(req),
    getIdParam(req, 'tripId')
  );

  sendSuccess(res, null, 'Đã thu hồi liên kết chia sẻ');
};

export const getSharedTrip = async (req: Request, res: Response): Promise<void> => {
  const trip = await tripService.getSharedTrip(String(req.params.shareToken));

  res.setHeader('Cache-Control', 'no-store');
  sendSuccess(res, trip, 'Lấy lịch trình được chia sẻ thành công');
};
