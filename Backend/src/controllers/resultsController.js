import { TriageResult } from '../models/TriageResult.js';
import { AuditLog } from '../models/AuditLog.js';

export async function getTriageResults(req, res) {
  try {
    const { needsHuman, category, priority, limit = 20, page = 1 } = req.query;

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

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const results = await TriageResult.find(filter)
      .populate('messageId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    const total = await TriageResult.countDocuments(filter);
    const totalPages = Math.ceil(total / parsedLimit) || 1;

    res.json({
      success: true,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
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
