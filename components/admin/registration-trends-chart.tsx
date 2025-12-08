'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RegistrationTrendsChartProps {
  customersToday: number
  customersThisWeek: number
  customersThisMonth: number
  customersHalfYear: number
  customersThisYear: number
}

export function RegistrationTrendsChart({
  customersToday,
  customersThisWeek,
  customersThisMonth,
  customersHalfYear,
  customersThisYear,
}: RegistrationTrendsChartProps) {
  const data = [
    { period: 'Today', registrations: customersToday },
    { period: 'This Week', registrations: customersThisWeek },
    { period: 'This Month', registrations: customersThisMonth },
    { period: 'Half Year', registrations: customersHalfYear },
    { period: 'This Year', registrations: customersThisYear },
  ]

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Customer Registrations</h2>
      <Card>
        <CardHeader>
          <CardTitle>Registration Trends</CardTitle>
          <CardDescription>Customer registrations over time periods</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="registrations" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 5 }}
                activeDot={{ r: 7 }}
                name="New Registrations"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
