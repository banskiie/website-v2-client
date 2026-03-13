"use client"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth.store"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Trophy, Users, TrendingUp, Activity, Bell, Settings, ChevronRight, Clock, DollarSign, Medal, Target, Zap, History, PiIcon, User, BarChart3, TrendingDown, TrendingUp as TrendUp, FileText, CheckCircle, XCircle, AlertCircle, Crown, Award, Star, LayoutGrid } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { gql } from "@apollo/client"
import { formatDistanceToNow, format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval, startOfYear, endOfYear } from "date-fns"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useQuery } from "@apollo/client/react"
import { JSX, useMemo, useState } from "react"

// GraphQL query for recent logs
const RECENT_LOGS = gql`
  query RecentLogs($first: Int!) {
    logs(first: $first, sort: { key: "createdAt", order: DESC }) {
      edges {
        node {
          _id
          action
          createdAt
          user {
            _id
            name
            email
            role
          }
        }
      }
    }
  }
`

// Updated GraphQL query for tournaments that matches your actual data structure
const UPCOMING_DEADLINES = gql`
  query UpcomingDeadlines($first: Int!) {
    tournaments(first: $first, sort: { key: "tournamentStart", order: ASC }) {
      edges {
        node {
          _id
          name
          isActive
          hasEarlyBird
          tournamentStart
          tournamentEnd
        }
      }
    }
  }
`

// Payment Overview Query - Get all payments
const PAYMENT_OVERVIEW = gql`
  query PaymentOverview($first: Int!) {
    payments(first: $first, sort: { key: "paymentDate", order: DESC }) {
      edges {
        node {
          _id
          amount
          paymentDate
          currentStatus
          method
        }
      }
    }
  }
`

// Entries Overview Query - Get all entries with more details
const ENTRIES_OVERVIEW = gql`
  query EntriesOverview($first: Int!) {
    entries(first: $first, sort: { key: "createdAt", order: DESC }) {
      edges {
        node {
          _id
          entryNumber
          currentStatus
          dateUpdated
          pendingAmount
          totalPaid
          hasOverpayment
          totalExcess
          hasRefunds
          totalRefundAmount
          isEarlyBird
          eventName
          tournamentName
          playerList {
            player1Name
            player2Name
          }
        }
      }
    }
  }
`

interface ILog {
  _id: string
  action: string
  createdAt: string
  user: {
    _id: string
    name: string
    email: string
    role: string
  }
}

interface ILogsResponse {
  logs: {
    edges: Array<{
      node: ILog
    }>
  }
}

// Updated interface to match your actual tournament data
interface ITournamentDeadline {
  _id: string
  name: string
  isActive: boolean
  hasEarlyBird: boolean
  tournamentStart: string
  tournamentEnd: string
}

interface ITournamentsResponse {
  tournaments: {
    edges: Array<{
      node: ITournamentDeadline
    }>
  }
}

interface IPaymentNode {
  _id: string
  amount: number
  paymentDate: string
  currentStatus: string
  method: string
}

interface IPaymentsResponse {
  payments: {
    edges: Array<{
      node: IPaymentNode
    }>
  }
}

interface IEntryNode {
  _id: string
  entryNumber: string
  currentStatus: string
  dateUpdated: string
  pendingAmount: number
  totalPaid: number
  hasOverpayment: boolean
  totalExcess: number
  hasRefunds: boolean
  totalRefundAmount: number
  isEarlyBird: boolean
  eventName: string
  tournamentName: string
  playerList: {
    player1Name: string
    player2Name: string | null
  }
}

interface IEntriesResponse {
  entries: {
    edges: Array<{
      node: IEntryNode
    }>
  }
}

interface MonthlyPayment {
  month: string
  monthDate: Date
  total: number
  count: number
  average: number
  verifiedCount: number
  verifiedTotal: number
  methods: Record<string, { count: number; total: number }>
}

interface EntryStatusSummary {
  status: string
  count: number
  totalPendingAmount: number
  totalPaidAmount: number
  color: string
  icon: any
}

