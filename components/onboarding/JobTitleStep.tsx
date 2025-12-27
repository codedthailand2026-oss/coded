/**
 * Job Title Step Component
 *
 * Step 3: Job title selection (button grid, not dropdown)
 */

'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JOB_TITLES } from '@/types/onboarding';
import type { OnboardingStepProps, JobTitle } from '@/types/onboarding';
import { cn } from '@/lib/utils';

export default function JobTitleStep({
  data,
  onNext,
  onBack,
}: OnboardingStepProps) {
  const [selected, setSelected] = useState<JobTitle | null>(
    data.job_title || null
  );

  const handleNext = () => {
    if (!selected) {
      return;
    }
    onNext({ job_title: selected });
  };

  return (
    <div className="space-y-6">
      {/* Grid of Job Title Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {JOB_TITLES.map((job) => (
          <button
            key={job.value}
            onClick={() => setSelected(job.value)}
            className={cn(
              'relative p-4 rounded-lg border-2 transition-all',
              'hover:border-blue-400 hover:shadow-md',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'text-left',
              selected === job.value
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            )}
          >
            {/* Check Icon */}
            {selected === job.value && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            {/* Icon */}
            <div className="text-3xl mb-2">{job.icon}</div>

            {/* Label */}
            <div className="font-medium text-gray-900 dark:text-white">
              {job.label}
            </div>
          </button>
        ))}
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Select the role that best describes what you do
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        {onBack && (
          <Button onClick={onBack} variant="outline" size="lg" className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          size="lg"
          className="flex-1"
          disabled={!selected}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
