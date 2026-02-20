// ============================================================
// NexusCRM - Rotas de Agenda / Calendário
// ============================================================
import { Router } from 'express';
import CalendarEvent from '../../bancodedados/models/CalendarEvent.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// GET /api/calendar
router.get('/', asyncHandler(async (req, res) => {
  const { start, end, type, leadId } = req.query;
  const filter = { tenantId: req.tenantId };

  if (start && end) {
    filter.startDate = { $gte: new Date(start), $lte: new Date(end) };
  }
  if (type) filter.type = type;
  if (leadId) filter.leadId = leadId;

  const events = await CalendarEvent.find(filter)
    .populate('leadId', 'name email')
    .populate('organizer.userId', 'name email avatar')
    .sort({ startDate: 1 });

  res.json({ success: true, data: { events } });
}));

// GET /api/calendar/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findOne({ _id: req.params.id, tenantId: req.tenantId })
    .populate('leadId', 'name email phone')
    .populate('attendees.userId', 'name email avatar');
  if (!event) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
  res.json({ success: true, data: { event } });
}));

// POST /api/calendar
router.post('/', asyncHandler(async (req, res) => {
  const { title, description, type, startDate, endDate, allDay, leadId, leadName, attendees, reminders, location, notes, color } = req.body;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'Título, início e fim são obrigatórios.' });
  }

  const event = await CalendarEvent.create({
    tenantId: req.tenantId,
    title, description, type, startDate, endDate, allDay,
    leadId, leadName, attendees, reminders, location, notes, color,
    organizer: { userId: req.userId, name: req.user.name, email: req.user.email },
    createdBy: req.userId,
  });

  res.status(201).json({ success: true, message: 'Evento criado.', data: { event } });
}));

// PUT /api/calendar/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!event) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
  res.json({ success: true, message: 'Evento atualizado.', data: { event } });
}));

// PATCH /api/calendar/:id/reschedule (Drag & Drop)
router.patch('/:id/reschedule', asyncHandler(async (req, res) => {
  const { newDate, newTime } = req.body;
  if (!newDate) {
    return res.status(400).json({ success: false, message: 'Nova data é obrigatória.' });
  }

  const event = await CalendarEvent.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!event) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });

  // Calcular duração original
  const originalDuration = event.endDate.getTime() - event.startDate.getTime();

  // Construir nova data com horário (mantém horário original se não informado)
  const originalTime = newTime || `${String(event.startDate.getHours()).padStart(2,'0')}:${String(event.startDate.getMinutes()).padStart(2,'0')}`;
  const [hours, minutes] = originalTime.split(':').map(Number);
  const newStart = new Date(newDate);
  newStart.setHours(hours, minutes, 0, 0);
  const newEnd = new Date(newStart.getTime() + originalDuration);

  // Registrar que foi reagendado
  event.startDate = newStart;
  event.endDate = newEnd;
  if (event.status === 'cancelled') event.status = 'rescheduled';

  await event.save();

  res.json({
    success: true,
    message: `Evento reagendado para ${newDate} às ${originalTime}.`,
    data: { event }
  });
}));

// PATCH /api/calendar/:id/status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status, cancelReason, outcome } = req.body;
  const updates = { status };
  if (status === 'completed') { updates.completedAt = new Date(); updates.outcome = outcome; }
  if (status === 'cancelled') { updates.cancelledAt = new Date(); updates.cancelReason = cancelReason; }

  const event = await CalendarEvent.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    updates,
    { new: true }
  );
  if (!event) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
  res.json({ success: true, message: `Evento ${status}.`, data: { event } });
}));

// DELETE /api/calendar/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!event) return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
  res.json({ success: true, message: 'Evento removido.' });
}));

export default router;