interface TopEntry {
  entryNumber: string
  eventName: string
  tournamentName: string
  players: string
  status: string
  amount: number
  isEarlyBird: boolean
  date: string
}

interface EventEntryCount {
  eventName: string
  tournamentName: string
  count: number
  percentage: number
  earlyBirdCount: number
  verifiedCount: number
  pendingCount: number
  totalAmount: number
}

const Page = () => {
  const user = useAuthStore((state) => state.user)
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"))

  // Fetch recent logs
  const { data: logsData, loading: logsLoading } = useQuery<ILogsResponse>(RECENT_LOGS, {
    variables: { first: 10 },
    fetchPolicy: "network-only",
  })

  // Fetch upcoming deadlines
  const { data: tournamentsData, loading: tournamentsLoading } = useQuery<ITournamentsResponse>(UPCOMING_DEADLINES, {
    variables: { first: 10 },
    fetchPolicy: "network-only",
  })

  // Fetch payment overview
  const { data: paymentsData, loading: paymentsLoading } = useQuery<IPaymentsResponse>(PAYMENT_OVERVIEW, {
    variables: { first: 1000 },
    fetchPolicy: "network-only",
  })

  // Fetch entries overview
  const { data: entriesData, loading: entriesLoading } = useQuery<IEntriesResponse>(ENTRIES_OVERVIEW, {
    variables: { first: 1000 },
    fetchPolicy: "network-only",
  })

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get role badge color
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      ORGANIZER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      SUPPORT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      LEVELLER: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      USER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    }
    return colors[role] || colors.USER
  }

  // Get activity icon based on action text
  const getActivityIcon = (action: string) => {
    if (action.toLowerCase().includes("entry")) return <Users className="h-4 w-4" />
    if (action.toLowerCase().includes("payment")) return <DollarSign className="h-4 w-4" />
    if (action.toLowerCase().includes("tournament")) return <Trophy className="h-4 w-4" />
    if (action.toLowerCase().includes("event")) return <CalendarDays className="h-4 w-4" />
    if (action.toLowerCase().includes("approv")) return <Medal className="h-4 w-4" />
    if (action.toLowerCase().includes("reject")) return <Zap className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  // Get priority based on days left
  const getPriority = (days: number) => {
    if (days <= 3) return { label: "high", color: "text-red-600 dark:text-red-400" }
    if (days <= 7) return { label: "medium", color: "text-yellow-600 dark:text-yellow-400" }
    return { label: "low", color: "text-green-600 dark:text-green-400" }
  }

  // Calculate days until a date
  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Mock data for stats (you can replace these with real data)
  const stats = [
    {
      title: "Active Tournaments",
      value: tournamentsData?.tournaments?.edges?.filter(({ node }) => node.isActive).length.toString() || "0",
      change: "+1",
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20"
    },
    {
      title: "Total Entries",
      value: entriesData?.entries?.edges?.length.toString() || "0",
      change: "+2",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Pending Actions",
      value: entriesData?.entries?.edges?.filter(({ node }) =>
        node.currentStatus === "PENDING" ||
        node.currentStatus === "PAYMENT_PENDING" ||
        node.currentStatus === "LEVEL_PENDING"
      ).length.toString() || "0",
      change: "-1",
      icon: Activity,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    {
      title: "Completed",
      value: entriesData?.entries?.edges?.filter(({ node }) =>
        node.currentStatus === "VERIFIED" ||
        node.currentStatus === "PAYMENT_VERIFIED"
      ).length.toString() || "0",
      change: "+3",
      icon: Medal,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
  ]

  // Mock data for top performers
  const topPerformers = [
    { name: "John Smith", entries: 12, wins: 8, rank: 1 },
    { name: "Sarah Johnson", entries: 10, wins: 7, rank: 2 },
    { name: "Mike Chen", entries: 9, wins: 6, rank: 3 },
    { name: "Emma Davis", entries: 8, wins: 5, rank: 4 },
    { name: "Alex Wong", entries: 7, wins: 4, rank: 5 },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 dark:text-red-400"
      case "medium": return "text-yellow-600 dark:text-yellow-400"
      case "low": return "text-green-600 dark:text-green-400"
      default: return ""
    }
  }

  const getDeadlineStatus = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (days < 0) {
      return {
        days,
        label: "ended",
        color: "text-gray-500 dark:text-gray-400",
        displayDays: Math.abs(days)
      }
    }

    const priority = getPriority(days)
    return {
      days,
      label: priority.label,
      color: priority.color,
      displayDays: days
    }
  }

  const recentLogs = logsData?.logs?.edges?.map((edge) => edge.node) || []

  // Filter active tournaments
  const activeTournaments = tournamentsData?.tournaments?.edges?.filter(({ node }) => node.isActive) || []
  const inactiveTournaments = tournamentsData?.tournaments?.edges?.filter(({ node }) => !node.isActive) || []

  // Process all payments and group by month
  const monthlyPayments = useMemo(() => {
    if (!paymentsData?.payments?.edges) return []

    const allPayments = paymentsData.payments.edges.map(edge => edge.node)

    const endDate = new Date()
    const startDate = subMonths(endDate, 11)
    startDate.setDate(1)

    const months = eachMonthOfInterval({ start: startDate, end: endDate })

    const monthlyData: MonthlyPayment[] = months.map(monthDate => {
      return {
        month: format(monthDate, "MMMM yyyy"),
        monthDate,
        total: 0,
        count: 0,
        average: 0,
        verifiedCount: 0,
        verifiedTotal: 0,
        methods: {}
      }
    })

    allPayments.forEach(payment => {
      const paymentDate = new Date(payment.paymentDate)
      const paymentMonth = format(paymentDate, "yyyy-MM")

      const monthData = monthlyData.find(m => format(m.monthDate, "yyyy-MM") === paymentMonth)

      if (monthData) {
        monthData.count++
        monthData.total += payment.amount

        if (payment.currentStatus === "VERIFIED") {
          monthData.verifiedCount++
          monthData.verifiedTotal += payment.amount

          const method = payment.method || "OTHER"
          if (!monthData.methods[method]) {
            monthData.methods[method] = { count: 0, total: 0 }
          }
          monthData.methods[method].count++
          monthData.methods[method].total += payment.amount
        }
      }
    })

    monthlyData.forEach(month => {
      month.average = month.verifiedCount > 0 ? Math.round(month.verifiedTotal / month.verifiedCount) : 0
    })

    return monthlyData.sort((a, b) => a.monthDate.getTime() - b.monthDate.getTime())
  }, [paymentsData])

  // Get selected month data
  const selectedMonthData = useMemo(() => {
    return monthlyPayments.find(m => format(m.monthDate, "yyyy-MM") === selectedMonth)
  }, [monthlyPayments, selectedMonth])

  // Calculate total for all time
  const allTimeTotal = useMemo(() => {
    return monthlyPayments.reduce((sum, month) => sum + month.verifiedTotal, 0)
  }, [monthlyPayments])

  // Calculate growth compared to previous month
  const growthPercentage = useMemo(() => {
    if (monthlyPayments.length < 2) return 0

    const currentMonth = monthlyPayments[monthlyPayments.length - 1].verifiedTotal
    const previousMonth = monthlyPayments[monthlyPayments.length - 2].verifiedTotal

    if (previousMonth === 0) return currentMonth > 0 ? 100 : 0
    return ((currentMonth - previousMonth) / previousMonth) * 100
  }, [monthlyPayments])

  // Find best month
  const bestMonth = useMemo(() => {
    if (monthlyPayments.length === 0) return null
    return monthlyPayments.reduce((best, current) =>
      current.verifiedTotal > best.verifiedTotal ? current : best
    )
  }, [monthlyPayments])

  // Process entries for summary
  const entrySummary = useMemo(() => {
    if (!entriesData?.entries?.edges) return {
      total: 0,
      byStatus: [],
      totalPendingAmount: 0,
      totalPaidAmount: 0,
      totalRefundAmount: 0,
      totalExcess: 0,
      earlyBirdCount: 0,
      overpaymentCount: 0
    }

    const entries = entriesData.entries.edges.map(edge => edge.node)

    // Status colors and icons
    const statusConfig: Record<string, { color: string; icon: any }> = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", icon: AlertCircle },
      ASSIGNED: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", icon: Users },
      LEVEL_PENDING: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", icon: TrendingUp },
      LEVEL_APPROVED: { color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300", icon: CheckCircle },
      PAYMENT_PENDING: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300", icon: Clock },
      PAYMENT_PARTIALLY_PAID: { color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300", icon: DollarSign },
      PAYMENT_PAID: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300", icon: DollarSign },
      PAYMENT_VERIFIED: { color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300", icon: CheckCircle },
      VERIFIED: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", icon: CheckCircle },
      REJECTED: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", icon: XCircle },
      CANCELLED: { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: XCircle },
    }

    // Group by status
    const statusMap = new Map<string, { count: number; totalPendingAmount: number; totalPaidAmount: number }>()

    let totalPendingAmount = 0
    let totalPaidAmount = 0
    let totalRefundAmount = 0
    let totalExcess = 0
    let earlyBirdCount = 0
    let overpaymentCount = 0

    entries.forEach(entry => {
      const status = entry.currentStatus
      const pending = entry.pendingAmount || 0
      const paid = entry.totalPaid || 0
      const refund = entry.totalRefundAmount || 0
      const excess = entry.totalExcess || 0

      if (!statusMap.has(status)) {
        statusMap.set(status, { count: 0, totalPendingAmount: 0, totalPaidAmount: 0 })
      }

      const current = statusMap.get(status)!
      current.count++
      current.totalPendingAmount += pending
      current.totalPaidAmount += paid

      totalPendingAmount += pending
      totalPaidAmount += paid
      totalRefundAmount += refund
      totalExcess += excess

      if (entry.isEarlyBird) earlyBirdCount++
      if (entry.hasOverpayment) overpaymentCount++
    })

    const byStatus: EntryStatusSummary[] = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      totalPendingAmount: data.totalPendingAmount,
      totalPaidAmount: data.totalPaidAmount,
      color: statusConfig[status]?.color || "bg-gray-100 text-gray-800",
      icon: statusConfig[status]?.icon || Activity
    }))

    return {
      total: entries.length,
      byStatus,
      totalPendingAmount,
      totalPaidAmount,
      totalRefundAmount,
      totalExcess,
      earlyBirdCount,
      overpaymentCount
    }
  }, [entriesData])

  // Get top entries by registration (most recent)
  const topEntries = useMemo(() => {
    if (!entriesData?.entries?.edges) return []

    return entriesData.entries.edges
      .map(edge => edge.node)
      .sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime())
      .slice(0, 5)
      .map(entry => ({
        entryNumber: entry.entryNumber,
        eventName: entry.eventName || "Unknown Event",
        tournamentName: entry.tournamentName || "Unknown Tournament",
        players: entry.playerList?.player2Name
          ? `${entry.playerList.player1Name} & ${entry.playerList.player2Name}`
          : entry.playerList?.player1Name || "Unknown Player",
        status: entry.currentStatus,
        amount: entry.pendingAmount,
        isEarlyBird: entry.isEarlyBird,
        date: entry.dateUpdated
      }))
  }, [entriesData])

  // NEW: Group entries by event
  const entriesByEvent = useMemo(() => {
    if (!entriesData?.entries?.edges) return []

    const entries = entriesData.entries.edges.map(edge => edge.node)
    const eventMap = new Map<string, EventEntryCount>()

    let totalEntries = entries.length

    entries.forEach(entry => {
      const eventName = entry.eventName || "Unknown Event"
      const tournamentName = entry.tournamentName || "Unknown Tournament"
      const key = `${tournamentName} - ${eventName}`

      if (!eventMap.has(key)) {
        eventMap.set(key, {
          eventName: eventName,
          tournamentName: tournamentName,
          count: 0,
          percentage: 0,
          earlyBirdCount: 0,
          verifiedCount: 0,
          pendingCount: 0,
          totalAmount: 0
        })
      }

      const eventData = eventMap.get(key)!
      eventData.count++
      eventData.totalAmount += entry.pendingAmount || 0

      if (entry.isEarlyBird) eventData.earlyBirdCount++
      if (entry.currentStatus === "VERIFIED" || entry.currentStatus === "PAYMENT_VERIFIED") {
        eventData.verifiedCount++
      }
      if (entry.currentStatus === "PENDING" || entry.currentStatus === "PAYMENT_PENDING" || entry.currentStatus === "LEVEL_PENDING") {
        eventData.pendingCount++
      }
    })

    // Calculate percentages
    const result = Array.from(eventMap.values())
    result.forEach(event => {
      event.percentage = (event.count / totalEntries) * 100
    })

    // Sort by count (highest first)
    return result.sort((a, b) => b.count - a.count)
  }, [entriesData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Label className="text-3xl mt-2 font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </Label>
          <p className="text-muted-foreground">
            Here's what's happening with your tournaments and entries today.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <Link href="/logs" passHref>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View all
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Latest system activities and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {logsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))
                  ) : recentLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No activity logs found
                    </div>
                  ) : (
                    recentLogs.map((log: ILog, index: number) => {
                      const Icon = getActivityIcon(log.action)
                      return (
                        <div key={log._id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                          <div className={`p-2 rounded-full ${getRoleColor(log.user.role)} bg-opacity-20`}>
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium leading-none">
                                {log.user.name || log.user.email}
                              </p>
                              <Badge className={cn(getRoleColor(log.user.role), "text-[10px] px-1.5 py-0")}>
                                {log.user.role.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {log.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <Button variant="link" className="mt-4 w-full" size="sm" asChild>
                  <Link href="/logs">
                    View all activity
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tournament Schedule
                </CardTitle>
                <CardDescription>
                  Active and upcoming tournaments timeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tournamentsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))
                  ) : tournamentsData?.tournaments?.edges?.length ? (
                    <>
                      {activeTournaments.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Active Tournaments
                          </h4>
                          {activeTournaments.map(({ node }) => {
                            const startDate = new Date(node.tournamentStart)
                            const endDate = new Date(node.tournamentEnd)
                            const now = new Date()

                            const totalDuration = endDate.getTime() - startDate.getTime()
                            const elapsed = now.getTime() - startDate.getTime()
                            const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

                            const startStatus = getDeadlineStatus(node.tournamentStart)
                            const endStatus = getDeadlineStatus(node.tournamentEnd)

                            return (
                              <div key={node._id} className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20 rounded-lg border border-green-100 dark:border-green-900">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    <p className="text-sm font-semibold">{node.name}</p>
                                  </div>
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                                    {node.hasEarlyBird ? "Early Bird Available" : "Regular Rate"}
                                  </Badge>
                                </div>

                                <div className="space-y-3">
                                  <div className="relative flex justify-between text-xs text-muted-foreground px-1">
                                    <span className="text-green-600 font-medium">{format(startDate, "MMM dd, yyyy")}</span>
                                    <span className="text-red-600 font-medium">{format(endDate, "MMM dd, yyyy")}</span>
                                  </div>

                                  <div className="relative py-4">
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />

                                    {now >= startDate && now <= endDate && (
                                      <div
                                        className="absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                      />
                                    )}

                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2">
                                      <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm mb-1" />
                                        <span className="text-[10px] font-medium text-green-600 whitespace-nowrap absolute top-4">
                                          Starts
                                        </span>
                                      </div>
                                    </div>

                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2">
                                      <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm mb-1" />
                                        <span className="text-[10px] font-medium text-red-600 whitespace-nowrap absolute top-4">
                                          Ends
                                        </span>
                                      </div>
                                    </div>

                                    {now >= startDate && now <= endDate && (
                                      <div
                                        className="absolute top-1/2 -translate-y-1/2"
                                        style={{ left: `${progress}%` }}
                                      >
                                        <div className="flex flex-col items-center">
                                          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg animate-pulse mb-1" />
                                          <span className="text-[10px] font-bold text-blue-600 whitespace-nowrap absolute top-5 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                                            Now
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-between text-xs pt-1">
                                    <div className="flex items-center gap-1">
                                      <CalendarDays className="h-3 w-3 text-green-600" />
                                      <span className={startStatus.color}>
                                        {startStatus.days < 0
                                          ? `Started ${startStatus.displayDays} days ago`
                                          : `Starts in ${startStatus.displayDays} days`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <CalendarDays className="h-3 w-3 text-red-600" />
                                      <span className={endStatus.color}>
                                        {endStatus.days < 0
                                          ? `Ended ${endStatus.displayDays} days ago`
                                          : `${endStatus.displayDays} days left`}
                                      </span>
                                    </div>
                                  </div>

                                  {now >= startDate && now <= endDate && (
                                    <div className="flex justify-end">
                                      <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded">
                                        {Math.round(progress)}% Complete
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {inactiveTournaments.length > 0 && (
                        <div className="space-y-3 mt-6">
                          <h4 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            Past Tournaments
                          </h4>
                          {inactiveTournaments.slice(0, 2).map(({ node }) => {
                            const startDate = new Date(node.tournamentStart)
                            const endDate = new Date(node.tournamentEnd)
                            return (
                              <div key={node._id} className="space-y-2 p-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-gray-400" />
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{node.name}</p>
                                  </div>
                                  <Badge variant="outline" className="text-gray-500 border-gray-500">
                                    Completed
                                  </Badge>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs text-gray-400">
                                    <span>{format(startDate, "MMM dd, yyyy")}</span>
                                    <span>{format(endDate, "MMM dd, yyyy")}</span>
                                  </div>

                                  <div className="relative py-3">
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-700 -translate-y-1/2" />

                                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2">
                                      <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white dark:border-gray-900" />
                                    </div>

                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2">
                                      <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white dark:border-gray-900" />
                                    </div>
                                  </div>

                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Ended {formatDistanceToNow(endDate, { addSuffix: true })}</span>
                                    <span>{format(endDate, "MMM dd, yyyy")}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                          {inactiveTournaments.length > 2 && (
                            <Button variant="link" size="sm" className="w-full text-xs">
                              View {inactiveTournaments.length - 2} more past tournaments
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No tournaments found
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <h4 className="text-xs font-semibold text-primary mb-3">Tournament Summary</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{activeTournaments.length}</div>
                      <p className="text-[10px] text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {activeTournaments.filter(({ node }) => node.hasEarlyBird).length}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Early Bird</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {activeTournaments.filter(({ node }) => {
                          const start = new Date(node.tournamentStart)
                          return start > new Date()
                        }).length}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Upcoming</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-500">{inactiveTournaments.length}</div>
                      <p className="text-[10px] text-muted-foreground">Completed</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Start</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>End</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span>Current</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entry Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Entry Summary
              </CardTitle>
              <CardDescription>
                Overview of all entries by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Entry Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Total Entries</p>
                      <p className="text-2xl font-bold text-blue-600">{entrySummary.total}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Early Bird</p>
                      <p className="text-2xl font-bold text-green-600">{entrySummary.earlyBirdCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {((entrySummary.earlyBirdCount / entrySummary.total) * 100 || 0).toFixed(1)}% of total
                      </p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Overpayments</p>
                      <p className="text-2xl font-bold text-amber-600">{entrySummary.overpaymentCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ₱{entrySummary.totalExcess.toLocaleString()} excess
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Total Refunds</p>
                      <p className="text-2xl font-bold text-purple-600">₱{entrySummary.totalRefundAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">Total Pending Amount</p>
                      <p className="text-xl font-bold text-orange-600">₱{entrySummary.totalPendingAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">Total Paid Amount</p>
                      <p className="text-xl font-bold text-green-600">₱{entrySummary.totalPaidAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">Total Refund Amount</p>
                      <p className="text-xl font-bold text-red-600">₱{entrySummary.totalRefundAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Entries by Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {entrySummary.byStatus.map((status) => {
                        const Icon = status.icon
                        const percentage = (status.count / entrySummary.total) * 100
                        return (
                          <div key={status.status} className="bg-muted/20 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded-full ${status.color.split(' ')[0]}`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                                <span className="text-sm font-medium">{status.status.replace(/_/g, ' ')}</span>
                              </div>
                              <Badge variant="outline">{status.count}</Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Percentage</span>
                                <span className="font-medium">{percentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={percentage} className="h-1.5" />
                              <div className="flex justify-between text-xs mt-2">
                                <span className="text-muted-foreground">Pending: ₱{status.totalPendingAmount.toLocaleString()}</span>
                                <span className="text-muted-foreground">Paid: ₱{status.totalPaidAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NEW: Entries by Event Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-purple-500" />
                Entries by Event
              </CardTitle>
              <CardDescription>
                Number of registrations per event
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : entriesByEvent.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No entries found
                </div>
              ) : (
                <div className="space-y-4">
                  {entriesByEvent.map((event, index) => (
                    <div key={`${event.tournamentName}-${event.eventName}`} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {event.eventName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {event.tournamentName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{event.count}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.percentage.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <Progress value={event.percentage} className="h-2" />

                      {/* Stats row */}
                      <div className="flex items-center justify-between text-xs mt-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Early Bird: {event.earlyBirdCount}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Verified: {event.verifiedCount}
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending: {event.pendingCount}
                          </Badge>
                        </div>
                        <span className="font-medium text-muted-foreground">
                          ₱{event.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Entries Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Top Recent Entries
              </CardTitle>
              <CardDescription>
                Most recently registered entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : topEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No entries found
                </div>
              ) : (
                <div className="space-y-4">
                  {topEntries.map((entry, index) => {
                    const rankIcon = index === 0 ? <Crown className="h-4 w-4 text-yellow-500" /> :
                      index === 1 ? <Award className="h-4 w-4 text-gray-400" /> :
                        index === 2 ? <Star className="h-4 w-4 text-amber-600" /> :
                          <span className="text-xs font-medium text-muted-foreground w-4 text-center">#{index + 1}</span>

                    return (
                      <div key={entry.entryNumber} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          {rankIcon}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">{entry.entryNumber}</p>
                              <p className="text-xs text-muted-foreground">{entry.eventName} • {entry.tournamentName}</p>
                            </div>
                            <Badge variant={entry.isEarlyBird ? "default" : "secondary"} className={entry.isEarlyBird ? "bg-green-100 text-green-800" : ""}>
                              {entry.isEarlyBird ? "Early Bird" : "Regular"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{entry.players}</p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn(
                                entry.status === "VERIFIED" && "bg-green-50 text-green-700 border-green-200",
                                entry.status === "PAYMENT_PENDING" && "bg-yellow-50 text-yellow-700 border-yellow-200",
                                entry.status === "REJECTED" && "bg-red-50 text-red-700 border-red-200"
                              )}>
                                {entry.status.replace(/_/g, ' ')}
                              </Badge>
                              <span className="text-muted-foreground">
                                {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                              </span>
                            </div>
                            <span className="font-medium">₱{entry.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <Button variant="link" className="w-full mt-2" size="sm" asChild>
                    <Link href="/entries">
                      View all entries
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Payment Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Monthly Payment Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    className="text-sm border rounded-md px-2 py-1 bg-background"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {monthlyPayments.map((month) => (
                      <option key={month.month} value={format(month.monthDate, "yyyy-MM")}>
                        {month.month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <CardDescription>
                Verified payments breakdown by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Monthly Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Current Month</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₱{(monthlyPayments[monthlyPayments.length - 1]?.verifiedTotal || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {monthlyPayments[monthlyPayments.length - 1]?.verifiedCount || 0} payments
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Previous Month</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₱{(monthlyPayments[monthlyPayments.length - 2]?.verifiedTotal || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {monthlyPayments[monthlyPayments.length - 2]?.verifiedCount || 0} payments
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Month-over-Month</p>
                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-bold text-purple-600">
                          {growthPercentage > 0 ? '+' : ''}{growthPercentage.toFixed(1)}%
                        </p>
                        {growthPercentage > 0 ? (
                          <TrendUp className="h-5 w-5 text-green-500" />
                        ) : growthPercentage < 0 ? (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">All Time Total</p>
                      <p className="text-2xl font-bold text-amber-600">
                        ₱{allTimeTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Monthly Bar Chart */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Monthly Verified Payments (Last 12 Months)</h4>
                    <div className="h-64 flex items-end gap-2">
                      {monthlyPayments.map((month, index) => {
                        const maxTotal = Math.max(...monthlyPayments.map(m => m.verifiedTotal), 1)
                        const height = (month.verifiedTotal / maxTotal) * 100
                        const isCurrentMonth = index === monthlyPayments.length - 1

                        return (
                          <div key={month.month} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="relative w-full flex justify-center">
                              <div
                                className={`w-full max-w-[30px] rounded-t transition-all duration-300 hover:opacity-80 ${isCurrentMonth ? 'bg-green-500' : 'bg-blue-500'
                                  }`}
                                style={{ height: `${height}%`, minHeight: month.verifiedTotal > 0 ? '20px' : '4px' }}
                              />
                              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded py-1 px-2 shadow-lg">
                                <p className="font-semibold">{month.month}</p>
                                <p>Total: ₱{month.verifiedTotal.toLocaleString()}</p>
                                <p>Payments: {month.verifiedCount}</p>
                                <p>Avg: ₱{month.average.toLocaleString()}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                              {format(month.monthDate, "MMM")}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Selected Month Details */}
                  {selectedMonthData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">{selectedMonthData.month} Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Total Verified</p>
                            <p className="text-lg font-bold">₱{selectedMonthData.verifiedTotal.toLocaleString()}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Number of Payments</p>
                            <p className="text-lg font-bold">{selectedMonthData.verifiedCount}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Average Payment</p>
                            <p className="text-lg font-bold">₱{selectedMonthData.average.toLocaleString()}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Total Payments (All)</p>
                            <p className="text-lg font-bold">{selectedMonthData.count}</p>
                          </div>
                        </div>
                      </div>

                      {Object.keys(selectedMonthData.methods).length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Payment Methods - {selectedMonthData.month}</h4>
                          <div className="space-y-2">
                            {Object.entries(selectedMonthData.methods).map(([method, data]) => (
                              <div key={method} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{method.replace(/_/g, ' ')}</span>
                                    <span className="text-xs text-muted-foreground">{data.count} payments</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={(data.total / selectedMonthData.verifiedTotal) * 100}
                                      className="h-2 flex-1"
                                    />
                                    <span className="text-xs font-medium w-16">
                                      ₱{data.total.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Best Month Highlight */}
                  {bestMonth && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <h4 className="text-sm font-semibold">Best Performing Month</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Month</p>
                          <p className="text-sm font-bold">{bestMonth.month}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-sm font-bold text-green-600">₱{bestMonth.verifiedTotal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Payments</p>
                          <p className="text-sm font-bold">{bestMonth.verifiedCount}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No payments state */}
                  {monthlyPayments.every(m => m.verifiedCount === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No verified payments found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard & Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Players with highest win rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.rank} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                            index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                              'bg-muted text-muted-foreground'
                          }`}>
                          {performer.rank}
                        </div>
                        <span className="text-sm font-medium">{performer.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{performer.entries} entries</span>
                        <Badge variant="secondary">{performer.wins} wins</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Detailed statistics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Analytics charts will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and download reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Reports interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Page