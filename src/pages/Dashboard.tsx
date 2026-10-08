import { Box, Grid, Typography } from '@mui/material'
import KpiCard from '../components/dashboard/KpiCard'
import QuickActions from '../components/dashboard/QuickActions'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import Alerts from '../components/dashboard/Alerts'
import {
  dashboardStats,
  dashboardActivities,
  dashboardAlerts,
} from '../data/dashboardMockData'

function Dashboard() {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Overview of prison management activities
      </Typography>

      {/* KPI Summary Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Total Inmates"
            value={dashboardStats.totalInmates}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Today's Admissions"
            value={dashboardStats.todayAdmissions}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Pending Transfers"
            value={dashboardStats.pendingTransfers}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Scheduled Visits"
            value={dashboardStats.scheduledVisits}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <QuickActions />
      </Box>

      {/* Recent Activity */}
      <Box sx={{ mt: 4 }}>
        <ActivityFeed activities={dashboardActivities} />
      </Box>

      {/* Alerts */}
      <Box sx={{ mt: 4 }}>
        <Alerts alerts={dashboardAlerts} />
      </Box>
    </Box>
  )
}

export default Dashboard