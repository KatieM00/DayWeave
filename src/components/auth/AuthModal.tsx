import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
  title?: string;
  message?: string;
}

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
  title,
  message
}) => {
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSignupSuccess(false);
      setErrors({});
      setSignInData({ email: '', password: '', rememberMe: false });
      setSignUpData({ fullName: '', email: '', password: '', confirmPassword: '', acceptTerms: false });
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialMode]);

  // Close modal on successful authentication
  useEffect(() => {
    if (user && isOpen && !signupSuccess && !isLoading) {
      console.log('User authenticated, closing modal and triggering success callback');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    }
  }, [user, isOpen, signupSuccess, isLoading, onSuccess, onClose]);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return { text: 'Very Weak', color: 'text-error-default' };
      case 2: return { text: 'Weak', color: 'text-warning-default' };
      case 3: return { text: 'Fair', color: 'text-accent-600' };
      case 4: return { text: 'Good', color: 'text-success-default' };
      case 5: return { text: 'Strong', color: 'text-success-default' };
      default: return { text: '', color: '' };
    }
  };

  const validateSignIn = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signInData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signInData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!signInData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUp = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signUpData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (signUpData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!signUpData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signUpData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!signUpData.password) {
      newErrors.password = 'Password is required';
    } else if (signUpData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (getPasswordStrength(signUpData.password) < 3) {
      newErrors.password = 'Password is too weak. Include uppercase, lowercase, numbers, and special characters.';
    }

    if (!signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!signUpData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms of service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignIn()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const { error } = await signIn(signInData.email, signInData.password, signInData.rememberMe);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({
            general: 'Invalid email or password. Please check your credentials and try again.'
          });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({
            general: 'Please check your email and click the confirmation link before signing in.'
          });
        } else {
          setErrors({
            general: error.message || 'An error occurred during sign in. Please try again.'
          });
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors({
        general: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUp()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName);
      
      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({
            email: 'An account with this email already exists. Try signing in instead.'
          });
        } else if (error.message.includes('Password should be')) {
          setErrors({
            password: error.message
          });
        } else {
          setErrors({
            general: error.message || 'An error occurred during sign up. Please try again.'
          });
        }
      } else {
        setSignupSuccess(true);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({
        general: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInChange = (field: keyof SignInFormData, value: string | boolean) => {
    setSignInData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSignUpChange = (field: keyof SignUpFormData, value: string | boolean) => {
    setSignUpData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrors({});
    setSignupSuccess(false);
  };

  if (!isOpen) return null;

  if (signupSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-fadeIn">
          <Card noPadding>
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success-default" />
                </div>
                <h2 className="text-2xl font-bold text-primary-800 mb-2">Check Your Email</h2>
                <p className="text-neutral-600 mb-6">
                  We've sent a confirmation link to <strong>{signUpData.email}</strong>. 
                  Please check your email and click the link to activate your account.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => switchMode('signin')}
                  >
                    Continue to Sign In
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setSignupSuccess(false)}
                  >
                    Back to Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(signUpData.password);
  const passwordStrengthInfo = getPasswordStrengthText(passwordStrength);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-fadeIn">
        <Card noPadding>
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary-800">
                  {title || (mode === 'signin' ? 'Welcome Back' : 'Create Account')}
                </h2>
                {message && (
                  <p className="text-neutral-600 mt-1 text-sm">{message}</p>
                )}
              </div>
              <button 
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-neutral-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => switchMode('signin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                Sign In
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Sign Up
              </button>
            </div>

            {/* Error Display */}
            {errors.general && (
              <div className="mb-6 p-4 bg-error-light border border-error-default rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-error-default mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-error-dark font-medium">
                    {mode === 'signin' ? 'Sign In Failed' : 'Sign Up Failed'}
                  </p>
                  <p className="text-error-dark text-sm mt-1">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Forms */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={signInData.email}
                  onChange={(e) => handleSignInChange('email', e.target.value)}
                  error={errors.email}
                  icon={<Mail className="h-5 w-5 text-neutral-400" />}
                  fullWidth
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) => handleSignInChange('password', e.target.value)}
                    error={errors.password}
                    icon={<Lock className="h-5 w-5 text-neutral-400" />}
                    fullWidth
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signInData.rememberMe}
                      onChange={(e) => handleSignInChange('rememberMe', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-neutral-600">Remember me</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={signUpData.fullName}
                  onChange={(e) => handleSignUpChange('fullName', e.target.value)}
                  error={errors.fullName}
                  icon={<User className="h-5 w-5 text-neutral-400" />}
                  fullWidth
                  autoComplete="name"
                />

                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={signUpData.email}
                  onChange={(e) => handleSignUpChange('email', e.target.value)}
                  error={errors.email}
                  icon={<Mail className="h-5 w-5 text-neutral-400" />}
                  fullWidth
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={(e) => handleSignUpChange('password', e.target.value)}
                    error={errors.password}
                    icon={<Lock className="h-5 w-5 text-neutral-400" />}
                    fullWidth
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {signUpData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Password strength:</span>
                      <span className={passwordStrengthInfo.color}>{passwordStrengthInfo.text}</span>
                    </div>
                    <div className="mt-1 w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength <= 1 ? 'bg-error-default' :
                          passwordStrength <= 2 ? 'bg-warning-default' :
                          passwordStrength <= 3 ? 'bg-accent-500' :
                          'bg-success-default'
                        }`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => handleSignUpChange('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    icon={<Lock className="h-5 w-5 text-neutral-400" />}
                    fullWidth
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={signUpData.acceptTerms}
                    onChange={(e) => handleSignUpChange('acceptTerms', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-neutral-600">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-error-default text-sm">{errors.acceptTerms}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthModal;