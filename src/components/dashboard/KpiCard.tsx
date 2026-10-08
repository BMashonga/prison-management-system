import { Card, CardContent, Typography } from '@mui/material'

interface KpiCardProps {
  title: string
  value: number
}

function KpiCard({ title, value }: KpiCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>

        <Typography variant="h4" component="p">
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default KpiCard