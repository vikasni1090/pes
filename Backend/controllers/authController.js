import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import emailValidator from 'email-validator';
import { User } from '../models/User.js';
import { VerificationCode } from '../models/VerificationCode.js';
import sendEmail from '../utils/sendEmail.js';

// Helpers
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '30d' });
};

const generateVerificationCode = () => Math.floor(1000 + Math.random() * 9000).toString();

const validatePassword = (password) => {
  const errors = [];
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character');
  return { isValid: errors.length === 0, errors };
};

// SEND VERIFICATION CODE
export const sendVerificationCode = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields are required' });

    // normalize email for DB operations and consistency
    const emailNormalized = email.trim().toLowerCase();

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) return res.status(400).json({ message: 'Password does not meet requirements!', errors: passwordValidation.errors });

    if (!emailValidator.validate(emailNormalized)) return res.status(400).json({ message: 'Please enter a valid email address.' });

    if (await User.findOne({ email: emailNormalized })) return res.status(400).json({ message: 'User already exists with this email' });

    const validRoles = ['student', 'teacher', 'admin'];
    if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role specified' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await VerificationCode.deleteMany({ email: emailNormalized });

    await VerificationCode.create({
      email: emailNormalized,
      code: verificationCode,
      registrationData: { name, email: emailNormalized, password: hashedPassword, role },
      expiresAt,
    });

    const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;">
  <div style="background:#fff;padding:30px;border-radius:10px;">
    <h1 style="color:#4b3c70;text-align:center;">Email Verification</h1>
    <p>Hi ${name},</p>
    <p>Your verification code is:</p>
    <div style="text-align:center;font-size:32px;font-weight:bold;padding:20px;background:#4b3c70;color:#fff;border-radius:8px;letter-spacing:8px;">
      ${verificationCode}
    </div>
    <p style="color:#856404;margin-top:16px;"><strong>Expires in 10 minutes.</strong></p>
  </div>
</div>`;

    let emailSent = false;
    try {
      await sendEmail(emailNormalized, 'Email Verification Code - Peer Evaluation System', html);
      emailSent = true;
    } catch (emailErr) {
      console.warn('sendVerificationCode: email failed:', emailErr.message || emailErr);
    }

    const devCode = !emailSent && process.env.NODE_ENV !== 'production' ? verificationCode : undefined;

    return res.status(200).json({
      message: emailSent ? 'Verification code sent to your email. Please check your inbox.' : 'Email unavailable. Use the devCode below to verify.',
      email: emailNormalized,
      requiresVerification: true,
      ...(devCode ? { devCode } : {}),
    });
  } catch (error) {
    console.error('sendVerificationCode error:', error);
    return res.status(500).json({ message: 'Failed to send verification code', error: error.message });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { email, code, otp } = req.body;
    const emailNormalized = email.trim().toLowerCase();
    const finalCode = code ?? otp;
    if (!email || !finalCode) return res.status(400).json({ message: 'Email and verification code are required!' });

    const record = await VerificationCode.findOne({ email: emailNormalized });
    if (!record) return res.status(400).json({ message: 'Invalid verification code' });

    // TEMP DEBUG LOGS - remove in production
    console.log('verifyEmail:');
    console.log('Received:', finalCode);
    console.log('Stored:', record.code);

    if (record.expiresAt < new Date()) {
      await VerificationCode.deleteMany({ email: emailNormalized });
      return res.status(400).json({ message: 'Verification code has expired. Please start registration again.', redirectToRegister: true });
    }

    if (String(record.code) !== String(finalCode)) return res.status(400).json({ message: 'Invalid verification code' });

    const { registrationData } = record;
    if (await User.findOne({ email: registrationData.email })) {
      await VerificationCode.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let user;
    try {
      user = await User.create({
        name: registrationData.name,
        email: registrationData.email,
        password: registrationData.password,
        role: registrationData.role,
        isVerified: true,
      });
    } catch (createErr) {
      if (createErr.code === 11000) return res.status(400).json({ message: 'User already exists with this email' });
      throw createErr;
    }

    await VerificationCode.deleteOne({ _id: record._id });

    const token = generateToken(user._id, user.role);

    try {
      await sendEmail(user.email, 'Welcome to Peer Evaluation System!', `<p>Hi ${user.name}, your account is now active!</p>`);
    } catch (e) {
      console.warn('verifyEmail: welcome email failed:', e.message || e);
    }

    return res.status(200).json({
      message: 'Email verified and registration completed',
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('verifyEmail error:', error);
    return res.status(500).json({ message: 'Email verification failed', error: error.message });
  }
};

// RESEND VERIFICATION CODE
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const emailNormalized = email.trim().toLowerCase();

    if (await User.findOne({ email: emailNormalized })) return res.status(400).json({ message: 'User already exists. Please login instead.', redirectToLogin: true });

    const existing = await VerificationCode.findOne({ email: emailNormalized });
    if (!existing) return res.status(400).json({ message: 'No pending registration found. Please register again.', redirectToRegister: true });

    const verificationCode = generateVerificationCode();
    existing.code = verificationCode;
    existing.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await existing.save();

    let emailSent = false;
    try {
      await sendEmail(emailNormalized, 'New Verification Code - Peer Evaluation System', `<p>Your new code is: <strong style="font-size:24px;letter-spacing:6px;">${verificationCode}</strong></p><p>Expires in 10 minutes.</p>`);
      emailSent = true;
    } catch (e) {
      console.warn('resendVerificationCode: email failed:', e.message || e);
    }

    const devCode = !emailSent && process.env.NODE_ENV !== 'production' ? verificationCode : undefined;

    return res.status(200).json({
      message: emailSent ? 'New verification code sent to your email' : 'Email unavailable. Use devCode.',
      ...(devCode ? { devCode } : {}),
    });
  } catch (error) {
    console.error('resendVerificationCode error:', error);
    return res.status(500).json({ message: 'Failed to resend verification code', error: error.message });
  }
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields are required' });

    const emailNormalized = email.trim().toLowerCase();

    if (await User.findOne({ email: emailNormalized })) return res.status(400).json({ message: 'User already exists.' });

    const user = await User.create({ name, email: emailNormalized, password: await bcrypt.hash(password, 10), role, isVerified: true });

    return res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.role) });
  } catch (error) {
    console.error('registerUser error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const emailNormalized = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailNormalized });
    if (!user) return res.status(400).json({ message: 'User not found.' });
    if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email first.', requiresVerification: true, email: emailNormalized });
    if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ message: 'Invalid credentials!' });

    return res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.role) });
  } catch (error) {
    console.error('loginUser error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// GET PROFILE
export const getProfile = async (req, res) => {
  if (!req.user) return res.status(404).json({ message: 'User not found' });
  return res.status(200).json({ _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, isTA: req.user.isTA });
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const emailNormalized = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailNormalized });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.tokenExpiry = Date.now() + 3600000;
    await user.save();

    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${CLIENT_URL}/reset-password/${token}`;

    try {
      await sendEmail(emailNormalized, 'Password Reset - Peer Evaluation System', `<p>Click to reset your password (valid 1 hour):</p><a href="${resetLink}">${resetLink}</a>`);
    } catch (e) {
      console.warn('forgotPassword: email failed:', e.message || e);
    }

    return res.status(200).json({ message: 'Reset link sent to your email.' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });

    const user = await User.findOne({ resetToken: token, tokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token!' });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.tokenExpiry = null;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully!' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ message: 'Server error!' });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found!' });
    if (!await bcrypt.compare(currentPassword, user.password)) return res.status(400).json({ message: 'Current password is incorrect!' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully! Logging out...' });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
