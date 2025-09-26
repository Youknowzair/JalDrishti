import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the User interface
interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'community' | 'agent' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the schema with IUser type
const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['community', 'agent', 'admin'], default: 'community' }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Add comparePassword method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const User = model<IUser>('User', userSchema);
export default User;