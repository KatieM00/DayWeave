import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Camera,
  Shield,
  Eye,
  EyeOff,
  Globe,
  Palette,
  Clock,
  Lock,
  MapPin,
  Car,
  Plane,
  Heart,
  DollarSign,
  Save,
  X,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Smartphone,
  QrCode,
  Key,
  Settings
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  bio: string;
  profilePicture: string | null;
  emailVerified: boolean;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  backupCodes: string[];
  recoveryEmail: string;
  recoveryPhone: string;
}

interface DisplayPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  dataSharing: {
    marketing: boolean;
    analytics: boolean;
    thirdParty: boolean;
  };
  searchVisible: boolean;
  activityStatus: boolean;
}

interface TravelPreferences {
  homeLocation: string;
  transportModes: string[];
  maxTravelDistance: number;
  favoriteActivities: string[];
  preferredSeasons: string[];
  budgetRange: string;
}

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    profile: true,
    security: false,
    display: false,
    privacy: false,
    travel: false
  });

  // Form states
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+44',
    bio: '',
    profilePicture: null,
    emailVerified: false
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    backupCodes: [],
    recoveryEmail: '',
    recoveryPhone: ''
  });

  const [display, setDisplay] = useState<DisplayPreferences>({
    language: 'en',
    theme: 'system',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'private',
    dataSharing: {
      marketing: false,
      analytics: true,
      thirdParty: false
    },
    searchVisible: true,
    activityStatus: true
  });

  const [travel, setTravel] = useState<TravelPreferences>({
    homeLocation: '',
    transportModes: [],
    maxTravelDistance: 25,
    favoriteActivities: [],
    preferredSeasons: [],
    budgetRange: 'moderate'
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [showQRCode, setShowQRCode] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { 
        state: { from: { pathname: '/account' } },
        replace: true 
      });
    }
  }, [user, authLoading, navigate]);

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user profile data
      const fullName = user?.user_metadata?.full_name || '';
      const [firstName = '', lastName = ''] = fullName.split(' ');
      
      setProfile(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user?.email || '',
        emailVerified: user?.email_confirmed_at ? true : false
      }));

      // In a real app, you would load other settings from your database
      // For now, we'll use default values
    } catch (error) {
      console.error('Error loading user data:', error);
      setErrors({ general: 'Failed to load account data' });
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    const levels = [
      { text: 'Very Weak', color: 'text-error-default', bgColor: 'bg-error-default' },
      { text: 'Weak', color: 'text-error-default', bgColor: 'bg-error-default' },
      { text: 'Fair', color: 'text-warning-default', bgColor: 'bg-warning-default' },
      { text: 'Good', color: 'text-accent-600', bgColor: 'bg-accent-500' },
      { text: 'Strong', color: 'text-success-default', bgColor: 'bg-success-default' }
    ];
    return levels[strength] || levels[0];
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!profile.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!profile.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (profile.bio.length > 150) {
      newErrors.bio = 'Bio must be 150 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSecurity = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (security.newPassword) {
      if (!security.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (security.newPassword.length < 12) {
        newErrors.newPassword = 'Password must be at least 12 characters';
      }
      if (calculatePasswordStrength(security.newPassword) < 3) {
        newErrors.newPassword = 'Password is too weak';
      }
      if (security.newPassword !== security.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveSection = async (section: string) => {
    setSaving(section);
    setErrors({});
    
    try {
      let isValid = true;
      
      switch (section) {
        case 'profile':
          isValid = validateProfile();
          break;
        case 'security':
          isValid = validateSecurity();
          break;
      }

      if (!isValid) return;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      setErrors({ [section]: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(null);
    }
  };

  const resetSection = (section: string) => {
    switch (section) {
      case 'profile':
        loadUserData();
        break;
      case 'security':
        setSecurity({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          twoFactorEnabled: false,
          backupCodes: [],
          recoveryEmail: '',
          recoveryPhone: ''
        });
        break;
      case 'display':
        setDisplay({
          language: 'en',
          theme: 'system',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h'
        });
        break;
      case 'privacy':
        setPrivacy({
          profileVisibility: 'private',
          dataSharing: {
            marketing: false,
            analytics: true,
            thirdParty: false
          },
          searchVisible: true,
          activityStatus: true
        });
        break;
      case 'travel':
        setTravel({
          homeLocation: '',
          transportModes: [],
          maxTravelDistance: 25,
          favoriteActivities: [],
          preferredSeasons: [],
          budgetRange: 'moderate'
        });
        break;
    }
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setSecurity(prev => ({ ...prev, backupCodes: codes }));
  };

  const getCurrentTime = () => {
    const now = new Date();
    const timeZone = display.timezone;
    return now.toLocaleString('en-GB', { 
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(security.newPassword));
  }, [security.newPassword]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    section, 
    description 
  }: { 
    title: string; 
    icon: React.ComponentType<any>; 
    section: string;
    description: string;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors duration-200 rounded-lg"
      aria-expanded={expandedSections[section]}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <div className="text-left">
          <h2 className="text-lg font-semibold text-primary-800">{title}</h2>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-neutral-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-neutral-400" />
      )}
    </button>
  );

  const SectionActions = ({ section }: { section: string }) => (
    <div className="flex justify-between items-center pt-6 border-t border-neutral-200">
      <Button
        variant="outline"
        size="sm"
        icon={<RotateCcw className="w-4 h-4" />}
        onClick={() => resetSection(section)}
      >
        Reset to Default
      </Button>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleSection(section)}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          onClick={() => saveSection(section)}
          loading={saving === section}
          disabled={saving === section}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-800">Account Settings</h1>
          <p className="text-neutral-600 mt-1">
            Manage your profile, security, and preferences
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-success-light border border-success-default rounded-lg flex items-center">
            <Check className="w-5 h-5 text-success-default mr-3" />
            <span className="text-success-dark">{success}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <SectionHeader
              title="Profile Information"
              icon={User}
              section="profile"
              description="Update your personal information and profile picture"
            />
            
            {expandedSections.profile && (
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center text-neutral-800 font-bold text-2xl">
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800">Profile Picture</h3>
                    <p className="text-sm text-neutral-600">Upload a new profile picture</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      First Name *
                    </label>
                    <Input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      error={errors.firstName}
                      fullWidth
                      icon={<User className="w-5 h-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Last Name *
                    </label>
                    <Input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      error={errors.lastName}
                      fullWidth
                      icon={<User className="w-5 h-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address *
                      <span className="ml-2 text-xs text-neutral-500">
                        {profile.emailVerified ? (
                          <span className="text-success-default">✓ Verified</span>
                        ) : (
                          <span className="text-warning-default">⚠ Unverified</span>
                        )}
                      </span>
                    </label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      error={errors.email}
                      fullWidth
                      icon={<Mail className="w-5 h-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex">
                      <select
                        value={profile.countryCode}
                        onChange={(e) => setProfile(prev => ({ ...prev, countryCode: e.target.value }))}
                        className="border-2 border-neutral-300 rounded-l-md px-3 py-2 focus:border-primary-500 focus:outline-none"
                      >
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+49">🇩🇪 +49</option>
                      </select>
                      <Input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="rounded-l-none border-l-0"
                        fullWidth
                        icon={<Phone className="w-5 h-5" />}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Bio (150 characters max)
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    maxLength={150}
                    rows={3}
                    className="w-full border-2 border-neutral-300 rounded-md px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="Tell us a bit about yourself..."
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-neutral-500">
                      {profile.bio.length}/150 characters
                    </span>
                    {errors.bio && <span className="text-sm text-error-default">{errors.bio}</span>}
                  </div>
                </div>

                <SectionActions section="profile" />
              </div>
            )}
          </Card>

          {/* Security Section */}
          <Card>
            <SectionHeader
              title="Security & Authentication"
              icon={Shield}
              section="security"
              description="Manage your password and two-factor authentication"
            />
            
            {expandedSections.security && (
              <div className="p-6 space-y-6">
                <div className="bg-warning-light border border-warning-default rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-warning-default mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-warning-dark">Security Notice</h4>
                      <p className="text-sm text-warning-dark mt-1">
                        Use a strong, unique password and enable two-factor authentication for maximum security.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-800">Change Password</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword.current ? 'text' : 'password'}
                        value={security.currentPassword}
                        onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                        error={errors.currentPassword}
                        fullWidth
                        icon={<Lock className="w-5 h-5" />}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      >
                        {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      New Password (min. 12 characters)
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword.new ? 'text' : 'password'}
                        value={security.newPassword}
                        onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                        error={errors.newPassword}
                        fullWidth
                        icon={<Lock className="w-5 h-5" />}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      >
                        {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {security.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Password strength:</span>
                          <span className={getPasswordStrengthText(passwordStrength).color}>
                            {getPasswordStrengthText(passwordStrength).text}
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthText(passwordStrength).bgColor}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={security.confirmPassword}
                        onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        error={errors.confirmPassword}
                        fullWidth
                        icon={<Lock className="w-5 h-5" />}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      >
                        {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="text-lg font-medium text-neutral-800 mb-4">Two-Factor Authentication</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-neutral-800">Authenticator App</p>
                        <p className="text-sm text-neutral-600">
                          {security.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {security.twoFactorEnabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<QrCode className="w-4 h-4" />}
                          onClick={() => setShowQRCode(true)}
                        >
                          Show QR
                        </Button>
                      )}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.twoFactorEnabled}
                          onChange={(e) => setSecurity(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  {security.twoFactorEnabled && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Recovery Email
                        </label>
                        <Input
                          type="email"
                          value={security.recoveryEmail}
                          onChange={(e) => setSecurity(prev => ({ ...prev, recoveryEmail: e.target.value }))}
                          placeholder="backup@example.com"
                          fullWidth
                          icon={<Mail className="w-5 h-5" />}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-neutral-700">
                            Backup Codes
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Key className="w-4 h-4" />}
                            onClick={generateBackupCodes}
                          >
                            Generate New
                          </Button>
                        </div>
                        {security.backupCodes.length > 0 && (
                          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                              {security.backupCodes.map((code, index) => (
                                <div key={index} className="bg-white p-2 rounded border">
                                  {code}
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-neutral-600 mt-2">
                              Save these codes in a secure location. Each can only be used once.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <SectionActions section="security" />
              </div>
            )}
          </Card>

          {/* Display Preferences */}
          <Card>
            <SectionHeader
              title="Display Preferences"
              icon={Palette}
              section="display"
              description="Customize your language, theme, and time settings"
            />
            
            {expandedSections.display && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Language
                    </label>
                    <select
                      value={display.language}
                      onChange={(e) => setDisplay(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full border-2 border-neutral-300 rounded-md px-4 py-2 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="en">🇬🇧 English</option>
                      <option value="es">🇪🇸 Español</option>
                      <option value="fr">🇫🇷 Français</option>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="auto">🌐 Auto-detect</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={display.theme}
                      onChange={(e) => setDisplay(prev => ({ ...prev, theme: e.target.value as any }))}
                      className="w-full border-2 border-neutral-300 rounded-md px-4 py-2 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="light">☀️ Light</option>
                      <option value="dark">🌙 Dark</option>
                      <option value="system">💻 System Default</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Timezone
                      <span className="ml-2 text-xs text-neutral-500">
                        Current time: {getCurrentTime()}
                      </span>
                    </label>
                    <select
                      value={display.timezone}
                      onChange={(e) => setDisplay(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full border-2 border-neutral-300 rounded-md px-4 py-2 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="America/New_York">New York (EST)</option>
                      <option value="America/Los_Angeles">Los Angeles (PST)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={display.dateFormat}
                      onChange={(e) => setDisplay(prev => ({ ...prev, dateFormat: e.target.value as any }))}
                      className="w-full border-2 border-neutral-300 rounded-md px-4 py-2 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Time Format
                    </label>
                    <select
                      value={display.timeFormat}
                      onChange={(e) => setDisplay(prev => ({ ...prev, timeFormat: e.target.value as any }))}
                      className="w-full border-2 border-neutral-300 rounded-md px-4 py-2 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="12h">12-hour (2:30 PM)</option>
                      <option value="24h">24-hour (14:30)</option>
                    </select>
                  </div>
                </div>

                <SectionActions section="display" />
              </div>
            )}
          </Card>

          {/* Privacy Settings */}
          <Card>
            <SectionHeader
              title="Privacy Settings"
              icon={Lock}
              section="privacy"
              description="Control your privacy and data sharing preferences"
            />
            
            {expandedSections.privacy && (
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                    className="w-full border-2 border-neutral-300 rounded-md px-4 py-2 focus:border-primary-500 focus:outline-none"
                  >
                    <option value="public">🌍 Public - Anyone can see your profile</option>
                    <option value="friends">👥 Friends Only - Only friends can see your profile</option>
                    <option value="private">🔒 Private - Only you can see your profile</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-800">Data Sharing</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg cursor-pointer">
                      <div>
                        <span className="font-medium text-neutral-800">Marketing Communications</span>
                        <p className="text-sm text-neutral-600">Receive emails about new features and promotions</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.dataSharing.marketing}
                        onChange={(e) => setPrivacy(prev => ({
                          ...prev,
                          dataSharing: { ...prev.dataSharing, marketing: e.target.checked }
                        }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg cursor-pointer">
                      <div>
                        <span className="font-medium text-neutral-800">Analytics Data</span>
                        <p className="text-sm text-neutral-600">Help us improve by sharing usage analytics</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.dataSharing.analytics}
                        onChange={(e) => setPrivacy(prev => ({
                          ...prev,
                          dataSharing: { ...prev.dataSharing, analytics: e.target.checked }
                        }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg cursor-pointer">
                      <div>
                        <span className="font-medium text-neutral-800">Third-Party Sharing</span>
                        <p className="text-sm text-neutral-600">Share data with trusted partners for better recommendations</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.dataSharing.thirdParty}
                        onChange={(e) => setPrivacy(prev => ({
                          ...prev,
                          dataSharing: { ...prev.dataSharing, thirdParty: e.target.checked }
                        }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-neutral-800">Visibility Settings</h3>
                  
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg cursor-pointer">
                    <div>
                      <span className="font-medium text-neutral-800">Search Visibility</span>
                      <p className="text-sm text-neutral-600">Allow others to find you in search results</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.searchVisible}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, searchVisible: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg cursor-pointer">
                    <div>
                      <span className="font-medium text-neutral-800">Activity Status</span>
                      <p className="text-sm text-neutral-600">Show when you're active on DayWeave</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.activityStatus}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, activityStatus: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </label>
                </div>

                <SectionActions section="privacy" />
              </div>
            )}
          </Card>

          {/* Travel Preferences */}
          <Card>
            <SectionHeader
              title="Travel Preferences"
              icon={MapPin}
              section="travel"
              description="Set your travel preferences and favorite activities"
            />
            
            {expandedSections.travel && (
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Home Location
                  </label>
                  <Input
                    type="text"
                    value={travel.homeLocation}
                    onChange={(e) => setTravel(prev => ({ ...prev, homeLocation: e.target.value }))}
                    placeholder="Enter your home address"
                    fullWidth
                    icon={<MapPin className="w-5 h-5" />}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    This helps us suggest activities near you
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Preferred Transportation
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'walking', label: 'Walking', icon: '🚶' },
                      { value: 'cycling', label: 'Cycling', icon: '🚴' },
                      { value: 'driving', label: 'Driving', icon: '🚗' },
                      { value: 'public', label: 'Public Transport', icon: '🚌' },
                      { value: 'taxi', label: 'Taxi/Uber', icon: '🚕' },
                      { value: 'train', label: 'Train', icon: '🚆' }
                    ].map((mode) => (
                      <label key={mode.value} className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-300">
                        <input
                          type="checkbox"
                          checked={travel.transportModes.includes(mode.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTravel(prev => ({ ...prev, transportModes: [...prev.transportModes, mode.value] }));
                            } else {
                              setTravel(prev => ({ ...prev, transportModes: prev.transportModes.filter(m => m !== mode.value) }));
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-3"
                        />
                        <span className="mr-2">{mode.icon}</span>
                        <span className="text-sm font-medium">{mode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Maximum Travel Distance: {travel.maxTravelDistance} miles
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={travel.maxTravelDistance}
                    onChange={(e) => setTravel(prev => ({ ...prev, maxTravelDistance: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>1 mile</span>
                    <span>100 miles</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Favorite Activities (max 10)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'Museums', 'Hiking', 'Restaurants', 'Shopping', 'Parks', 'Beaches',
                      'Art Galleries', 'Sports', 'Music', 'Photography', 'History', 'Nature',
                      'Architecture', 'Food Tours', 'Nightlife', 'Markets'
                    ].map((activity) => (
                      <label key={activity} className="flex items-center p-2 border rounded cursor-pointer hover:bg-neutral-50">
                        <input
                          type="checkbox"
                          checked={travel.favoriteActivities.includes(activity)}
                          onChange={(e) => {
                            if (e.target.checked && travel.favoriteActivities.length < 10) {
                              setTravel(prev => ({ ...prev, favoriteActivities: [...prev.favoriteActivities, activity] }));
                            } else if (!e.target.checked) {
                              setTravel(prev => ({ ...prev, favoriteActivities: prev.favoriteActivities.filter(a => a !== activity) }));
                            }
                          }}
                          disabled={!travel.favoriteActivities.includes(activity) && travel.favoriteActivities.length >= 10}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-sm">{activity}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {travel.favoriteActivities.length}/10 activities selected
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Preferred Travel Seasons
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'spring', label: 'Spring', icon: '🌸' },
                      { value: 'summer', label: 'Summer', icon: '☀️' },
                      { value: 'autumn', label: 'Autumn', icon: '🍂' },
                      { value: 'winter', label: 'Winter', icon: '❄️' }
                    ].map((season) => (
                      <label key={season.value} className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-300">
                        <input
                          type="checkbox"
                          checked={travel.preferredSeasons.includes(season.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTravel(prev => ({ ...prev, preferredSeasons: [...prev.preferredSeasons, season.value] }));
                            } else {
                              setTravel(prev => ({ ...prev, preferredSeasons: prev.preferredSeasons.filter(s => s !== season.value) }));
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-3"
                        />
                        <span className="mr-2">{season.icon}</span>
                        <span className="text-sm font-medium">{season.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Budget Range Preference
                  </label>
                  <select
                    value={travel.budgetRange}
                    onChange={(e) => setTravel(prev => ({ ...prev, budgetRange: e.target.value }))}
                    className="w-full border-2 border-neutral-300 rounded-md px-4 py-2 focus:border-primary-500 focus:outline-none"
                  >
                    <option value="budget">💰 Budget (£0-50)</option>
                    <option value="moderate">💰💰 Moderate (£50-150)</option>
                    <option value="premium">💰💰💰 Premium (£150-300)</option>
                    <option value="luxury">💰💰💰💰 Luxury (£300+)</option>
                  </select>
                </div>

                <SectionActions section="travel" />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary-800">Setup Authenticator</h3>
              <button 
                onClick={() => setShowQRCode(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-48 h-48 bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-16 h-16 text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <Button
                variant="primary"
                onClick={() => setShowQRCode(false)}
                fullWidth
              >
                Done
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AccountPage;