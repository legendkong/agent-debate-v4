// Helper function to determine the class based on the sender
export function determineTitleClass(sender: any) {
  switch (sender) {
    case 'user':
      return 'text-orange-400'
    case 'SAP Lead Consultant':
      return 'text-violet-400'
    case 'SAP Solutions Architect':
      return 'text-blue-300'
    case 'SAP BTP Expert':
      return 'text-green-300'
    case 'Moderator':
      return 'text-amber-200 bg-blue-950'
    case 'Summary':
      return 'text-amber-400 bg-emerald-950'
    case 'Error':
      return 'text-red-300'
    default:
      return '' // Default case if needed
  }
}
