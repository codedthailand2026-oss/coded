/**
 * Onboarding Page
 *
 * Multi-step onboarding flow for new users
 * Steps: Phone → Company → Job Title → Industry
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { OnboardingData } from '@/types/onboarding';

// Steps
import PhoneStep from '@/components/onboarding/PhoneStep';
import CompanyStep from '@/components/onboarding/CompanyStep';
import JobTitleStep from '@/components/onboarding/JobTitleStep';
import IndustryStep from '@/components/onboarding/IndustryStep';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({
    locale: 'th', // default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if already completed onboarding
  useEffect(() => {
    async function checkOnboarding() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.push('/');
      }
    }

    checkOnboarding();
  }, [supabase, router]);

  const steps = [
    {
      component: PhoneStep,
      title: 'Your Phone Number',
      description: "We'll use this to contact you if needed",
    },
    {
      component: CompanyStep,
      title: 'Company Information',
      description: 'Tell us about your organization',
    },
    {
      component: JobTitleStep,
      title: 'Your Role',
      description: 'What do you do?',
    },
    {
      component: IndustryStep,
      title: 'Your Industry',
      description: 'What industry are you in?',
    },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = (stepData: Partial<OnboardingData>) => {
    const newData = { ...data, ...stepData };
    setData(newData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - submit
      handleComplete(newData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async (finalData: Partial<OnboardingData>) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Success - redirect to home
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to save your information. Please try again.');
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {steps[currentStep].description}
            </p>
          </div>

          <CurrentStepComponent
            data={data}
            onNext={handleNext}
            onBack={currentStep > 0 ? handleBack : undefined}
          />

          {isSubmitting && (
            <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
              Saving your information...
            </div>
          )}
        </div>

        {/* Skip Button (optional) */}
        {/* <button
          onClick={() => router.push('/')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Skip for now
        </button> */}
      </div>
    </div>
  );
}
