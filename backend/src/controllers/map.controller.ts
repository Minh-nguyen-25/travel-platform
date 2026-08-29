import { Request, Response } from 'express';
import { mapService } from '../services/map.service';
import { RouteMatrixRequest, RouteRequest } from '../types/map.types';
import { DistanceRequestInput } from '../validators/map.validator';
import { sendSuccess } from '../utils/response.utils';

export const calculateDistance = async (req: Request, res: Response): Promise<void> => {
  const { origin, destination, profile } = req.body as DistanceRequestInput;
  const result = await mapService.calculateDistance(origin, destination, profile);

  sendSuccess(res, result, 'Tính khoảng cách và thời gian di chuyển thành công');
};

export const calculateRoute = async (req: Request, res: Response): Promise<void> => {
  const result = await mapService.calculateRoute(req.body as RouteRequest);
  sendSuccess(res, result, 'Tính tuyến đường thành công');
};

export const calculateMatrix = async (req: Request, res: Response): Promise<void> => {
  const result = await mapService.calculateMatrix(req.body as RouteMatrixRequest);
  sendSuccess(res, result, 'Tính ma trận khoảng cách và thời gian thành công');
};
