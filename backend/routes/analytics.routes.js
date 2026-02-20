// ============================================================
// NexusCRM - Rotas de Analytics
// ============================================================
import { Router } from 'express';
import mongoose from 'mongoose';
import Lead from '../../bancodedados/models/Lead.js';
import { Message, Conversation } from '../../bancodedados/models/Message.js';
import { authenticate } from '../middleware/auth.js';
import { checkPermission, tenantIsolation } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// GET /api/analytics/dashboard
router.get('/dashboard', checkPermission('analytics:read'), asyncHandler(async (req, res) => {
  const tenantObjId = new mongoose.Types.ObjectId(req.tenantId);

  const [
    totalLeads,
    leadsThisMonth,
    wonDeals,
    pipelineStats,
    channelStats,
    recentLeads,
  ] = await Promise.all([
    Lead.countDocuments({ tenantId: req.tenantId }),
    Lead.countDocuments({
      tenantId: req.tenantId,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),
    Lead.aggregate([
      { $match: { tenantId: tenantObjId, status: 'ganho' } },
      { $group: { _id: null, total: { $sum: '$value' }, count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { tenantId: tenantObjId } },
      { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$value' } } },
      { $sort: { _id: 1 } },
    ]),
    Lead.aggregate([
      { $match: { tenantId: tenantObjId } },
      { $group: { _id: '$source', count: { $sum: 1 }, totalValue: { $sum: '$value' } } },
      { $sort: { count: -1 } },
    ]),
    Lead.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email stage status value source createdAt'),
  ]);

  const revenue = wonDeals[0] || { total: 0, count: 0 };
  const conversionRate = totalLeads > 0 ? ((revenue.count / totalLeads) * 100).toFixed(1) : 0;

  res.json({
    success: true,
    data: {
      kpis: {
        totalLeads,
        leadsThisMonth,
        revenue: revenue.total,
        wonDeals: revenue.count,
        conversionRate: parseFloat(conversionRate),
      },
      pipelineStats,
      channelStats,
      recentLeads,
    },
  });
}));

// GET /api/analytics/revenue
router.get('/revenue', checkPermission('analytics:read'), asyncHandler(async (req, res) => {
  const { months = 7 } = req.query;
  const tenantObjId = new mongoose.Types.ObjectId(req.tenantId);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - parseInt(months));

  const revenueByMonth = await Lead.aggregate([
    {
      $match: {
        tenantId: tenantObjId,
        status: 'ganho',
        wonAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$wonAt' },
          month: { $month: '$wonAt' },
        },
        revenue: { $sum: '$value' },
        deals: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({ success: true, data: { revenueByMonth } });
}));

// GET /api/analytics/conversion-funnel
router.get('/conversion-funnel', checkPermission('analytics:read'), asyncHandler(async (req, res) => {
  const tenantObjId = new mongoose.Types.ObjectId(req.tenantId);

  const funnel = await Lead.aggregate([
    { $match: { tenantId: tenantObjId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({ success: true, data: { funnel } });
}));

// GET /api/analytics/response-time
router.get('/response-time', checkPermission('analytics:read'), asyncHandler(async (req, res) => {
  const tenantObjId = new mongoose.Types.ObjectId(req.tenantId);

  const avgResponseTime = await Message.aggregate([
    { $match: { tenantId: tenantObjId, direction: 'outbound' } },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        avgMinutes: { $avg: { $divide: [{ $subtract: ['$createdAt', '$updatedAt'] }, 60000] } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, data: { avgResponseTime } });
}));

export default router;
