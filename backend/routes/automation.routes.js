// ============================================================
// NexusCRM - Rotas de Automações
// ============================================================
import { Router } from 'express';
import Automation from '../../bancodedados/models/Automation.js';
import { authenticate } from '../middleware/auth.js';
import { checkPermission, tenantIsolation } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// GET /api/automations
router.get('/', checkPermission('automations:read'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { tenantId: req.tenantId };
  if (status) filter.status = status;

  const automations = await Automation.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      automations,
      stats: {
        total: automations.length,
        active: automations.filter(a => a.status === 'active').length,
        totalExecutions: automations.reduce((sum, a) => sum + a.stats.executionCount, 0),
      },
    },
  });
}));

// GET /api/automations/:id
router.get('/:id', checkPermission('automations:read'), asyncHandler(async (req, res) => {
  const automation = await Automation.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!automation) return res.status(404).json({ success: false, message: 'Automação não encontrada.' });
  res.json({ success: true, data: { automation } });
}));

// POST /api/automations
router.post('/', checkPermission('automations:create'), asyncHandler(async (req, res) => {
  const { name, description, trigger, actions, status } = req.body;

  if (!name || !trigger) {
    return res.status(400).json({ success: false, message: 'Nome e trigger são obrigatórios.' });
  }

  const automation = await Automation.create({
    tenantId: req.tenantId,
    name, description, trigger, actions: actions || [],
    status: status || 'draft',
    createdBy: req.userId,
  });

  res.status(201).json({ success: true, message: 'Automação criada.', data: { automation } });
}));

// PUT /api/automations/:id
router.put('/:id', checkPermission('automations:update'), asyncHandler(async (req, res) => {
  const automation = await Automation.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!automation) return res.status(404).json({ success: false, message: 'Automação não encontrada.' });
  res.json({ success: true, message: 'Automação atualizada.', data: { automation } });
}));

// PATCH /api/automations/:id/toggle
router.patch('/:id/toggle', checkPermission('automations:update'), asyncHandler(async (req, res) => {
  const automation = await Automation.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!automation) return res.status(404).json({ success: false, message: 'Automação não encontrada.' });

  automation.status = automation.status === 'active' ? 'inactive' : 'active';
  await automation.save();

  res.json({ success: true, message: `Automação ${automation.status === 'active' ? 'ativada' : 'desativada'}.`, data: { automation } });
}));

// DELETE /api/automations/:id
router.delete('/:id', checkPermission('automations:delete'), asyncHandler(async (req, res) => {
  const automation = await Automation.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!automation) return res.status(404).json({ success: false, message: 'Automação não encontrada.' });
  res.json({ success: true, message: 'Automação removida.' });
}));

export default router;
