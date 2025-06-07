import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Omit<SignupFormData, 'acceptTerms'> & { acceptTerms?: string; general?: string }>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

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

  const validateForm = (): boolean => {
    const newErrors: Partial<Omit<SignupFormData, 'acceptTerms'> & { acceptTerms?: string; general?: string }> = {};
  
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
  
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
  
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (getPasswordStrength(formData.password) < 3) {
      newErrors.password = 'Password is too weak. Include uppercase, lowercase, numbers, and special characters.';
    }
  
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
  
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms of service';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const { error } = await signUp(formData.email, formData.password);
      
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
      console.error('Signup error:', error);
      setErrors({
        general: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof errors];
        return newErrors;
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
        <div className="container mx-auto max-w-md">
          <Card>
            <div className="text-center">
              <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success-default" />
              </div>
              <h1 className="text-2xl font-bold text-primary-800 mb-2">Check Your Email</h1>
              <p className="text-neutral-600 mb-6">
                We've sent a confirmation link to <strong>{formData.email}</strong>. 
                Please check your email and click the link to activate your account.
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Go to Sign In
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
          </Card>
        </div>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthInfo = getPasswordStrengthText(passwordStrength);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="container mx-auto max-w-md">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-800">Create Account</h1>
            <p className="text-neutral-600 mt-2">
              Join DayWeave to start planning your perfect days
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-error-light border border-error-default rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-error-default mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-error-dark font-medium">Sign Up Failed</p>
                <p className="text-error-dark text-sm mt-1">{errors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-primary-600 font-medium mb-2">
                <User className="h-5 w-5" />
                <span>Full Name</span>
              </div>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                error={errors.fullName}
                fullWidth
                autoComplete="name"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 text-primary-600 font-medium mb-2">
                <Mail className="h-5 w-5" />
                <span>Email Address</span>
              </div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                fullWidth
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 text-primary-600 font-medium mb-2">
                <Lock className="h-5 w-5" />
                <span>Password</span>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={errors.password}
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
              {formData.password && (
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
              <p className="mt-1 text-sm text-neutral-500">
                Must be at least 8 characters with uppercase, lowercase, numbers, and special characters
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-primary-600 font-medium mb-2">
                <Lock className="h-5 w-5" />
                <span>Confirm Password</span>
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
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
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={formData.acceptTerms}
                onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-neutral-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 transition-colors">
                  Privacy Policy
                </Link>
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

          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;