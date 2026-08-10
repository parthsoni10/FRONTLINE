import { TriageResult } from '../models/TriageResult.js';
import { AuditLog } from '../models/AuditLog.js';

export async function getTriageResults(req, res) {
  try {
    const { needsHuman, category, priority, limit = 100, page = 1 } = req.query;

    const filter = {};
    if (needsHuman !== undefined && needsHuman !== '') {
      filter.needsHuman = needsHuman === 'true';
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Latest result per message or latest overall
    const results = await TriageResult.find(filter)
      .populate('messageId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TriageResult.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getResultDetail(req, res) {
  try {
    const { id } = req.params;
    const triageResult = await TriageResult.findById(id).populate('messageId');

    if (!triageResult) {
      return res.status(404).json({ success: false, error: 'Triage result not found' });
    }

    const auditLogs = await AuditLog.find({ messageId: triageResult.messageId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      triageResult,
      auditLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
