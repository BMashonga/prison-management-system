export const roles = ['OFFICER_IN_CHARGE', 'SENIOR_PRISON_OFFICER', 'PRISON_OFFICER', 'GATEKEEPER'] as const
export type Role = (typeof roles)[number]

export const permissions = [
  'dashboard.view', 'inmates.view', 'inmates.admit', 'inmates.update',
  'custody.view', 'custody.update', 'transfers.view', 'transfers.create',
  'transfers.review', 'visitors.view', 'visitors.manage', 'releases.view',
  'releases.manage', 'releases.authorize',
] as const
export type Permission = (typeof permissions)[number]

const byRole: Record<Role, Permission[]> = {
  OFFICER_IN_CHARGE: [...permissions],
  SENIOR_PRISON_OFFICER: ['dashboard.view', 'inmates.view', 'inmates.update', 'custody.view', 'custody.update', 'transfers.view', 'transfers.create', 'transfers.review', 'visitors.view', 'visitors.manage', 'releases.view', 'releases.manage'],
  PRISON_OFFICER: ['inmates.view', 'inmates.admit', 'inmates.update', 'custody.view', 'custody.update', 'transfers.view', 'transfers.create', 'visitors.view', 'releases.view'],
  GATEKEEPER: ['inmates.view', 'visitors.view', 'visitors.manage'],
}

export const roleLabels: Record<Role, string> = {
  OFFICER_IN_CHARGE: 'Officer-in-Charge',
  SENIOR_PRISON_OFFICER: 'Senior Prison Officer',
  PRISON_OFFICER: 'Prison Officer',
  GATEKEEPER: 'Gatekeeper',
}

export const permissionsForRole = (role: Role) => byRole[role]
export const isPermission = (value: string): value is Permission => permissions.includes(value as Permission)
export function normaliseRole(value: unknown): Role | null {
  if (typeof value !== 'string') return null
  const role = value.trim().toUpperCase().replace(/[ -]/g, '_')
  return roles.includes(role as Role) ? role as Role : null
}
