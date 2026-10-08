import { Alert, Paper, Stack, Typography } from '@mui/material'
import type { DashboardAlert } from '../../data/dashboardMockData'

interface AlertsProps {
  alerts: DashboardAlert[]
}

function Alerts({ alerts }: AlertsProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Alerts
      </Typography>

      <Stack spacing={2}>
        {alerts.map((alert, index) => (
          <Alert key={index} severity={alert.severity}>
            <strong>{alert.title}</strong>
            <br />
            {alert.description}
          </Alert>
        ))}
      </Stack>
    </Paper>
  )
}

export default Alerts