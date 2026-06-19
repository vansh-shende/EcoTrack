/**
 * Insight Controller — AI insights endpoint handlers
 */

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');
const insightService = require('../services/insightService');

exports.generate = asyncHandler(async (req, res) => {
  const insights = await insightService.generate(req.user.user_id);
  sendCreated(res, 'AI insights generated', insights);
});

exports.list = asyncHandler(async (req, res) => {
  const report = await insightService.getDynamicReport(req.user.user_id);
  sendSuccess(res, 'AI Insights report generated successfully', report);
});

exports.getById = asyncHandler(async (req, res) => {
  const insight = await insightService.getById(req.params.id, req.user.user_id);
  sendSuccess(res, 'Insight retrieved', insight);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const insight = await insightService.markAsRead(req.params.id, req.user.user_id);
  sendSuccess(res, 'Insight marked as read', insight);
});

exports.remove = asyncHandler(async (req, res) => {
  await insightService.remove(req.params.id, req.user.user_id);
  sendNoContent(res);
});
