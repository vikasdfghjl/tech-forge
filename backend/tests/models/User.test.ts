import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User, { IUser } from '../../models/User';

describe('User Model Test', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should create & save a user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser',
    };
    
    const validUser = new User(userData);
    const savedUser = await validUser.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.username).toBe(userData.username);
    // Password should be hashed and not equal to the original
    expect(savedUser.password).not.toBe(userData.password);
    // Check that timestamps exist (createdAt is added by mongoose timestamps option)
    expect((savedUser as any).createdAt).toBeDefined();
  });

  it('should fail when required fields are missing', async () => {
    const userWithoutRequiredField = new User({ name: 'Test User' });
    
    let err: unknown;
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail for duplicate email', async () => {
    // Create a user with an email
    await new User({
      name: 'Test User 1',
      email: 'duplicate@example.com',
      password: 'Password123!',
      username: 'testuser1'
    }).save();
    
    // Try to create another user with the same email
    const duplicateUser = new User({
      name: 'Test User 2',
      email: 'duplicate@example.com',
      password: 'Password456!',
      username: 'testuser2'
    });
    
    let err: any;
    try {
      await duplicateUser.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });
});