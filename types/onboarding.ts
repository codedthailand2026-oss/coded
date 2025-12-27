/**
 * Onboarding Types
 *
 * Types สำหรับ multi-step onboarding flow
 */

export type JobTitle =
  | 'marketing'
  | 'project_manager'
  | 'business_owner'
  | 'content_creator'
  | 'graphic_designer'
  | 'software_developer'
  | 'data_analyst'
  | 'sales'
  | 'hr'
  | 'other';

export type Industry =
  | 'technology'
  | 'retail'
  | 'finance'
  | 'education'
  | 'healthcare'
  | 'manufacturing'
  | 'real_estate'
  | 'hospitality'
  | 'media'
  | 'consulting'
  | 'other';

export interface OnboardingData {
  phone: string;
  company_name: string;
  job_title: JobTitle;
  industry: Industry;
  locale: 'en' | 'th';
}

export interface OnboardingStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

export const JOB_TITLES: { value: JobTitle; label: string; icon: string }[] = [
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'project_manager', label: 'Project Manager', icon: '📋' },
  { value: 'business_owner', label: 'Business Owner', icon: '💼' },
  { value: 'content_creator', label: 'Content Creator', icon: '✍️' },
  { value: 'graphic_designer', label: 'Graphic Designer', icon: '🎨' },
  { value: 'software_developer', label: 'Software Developer', icon: '💻' },
  { value: 'data_analyst', label: 'Data Analyst', icon: '📊' },
  { value: 'sales', label: 'Sales', icon: '💰' },
  { value: 'hr', label: 'Human Resources', icon: '👥' },
  { value: 'other', label: 'Other', icon: '🔧' },
];

export const INDUSTRIES: { value: Industry; label: string; icon: string }[] = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'retail', label: 'Retail & E-commerce', icon: '🛍️' },
  { value: 'finance', label: 'Finance & Banking', icon: '🏦' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { value: 'hospitality', label: 'Hospitality & Tourism', icon: '🏨' },
  { value: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { value: 'consulting', label: 'Consulting', icon: '💡' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const COUNTRY_CODES = [
  { code: '+66', country: 'TH', flag: '🇹🇭', name: 'Thailand' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+62', country: 'ID', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+84', country: 'VN', flag: '🇻🇳', name: 'Vietnam' },
];
