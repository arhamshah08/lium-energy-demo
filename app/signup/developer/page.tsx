import { SignupForm } from '@/components/auth/signup-form'

export default function DeveloperSignUpPage() {
  return (
    <SignupForm config={{
      role: 'developer',
      title: 'Project Developer',
      designationLabel: 'Job Title',
      designationPlaceholder: 'Head of Development',
    }} />
  )
}
