import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

router.post('/register', async (req, res): Promise<void> => {
  console.log('Register request body:', req.body);
  try {
    const { firstName, lastName, email, password, confirmPassword, role } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const user = new User({ firstName, lastName, email, password, role });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

router.post('/login', async (req, res): Promise<void> => {
  console.log('Login request body:', req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

export default router;