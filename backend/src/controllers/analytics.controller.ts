import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { AnalyticsOverviewQuery } from '../validators/analytics.validator';
import { sendSuccess } from '../utils/response.utils';

export const getOverview = async (req: Request, res: Response): Promise<void> => {
  const query = req.query as unknown as AnalyticsOverviewQuery;
  const overview = await analyticsService.getOverview(query);

  sendSuccess(res, overview, 'Lấy dữ liệu tổng quan quản trị thành công');
};
