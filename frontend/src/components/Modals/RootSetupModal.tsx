import React, { useState } from 'react';
import { 
  XMarkIcon,
  ShieldCheckIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  RectangleStackIcon,
  CheckCircleIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface RootSetupData {
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  appName: string;
  defaultColumns: string[];
}

interface RootSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: (setupData: RootSetupData) => Promise<void>;
}

// Default column templates
const DEFAULT_COLUMN_SETS = [
  {
    name: 'Basic Kanban',
    description: 'Simple three-column workflow',
    columns: ['To Do', 'In Progress', 'Done']
  },
  {
    name: 'Development Workflow',
    description: 'Software development process',
    columns: ['Backlog', 'In Progress', 'Code Review', 'Testing', 'Completed']
  },
  {
    name: 'Content Creation',
    description: 'Content production pipeline',
    columns: ['Ideas', 'Drafting', 'Review', 'Published']
  },
  {
    name: 'Project Management',
    description: 'Comprehensive project workflow',
    columns: ['Planning', 'In Progress', 'Review', 'Approved', 'Done']
  }
];

export const RootSetupModal: React.FC<RootSetupModalProps> = ({
  isOpen,
  onClose,
  onSetupComplete
}) => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RootSetupData>({
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    appName: 'Offline Kanban',
    defaultColumns: DEFAULT_COLUMN_SETS[0].columns
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedColumnSet, setSelectedColumnSet] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;

  // Validation for each step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // App configuration
      if (!formData.appName.trim()) {
        newErrors.appName = 'Application name is required';
      }
    }

    if (step === 2) {
      // Admin user setup
      if (!formData.adminName.trim()) {
        newErrors.adminName = 'Admin name is required';
      } else if (formData.adminName.length < 2) {
        newErrors.adminName = 'Name must be at least 2 characters';
      }

      if (!formData.adminEmail.trim()) {
        newErrors.adminEmail = 'Admin email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
        newErrors.adminEmail = 'Please enter a valid email address';
      }

      if (!formData.adminPassword) {
        newErrors.adminPassword = 'Admin password is required';
      } else if (formData.adminPassword.length < 6) {
        newErrors.adminPassword = 'Password must be at least 6 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm the password';
      } else if (formData.adminPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 3) {
      // Board setup
      if (!formData.defaultColumns.length) {
        newErrors.columns = 'At least one column is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      await onSetupComplete(formData);
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Setup failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof RootSetupData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle column set selection
  const handleColumnSetSelection = (index: number) => {
    setSelectedColumnSet(index);
    handleInputChange('defaultColumns', DEFAULT_COLUMN_SETS[index].columns);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cog8ToothIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome to Offline Kanban
              </h3>
              <p className="text-gray-600">
                Let's set up your personal productivity workspace
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Name
              </label>
              <Input
                type="text"
                value={formData.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                placeholder="My Kanban Board"
                error={errors.appName}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                This will appear in the header and browser title
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <div className="font-medium mb-2">What you'll get:</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Personal kanban board for task management</li>
                    <li>Drag-and-drop task organization</li>
                    <li>User management and permissions</li>
                    <li>Offline-first data storage</li>
                    <li>Customizable columns and workflows</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Administrator Account
              </h3>
              <p className="text-gray-600">
                Set up the main administrator account for this system
              </p>
            </div>

            {/* Admin Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Avatar
                  name={formData.adminName || 'Admin User'}
                  size="md"
                  className="border-2 border-orange-200"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {formData.adminName || 'Administrator'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.adminEmail || 'admin@example.com'}
                  </div>
                  <Badge variant="warning" className="text-xs mt-1">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    Administrator
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admin Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => handleInputChange('adminName', e.target.value)}
                  placeholder="Your full name"
                  error={errors.adminName}
                  className="w-full"
                />
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  placeholder="admin@company.com"
                  error={errors.adminEmail}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admin Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.adminPassword}
                    onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                    placeholder="Choose a secure password"
                    error={errors.adminPassword}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    error={errors.confirmPassword}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RectangleStackIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Choose Your Board Layout
              </h3>
              <p className="text-gray-600">
                Select a column template that matches your workflow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_COLUMN_SETS.map((set, index) => (
                <div
                  key={index}
                  className={`
                    border-2 rounded-lg p-4 cursor-pointer transition-all
                    ${selectedColumnSet === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleColumnSetSelection(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{set.name}</h4>
                    {selectedColumnSet === index && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{set.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {set.columns.map((column, colIndex) => (
                      <Badge key={colIndex} variant="outline" className="text-xs">
                        {column}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-700">
                  <div className="font-medium mb-1">Don't worry!</div>
                  <div>You can always customize your columns later by adding, removing, or reordering them in the admin panel.</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} size="lg" closeOnOverlayClick={false}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Initial Setup
            </h2>
            <p className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`
                  w-8 h-2 rounded-full transition-all
                  ${i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={loading}
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {currentStep < totalSteps ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};