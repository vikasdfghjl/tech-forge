import mongoose from 'mongoose';
import Tool, { ITool } from '../../models/Tool';

// Connect to a test MongoDB instance
beforeAll(async () => {
  const mongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/tech-forge-test';
  await mongoose.connect(mongoURI);
});

// Clear all test data after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Clean up after each test
afterEach(async () => {
  await Tool.deleteMany({});
});

describe('Tool Model Test', () => {
  // Test creating a tool
  it('should create & save a tool successfully', async () => {
    const userData = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test User',
      email: 'test@example.com'
    };
    
    const toolData = {
      name: 'Test Tool',
      description: 'A tool for testing',
      category: 'Testing',
      creator: userData._id
    };

    const tool = new Tool(toolData);
    const savedTool = await tool.save();

    // Object should exist
    expect(savedTool._id).toBeDefined();
    expect(savedTool.name).toBe(toolData.name);
    expect(savedTool.description).toBe(toolData.description);
    expect(savedTool.category).toBe(toolData.category);
    expect(savedTool.creator.toString()).toBe(userData._id.toString());
    expect(savedTool.upvotes).toBe(0);
    expect(savedTool.wants).toBe(0);
    expect(savedTool.comments).toHaveLength(0);
    expect(savedTool.createdAt).toBeDefined();
    expect(savedTool.updatedAt).toBeDefined();
  });

  // Test for required fields
  it('should fail when required fields are missing', async () => {
    const toolWithoutRequiredFields = new Tool({
      category: 'Testing'
    });
    
    let error: any = null;
    try {
      await toolWithoutRequiredFields.save();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.description).toBeDefined();
  });

  // Test adding a comment to a tool
  it('should add a comment to a tool', async () => {
    const toolData = {
      name: 'Test Tool',
      description: 'A tool for testing',
      category: 'Testing',
      creator: new mongoose.Types.ObjectId()
    };
    
    const tool = new Tool(toolData);
    await tool.save();
    
    // Add a comment
    tool.comments.push({
      text: 'This is a test comment',
      author: new mongoose.Types.ObjectId(),
      createdAt: new Date()
    } as any); // Using type assertion to bypass TS error
    
    await tool.save();
    
    // Find the tool and check if the comment was added
    const updatedTool = await Tool.findById(tool._id);
    expect(updatedTool?.comments).toHaveLength(1);
    expect(updatedTool?.comments[0].text).toBe('This is a test comment');
    expect(updatedTool?.comments[0].author.toString()).toBe(tool.comments[0].author.toString());
  });
});