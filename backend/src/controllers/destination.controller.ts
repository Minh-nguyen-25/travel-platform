import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { destinationService } from '../services/destination.service';
import {
  CreateDestinationInput,
  DestinationListQuery,
  UpdateDestinationInput,
} from '../types/destination.types';
import { sendPaginated, sendSuccess } from '../utils/response.utils';

const getDestinationId = (req: Request): number => Number(req.params.destinationId);
const getImageId = (req: Request): number => Number(req.params.imageId);
const getFiles = (req: Request): Express.Multer.File[] =>
  Array.isArray(req.files) ? req.files : [];

export const getDestinations = async (req: Request, res: Response): Promise<void> => {
  const result = await destinationService.getDestinations(
    req.query as unknown as DestinationListQuery,
    true
  );
  sendPaginated(
    res,
    result.data,
    result.pagination,
    'Lấy danh sách địa điểm thành công'
  );
};

export const getDestination = async (req: Request, res: Response): Promise<void> => {
  const destination = await destinationService.getDestination(getDestinationId(req), true);
  sendSuccess(res, destination, 'Lấy chi tiết địa điểm thành công');
};

export const getAdminDestinations = async (req: Request, res: Response): Promise<void> => {
  const result = await destinationService.getDestinations(
    req.query as unknown as DestinationListQuery,
    false
  );
  sendPaginated(
    res,
    result.data,
    result.pagination,
    'Lấy danh sách địa điểm quản trị thành công'
  );
};

export const getAdminDestination = async (req: Request, res: Response): Promise<void> => {
  const destination = await destinationService.getDestination(getDestinationId(req), false);
  sendSuccess(res, destination, 'Lấy chi tiết địa điểm quản trị thành công');
};

export const createDestination = async (req: Request, res: Response): Promise<void> => {
  const { primaryImageIndex, ...input } = req.body as CreateDestinationInput & {
    primaryImageIndex?: number;
  };
  const destination = await destinationService.createDestination(
    input,
    getFiles(req),
    primaryImageIndex
  );
  sendSuccess(res, destination, 'Thêm địa điểm thành công', HTTP_STATUS.CREATED);
};

export const updateDestination = async (req: Request, res: Response): Promise<void> => {
  const { primaryImageIndex, ...input } = req.body as UpdateDestinationInput & {
    primaryImageIndex?: number;
  };
  const destination = await destinationService.updateDestination(
    getDestinationId(req),
    input,
    getFiles(req),
    primaryImageIndex
  );
  sendSuccess(res, destination, 'Cập nhật địa điểm thành công');
};

export const deleteDestination = async (req: Request, res: Response): Promise<void> => {
  const destination = await destinationService.softDeleteDestination(getDestinationId(req));
  sendSuccess(res, destination, 'Xóa mềm địa điểm thành công');
};

export const uploadDestinationImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const destination = await destinationService.uploadDestinationImages(
    getDestinationId(req),
    getFiles(req),
    (req.body as { primaryImageIndex?: number }).primaryImageIndex
  );
  sendSuccess(res, destination, 'Upload ảnh địa điểm thành công', HTTP_STATUS.CREATED);
};

export const deleteDestinationImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const destination = await destinationService.deleteDestinationImage(
    getDestinationId(req),
    getImageId(req)
  );
  sendSuccess(res, destination, 'Xóa ảnh địa điểm thành công');
};

export const setPrimaryImage = async (req: Request, res: Response): Promise<void> => {
  const destination = await destinationService.setPrimaryImage(
    getDestinationId(req),
    getImageId(req)
  );
  sendSuccess(res, destination, 'Đặt ảnh đại diện thành công');
};
