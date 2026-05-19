export function roleHomePath(role: string): string {
  switch (role) {
    case 'developer':            return '/projects'
    case 'securitisation_agent': return '/securities'
    case 'financier':            return '/projects'
    case 'portfolio_manager':    return '/dashboard'
    case 'investor':             return '/marketplace'
    default:                     return '/dashboard'
  }
}
