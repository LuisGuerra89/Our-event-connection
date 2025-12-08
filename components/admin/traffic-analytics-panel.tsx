'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Activity, Users, Share2, TrendingUp } from 'lucide-react'

interface TrafficStat {
  source: string
  medium: string
  total_visits: number
  unique_users: number
  unique_sessions: number
  percentage: number
}

interface TrafficAnalytic {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  referrer_domain: string | null
  visit_count: number
  unique_users: number
  unique_sessions: number
  visit_date: string
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

export function TrafficAnalyticsPanel() {
  const [trafficStats, setTrafficStats] = useState<TrafficStat[]>([])
  const [trafficAnalytics, setTrafficAnalytics] = useState<TrafficAnalytic[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    loadTrafficData()
  }, [period])

  async function loadTrafficData() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get traffic source summary
      const { data: stats, error: statsError } = await supabase
        .from('traffic_source_summary')
        .select('*')

      if (statsError) throw statsError
      setTrafficStats(stats || [])

      // Get traffic analytics for chart
      const { data: analytics, error: analyticsError } = await supabase
        .from('traffic_analytics')
        .select('*')
        .order('visit_date', { ascending: false })

      if (analyticsError) throw analyticsError
      setTrafficAnalytics(analytics || [])
    } catch (error) {
      console.error('Error loading traffic data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare data for pie chart
  const pieData = trafficStats.map(stat => ({
    name: stat.source || 'Direct',
    value: stat.total_visits
  }))

  // Prepare data for bar chart (daily visitors by source)
  const barData = trafficStats.map(stat => ({
    name: stat.source || 'Direct',
    visits: stat.total_visits,
    users: stat.unique_users,
    sessions: stat.unique_sessions
  }))

  // Calculate totals
  const totalVisits = trafficStats.reduce((sum, stat) => sum + stat.total_visits, 0)
  const totalUsers = trafficStats.reduce((sum, stat) => sum + stat.unique_users, 0)
  const totalSessions = trafficStats.reduce((sum, stat) => sum + stat.unique_sessions, 0)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Distinct visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Browsing sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Source</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficStats[0]?.source || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{trafficStats[0]?.percentage || 0}% of traffic</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Traffic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Distribution by Source</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-80">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Visits by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Visits by Traffic Source</CardTitle>
            <CardDescription>Breakdown by visits, users, and sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-80">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visits" fill="#ef4444" name="Visits" />
                  <Bar dataKey="users" fill="#06b6d4" name="Users" />
                  <Bar dataKey="sessions" fill="#22c55e" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources Detailed</CardTitle>
          <CardDescription>Complete breakdown of traffic sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">Source</th>
                  <th className="text-left py-2 px-4 font-semibold">Medium</th>
                  <th className="text-right py-2 px-4 font-semibold">Visits</th>
                  <th className="text-right py-2 px-4 font-semibold">Users</th>
                  <th className="text-right py-2 px-4 font-semibold">Sessions</th>
                  <th className="text-right py-2 px-4 font-semibold">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {trafficStats.map((stat, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">{stat.source || 'Direct'}</td>
                    <td className="py-2 px-4">{stat.medium || '-'}</td>
                    <td className="text-right py-2 px-4">{stat.total_visits.toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{stat.unique_users.toLocaleString()}</td>
                    <td className="text-right py-2 px-4">{stat.unique_sessions.toLocaleString()}</td>
                    <td className="text-right py-2 px-4 font-semibold">{stat.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
