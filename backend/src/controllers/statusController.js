import  Status from '../models/Status.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import ApiError from '../helpers/errors/ApiError.js';

export const createStatus = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw ApiError.badRequest('Status content cannot be empty');
  }

  if (content.length > 250) {
    throw ApiError.badRequest('Status content cannot exceed 250 characters');
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const status = await Status.create({
    user: req.user._id,
    content,
    expiresAt
  });

  res.status(201).json(status);
});

export const getStatuses = asyncHandler(async (req, res) => {
  const statuses = await Status.find({ expiresAt: { $gt: new Date() } })
    .populate('user', 'firstName avatar')
    .sort('-createdAt');

  if (statuses.length === 0) {
    throw ApiError.notFound('No active statuses found');
  }

  res.json(statuses);
});