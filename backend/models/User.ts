import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the User interface
export interface IUser extends Document {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  dateOfBirth?: Date;
  gender?: string;
  country?: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
  upvotedTools: mongoose.Types.ObjectId[];
  wantedTools: mongoose.Types.ObjectId[];
  bookmarkedTools: mongoose.Types.ObjectId[];
}

// Create the User schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer-not-to-say']
    },
    country: {
      type: String
    },
    upvotedTools: [{ type: Schema.Types.ObjectId, ref: "Tool" }],
    wantedTools: [{ type: Schema.Types.ObjectId, ref: "Tool" }],
    bookmarkedTools: [{ type: Schema.Types.ObjectId, ref: "Tool" }],
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with stored hash
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
