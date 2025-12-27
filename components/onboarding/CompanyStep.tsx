/**
 * Company Step Component
 *
 * Step 2: Company name input
 */

'use client';

import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OnboardingStepProps } from '@/types/onboarding';

export default function CompanyStep({
  data,
  onNext,
  onBack,
}: OnboardingStepProps) {
  const [companyName, setCompanyName] = useState(data.company_name || '');
  const [error, setError] = useState('');

  const handleNext = () => {
    // Validate
    if (!companyName || companyName.trim().length < 2) {
      setError('Please enter your company name (at least 2 characters)');
      return;
    }

    onNext({ company_name: companyName.trim() });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Icon */}
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Input */}
        <div>
          <Input
            type="text"
            placeholder="Your Company or Organization"
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleNext();
              }
            }}
            className="text-lg text-center"
            autoFocus
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Help Text */}
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          This helps us personalize your experience
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        {onBack && (
          <Button onClick={onBack} variant="outline" size="lg" className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={handleNext} size="lg" className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
