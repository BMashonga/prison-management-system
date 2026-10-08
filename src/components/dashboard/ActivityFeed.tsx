import { Paper, List, ListItem, ListItemText, Typography } from '@mui/material'
import type { DashboardActivity } from '../../data/dashboardMockData'

interface ActivityFeedProps {
  activities: DashboardActivity[]
}

function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Recent Activity
      </Typography>

      <List>
        {activities.map((activity, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 2 }}>
            <ListItemText
              primary={activity.action}
              secondary={`${activity.description} • ${activity.time}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default ActivityFeed