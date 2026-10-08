import { Button, Paper, Stack, Typography } from '@mui/material'

function QuickActions() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Quick Actions
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button variant="contained">
          New Admission
        </Button>

        <Button variant="outlined">
          Register Visitor
        </Button>

        <Button variant="outlined">
          Request Transfer
        </Button>
      </Stack>
    </Paper>
  )
}

export default QuickActions