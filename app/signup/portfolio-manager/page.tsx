import { SignupForm } from '@/components/auth/signup-form'

export default function PortfolioManagerSignUpPage() {
  return (
    <SignupForm config={{
      role: 'portfolio_manager',
      title: 'Portfolio Manager',
      designationLabel: 'Job Title',
      designationPlaceholder: 'Senior Portfolio Manager',
    }} />
  )
}
