/**
 * Phone Step Component
 *
 * Step 1: Phone number with country code selector
 */

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRY_CODES } from '@/types/onboarding';
import type { OnboardingStepProps } from '@/types/onboarding';

export default function PhoneStep({ data, onNext }: OnboardingStepProps) {
  const [countryCode, setCountryCode] = useState(data.phone?.substring(0, 3) || '+66');
  const [phoneNumber, setPhoneNumber] = useState(
    data.phone?.substring(countryCode.length) || ''
  );
  const [error, setError] = useState('');

  const handleNext = () => {
    // Validate
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Please enter a valid phone number (at least 8 digits)');
      return;
    }

    // Clean phone number (remove spaces, dashes)
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');

    if (!/^\d+$/.test(cleanPhone)) {
      setError('Phone number should contain only digits');
      return;
    }

    const fullPhone = `${countryCode}${cleanPhone}`;
    onNext({ phone: fullPhone });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Country Code + Phone Number */}
        <div className="flex gap-3">
          {/* Country Code Selector */}
          <div className="w-32">
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number Input */}
          <div className="flex-1">
            <Input
              type="tel"
              placeholder="812345678"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNext();
                }
              }}
              className="text-lg"
              autoFocus
            />
          </div>
        </div>

        {/* Preview */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Full number: {countryCode}{phoneNumber || 'XXXXXXXXXX'}
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        {/* Help Text */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          We'll use this to send you important updates about your account
        </div>
      </div>

      {/* Next Button */}
      <Button onClick={handleNext} size="lg" className="w-full">
        Continue
      </Button>
    </div>
  );
}
