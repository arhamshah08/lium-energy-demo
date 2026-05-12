import { SignupForm } from '@/components/auth/signup-form'

export default function SecuritisationAgentSignUpPage() {
  return (
    <SignupForm config={{
      role: 'securitisation_agent',
      title: 'Securitisation Agent',
      designationLabel: 'Role / Title',
      designationPlaceholder: 'Structuring Lead',
    }} />
  )
}
