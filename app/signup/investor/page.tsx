import { SignupForm } from '@/components/auth/signup-form'

export default function InvestorSignUpPage() {
  return (
    <SignupForm config={{
      role: 'investor',
      title: 'Investor',
      designationLabel: 'Job Title',
      designationPlaceholder: 'Chief Investment Officer',
    }} />
  )
}
