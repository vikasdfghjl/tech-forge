import LogEntry from '../models/LogEntry';
import mongoose from 'mongoose';

/**
 * Create a log entry for user interactions
 * @param userId - The ID of the user performing the action
 * @param action - The action being performed
 * @param targetType - The type of item being acted upon
 * @param targetId - The ID of the item being acted upon
 * @param details - Additional details about the action
 */
export const logUserAction = async (
  userId: mongoose.Types.ObjectId,
  action: string,
  targetType: string,
  targetId: mongoose.Types.ObjectId,
  details: any = {}
): Promise<void> => {
  console.log(`[DEBUG] Logging user action: User ${userId} - ${action} - ${targetType} ${targetId}`);
  try {
    await LogEntry.create({
      user: userId,
      action,
      targetType,
      targetId,
      details
    });
    console.log(`[DEBUG] Successfully created log entry for ${action}`);
  } catch (error) {
    console.error('Failed to create log entry:', error);
    // Don't throw the error - logging failures shouldn't break the application flow
  }
};

/**
 * Get logs related to a specific item
 * @param targetType - The type of item
 * @param targetId - The ID of the item
 * @param limit - Maximum number of logs to retrieve
 */
export const getItemLogs = async (
  targetType: string,
  targetId: mongoose.Types.ObjectId,
  limit: number = 50
) => {
  console.log(`[DEBUG] Fetching logs for ${targetType} ${targetId}, limit: ${limit}`);
  return LogEntry.find({ targetType, targetId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'username email')
    .lean();
};

/**
 * Get logs for a specific user
 * @param userId - The ID of the user
 * @param limit - Maximum number of logs to retrieve
 */
export const getUserLogs = async (
  userId: mongoose.Types.ObjectId,
  limit: number = 50
) => {
  console.log(`[DEBUG] Fetching logs for user ${userId}, limit: ${limit}`);
  return LogEntry.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};
