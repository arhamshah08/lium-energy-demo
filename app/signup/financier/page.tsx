import { SignupForm } from '@/components/auth/signup-form'

export default function FinancierSignUpPage() {
  return (
    <SignupForm config={{
      role: 'financier',
      title: 'Financier',
      designationLabel: 'Job Title',
      designationPlaceholder: 'Managing Director',
      showFinancierType: true,
    }} />
  )
}
