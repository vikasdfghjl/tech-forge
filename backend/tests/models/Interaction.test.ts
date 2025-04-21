import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Interaction from '../../models/Interaction';
import LogEntry from '../../models/LogEntry';
import User from '../../models/User';
import Tool from '../../models/Tool';

describe('Interaction Model Test', () => {
  let mongoServer: MongoMemoryServer;
  let userId: mongoose.Types.ObjectId;
  let toolId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    
    // Create a test user
    const user = new User({
      name: 'Test User',
      email: 'interactiontest@example.com',
      username: 'interactiontester',
      password: 'Password123!'
    });
    await user.save();
    userId = user._id;
    
    // Create a test tool
    const tool = new Tool({
      name: 'Test Tool',
      description: 'Tool for interaction tests',
      category: 'testing',
      creator: userId
    });
    await tool.save();
    toolId = tool._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Interaction.deleteMany({});
    await LogEntry.deleteMany({});
  });

  it('should create & save an upvote interaction successfully', async () => {
    const interactionData = {
      user: userId,
      itemId: toolId,
      itemType: 'tool',
      interactionType: 'upvote',
      active: true
    };
    
    const validInteraction = new Interaction(interactionData);
    const savedInteraction = await validInteraction.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedInteraction._id).toBeDefined();
    expect(savedInteraction.user.toString()).toBe(userId.toString());
    expect(savedInteraction.itemId.toString()).toBe(toolId.toString());
    expect(savedInteraction.itemType).toBe('tool');
    expect(savedInteraction.interactionType).toBe('upvote');
    expect(savedInteraction.active).toBe(true);
    // Check that timestamps exist (createdAt is added by mongoose timestamps option)
    expect(savedInteraction.createdAt).toBeDefined();
    
    // Check that a log entry was created by the post-save hook
    const logEntries = await LogEntry.find({ 
      user: userId,
      targetId: toolId,
      targetType: 'tool'
    });
    expect(logEntries.length).toBe(1);
    expect(logEntries[0].action).toBe('added upvote');
    expect(logEntries[0].details.interactionId.toString()).toBe(savedInteraction._id.toString());
    expect(logEntries[0].details.status).toBe('active');
  });

  it('should create & save a want interaction successfully', async () => {
    const interactionData = {
      user: userId,
      itemId: toolId,
      itemType: 'tool',
      interactionType: 'want',
      active: true
    };
    
    const validInteraction = new Interaction(interactionData);
    const savedInteraction = await validInteraction.save();
    
    expect(savedInteraction._id).toBeDefined();
    expect(savedInteraction.interactionType).toBe('want');
    
    // Want interactions don't create log entries according to the model
    const logEntries = await LogEntry.find();
    expect(logEntries.length).toBe(0);
  });

  it('should fail when required fields are missing', async () => {
    const incompleteInteraction = new Interaction({
      user: userId,
      itemId: toolId,
      // Missing itemType
      interactionType: 'upvote'
    });
    
    let err: unknown;
    try {
      await incompleteInteraction.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail with invalid interaction type', async () => {
    const interactionWithInvalidType = new Interaction({
      user: userId,
      itemId: toolId,
      itemType: 'tool',
      interactionType: 'invalid-type', // Not in enum
      active: true
    });
    
    let err: unknown;
    try {
      await interactionWithInvalidType.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail with invalid item type', async () => {
    const interactionWithInvalidItemType = new Interaction({
      user: userId,
      itemId: toolId,
      itemType: 'invalid-item', // Not in enum
      interactionType: 'upvote',
      active: true
    });
    
    let err: unknown;
    try {
      await interactionWithInvalidItemType.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should enforce unique compound index', async () => {
    // Create first interaction
    const interaction1 = new Interaction({
      user: userId,
      itemId: toolId,
      itemType: 'tool',
      interactionType: 'upvote',
      active: true
    });
    await interaction1.save();
    
    // Try to create a duplicate interaction
    const interaction2 = new Interaction({
      user: userId,
      itemId: toolId,
      itemType: 'tool',
      interactionType: 'upvote',
      active: false // Different value, but same compound key
    });
    
    let err: any;
    try {
      await interaction2.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });

  it('should update existing interaction', async () => {
    // Create interaction
    const interaction = new Interaction({
      user: userId,
      itemId: toolId,
      itemType: 'tool',
      interactionType: 'upvote',
      active: true
    });
    await interaction.save();
    
    // Clear log entries from creation
    await LogEntry.deleteMany({});
    
    // Update interaction
    interaction.active = false;
    await interaction.save();
    
    // Verify a new log entry was created for the update
    const logEntries = await LogEntry.find();
    expect(logEntries.length).toBe(1);
    expect(logEntries[0].action).toBe('removed upvote');
    expect(logEntries[0].details.status).toBe('inactive');
  });

  it('should allow different interaction types for same user/item', async () => {
    // Create upvote interaction
    const upvoteInteraction = new Interaction({
      user: userId,
      itemId: toolId,
      itemType: 'tool',
      interactionType: 'upvote',
      active: true
    });
    await upvoteInteraction.save();
    
    // Create want interaction - should be allowed
    const wantInteraction = new Interaction({
      user: userId,
      itemId: toolId,
      itemType: 'tool',
      interactionType: 'want', // Different interaction type
      active: true
    });
    
    // This should not throw
    const savedWantInteraction = await wantInteraction.save();
    expect(savedWantInteraction._id).toBeDefined();
  });
});