export interface DashboardStats {
  totalInmates: number
  todayAdmissions: number
  pendingTransfers: number
  scheduledVisits: number
}

export interface DashboardActivity {
  action: string
  description: string
  time: string
}

export interface DashboardAlert {
  title: string
  description: string
  severity: 'warning' | 'info' | 'error'
}

export const dashboardStats: DashboardStats = {
  totalInmates: 1245,
  todayAdmissions: 12,
  pendingTransfers: 5,
  scheduledVisits: 18,
}

export const dashboardActivities: DashboardActivity[] = [
  {
    action: 'New inmate admitted',
    description: 'John Banda was admitted to the facility.',
    time: '10 minutes ago',
  },
  {
    action: 'Visitor registered',
    description: 'A visitor was registered for inmate #1042.',
    time: '25 minutes ago',
  },
  {
    action: 'Transfer request submitted',
    description: 'A transfer request is awaiting approval.',
    time: '1 hour ago',
  },
]

export const dashboardAlerts: DashboardAlert[] = [
  {
    title: 'Pending Transfer Approval',
    description: 'A transfer request is waiting for approval.',
    severity: 'warning',
  },
  {
    title: 'Scheduled Visitor',
    description: 'A visitor is scheduled to arrive today.',
    severity: 'info',
  },
]