import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import LogEntry from '../../models/LogEntry';
import User from '../../models/User';

describe('LogEntry Model Test', () => {
  let mongoServer: MongoMemoryServer;
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    
    // Create a test user to reference in logs
    const user = new User({
      name: 'Test User',
      email: 'logtest@example.com',
      username: 'logtester',
      password: 'Password123!'
    });
    await user.save();
    userId = user._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await LogEntry.deleteMany({});
  });

  it('should create & save a log entry successfully', async () => {
    const logData = {
      user: userId,
      action: 'tested',
      targetType: 'tool',
      targetId: new mongoose.Types.ObjectId(),
      details: { test: 'data', result: 'success' }
    };
    
    const validLog = new LogEntry(logData);
    const savedLog = await validLog.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedLog._id).toBeDefined();
    expect(savedLog.user.toString()).toBe(userId.toString());
    expect(savedLog.action).toBe(logData.action);
    expect(savedLog.targetType).toBe(logData.targetType);
    expect(savedLog.targetId.toString()).toBe(logData.targetId.toString());
    expect(savedLog.details).toEqual(logData.details);
    // Check that timestamps exist (createdAt is added by mongoose timestamps option)
    expect(savedLog.createdAt).toBeDefined();
  });

  it('should fail when required fields are missing', async () => {
    const logWithoutRequiredField = new LogEntry({
      user: userId,
      // Missing action field
      targetType: 'tool',
      targetId: new mongoose.Types.ObjectId()
    });
    
    let err: unknown;
    try {
      await logWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should allow empty details object', async () => {
    const logWithEmptyDetails = new LogEntry({
      user: userId,
      action: 'viewed',
      targetType: 'tool',
      targetId: new mongoose.Types.ObjectId(),
      // No details specified - should default to empty object
    });
    
    const savedLog = await logWithEmptyDetails.save();
    expect(savedLog._id).toBeDefined();
    expect(savedLog.details).toEqual({});
  });

  it('should store complex objects in details field', async () => {
    const complexDetails = {
      nestedObject: {
        value1: 'test',
        value2: 123,
        array: [1, 2, 3]
      },
      isTest: true,
      timestamp: new Date()
    };
    
    const logWithComplexDetails = new LogEntry({
      user: userId,
      action: 'processed',
      targetType: 'tool',
      targetId: new mongoose.Types.ObjectId(),
      details: complexDetails
    });
    
    const savedLog = await logWithComplexDetails.save();
    expect(savedLog.details).toEqual(complexDetails);
  });
});