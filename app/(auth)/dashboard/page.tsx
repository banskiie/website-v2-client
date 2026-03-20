"use client"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth.store"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarDays, Trophy, Users, TrendingUp, Activity, Bell, Settings, ChevronRight, Clock, DollarSign, Medal, Target, Zap, History, PiIcon, User, BarChart3, TrendingDown, TrendingUp as TrendUp, FileText, CheckCircle, XCircle, AlertCircle, Crown, Award, Star, LayoutGrid, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { gql } from "@apollo/client"
import { formatDistanceToNow, format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval, startOfYear, endOfYear } from "date-fns"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useQuery } from "@apollo/client/react"
import { JSX, useMemo, useState, useEffect, useRef } from "react"
import { toast } from "sonner"

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
          transactions {
            transactionId
            transactionType
            amountChanged
            pendingAmount
            transactionDate
          }
        }
      }
    }
  }
`

const ENTRY_CHANGED = gql`
  subscription EntryChanged {
    entryChanged {
      type
      entry {
        _id
        dateUpdated
        entryNumber
        entryKey
        eventName
        tournamentName
        club
        isInSoftware
        isEarlyBird
        currentStatus
        hasOverpayment
        totalExcess
        pendingAmount
        latestPaymentAmount
        totalRefundAmount
        hasRefunds
        totalPaid
        playerList {
          player1Name
          player2Name
        }
        transactions {
          transactionId
          transactionType
          amountChanged
          pendingAmount
          transactionDate
        }
      }
      entries {
        _id
        dateUpdated
        entryNumber
        entryKey
        eventName
        tournamentName
        club
        isInSoftware
        isEarlyBird
        currentStatus
        hasOverpayment
        totalExcess
        pendingAmount
        latestPaymentAmount
        totalRefundAmount
        hasRefunds
        totalPaid
        playerList {
          player1Name
          player2Name
        }
        transactions {
          transactionId
          transactionType
          amountChanged
          pendingAmount
          transactionDate
        }
      }
    }
  }
`

const REFUND_CHANGED = gql`
  subscription RefundChanged {
    refundChanged {
      type
      refund {
        _id
        payerName
        referenceNumber
        amount
        method
        refundDate
        entries
      }
    }
  }
`

const PAYMENT_CHANGED = gql`
  subscription PaymentChanged {
    paymentChanged {
      type
       payment {
        _id
        payerName
        referenceNumber
        amount
        method
        paymentDate
        currentStatus
        entries
        # Add these missing fields
        appliedAmount
        hasExcess
        excessAmount
        refundAmountForThisPayment
        hasRefundsForThisPayment
        netAmountForThisPayment
        entryList {
          isFullyPaid
          entry {
            _id
            entryNumber
            entryKey
            transactions {
              pendingAmount
              amountChanged
              transactionType
            }
            currentStatus
          }
        }
      }
      payments {
        _id
        payerName
        referenceNumber
        amount
        method
        paymentDate
        currentStatus
        entries
        appliedAmount
        hasExcess
        excessAmount
        refundAmountForThisPayment
        hasRefundsForThisPayment
        netAmountForThisPayment
        entryList {
          isFullyPaid
          entry {
            _id
            entryNumber
            entryKey
            transactions {
              pendingAmount
              amountChanged
              transactionType
            }
            currentStatus
          }
        }
      }
    }
  }
`

const PAYMENT_OVERVIEW_FROM_ENTRIES = gql`
  query PaymentOverviewFromEntries($first: Int!) {
    entries(first: $first, sort: { key: "createdAt", order: DESC }) {
      edges {
        node {
          _id
          transactions {
            transactionId
            transactionType
            amountChanged
            pendingAmount
            transactionDate
          }
          totalPaid
          totalRefundAmount
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
  payerName?: string
  referenceNumber?: string
  entries?: string
}

interface IPaymentsResponse {
  payments: {
    edges: Array<{
      node: IPaymentNode
    }>
  }
}

interface ITransaction {
  transactionId: string
  transactionType: string
  amountChanged: number
  pendingAmount: number
  transactionDate: string
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
  transactions?: ITransaction[]
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
  _id: string
  entryNumber: string
  eventName: string
  tournamentName: string
  players: string
  status: string
  amount: number
  isEarlyBird: boolean
  date: string
  hasOverpayment?: boolean
  totalExcess?: number
  hasRefunds?: boolean
  totalRefundAmount?: number
  totalPaid?: number
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
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [newEntriesCount, setNewEntriesCount] = useState(0)
  const [newRefundsCount, setNewRefundsCount] = useState(0)
  const [newPaymentsCount, setNewPaymentsCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false)
  const prevEntriesCount = useRef(0)
  const prevPaymentsCount = useRef(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { data: logsData, loading: logsLoading, refetch: refetchLogs } = useQuery<ILogsResponse>(RECENT_LOGS, {
    variables: { first: 10 },
    fetchPolicy: "network-only",
  })

  const { data: tournamentsData, loading: tournamentsLoading } = useQuery<ITournamentsResponse>(UPCOMING_DEADLINES, {
    variables: { first: 10 },
    fetchPolicy: "network-only",
  })

  const { data: entriesPaymentData, loading: entriesPaymentLoading } = useQuery(PAYMENT_OVERVIEW_FROM_ENTRIES, {
    variables: { first: 1000 },
    fetchPolicy: "network-only",
  })

  const { data: paymentsData, loading: paymentsLoading, subscribeToMore: subscribeToMorePayments, refetch: refetchPayments } = useQuery<IPaymentsResponse>(PAYMENT_OVERVIEW, {
    variables: { first: 1000 },
    fetchPolicy: "network-only",
  })

  const { data: entriesData, loading: entriesLoading, subscribeToMore: subscribeToMoreEntries, refetch: refetchEntries } = useQuery<IEntriesResponse>(ENTRIES_OVERVIEW, {
    variables: { first: 1000 },
    fetchPolicy: "network-only",
  })

  useEffect(() => {
    if (!subscribeToMoreEntries) return

    const unsubscribeEntry = subscribeToMoreEntries({
      document: ENTRY_CHANGED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, entry, entries } = subscriptionData.data.entryChanged

        switch (type) {
          case "CREATE":
            const newEntry = entry
            const newEntryExists = prev.entries.edges.find(
              (edge: any) => edge.node._id === newEntry?._id,
            )
            if (newEntryExists) return prev

            toast.success(`New Entry Created: ${newEntry?.entryNumber}`, {
              description: `${newEntry?.eventName} - ${newEntry?.playerList?.player1Name}`,
              duration: 5000,
            })

            setNewEntriesCount(prev => prev + 1)
            setShowRefreshIndicator(true)
            setTimeout(() => setShowRefreshIndicator(false), 5000)
            setLastUpdated(new Date())

            return {
              entries: {
                ...prev.entries,
                total: prev.entries.total + 1,
                edges: [
                  { cursor: newEntry?._id, node: newEntry },
                  ...prev.entries.edges,
                ],
              },
            }

          case "VERIFIED":
            const verifiedEntry = entry
            toast.success(`💰 Entry Verified: ${verifiedEntry?.entryNumber}`, {
              description: `Payment of ₱${verifiedEntry?.totalPaid?.toLocaleString()} has been verified! 🎉`,
              duration: 5000,
            })

            const verifiedEdges = prev.entries.edges.map((edge: any) => {
              if (edge.node._id === verifiedEntry._id) {
                const existingTransactions = edge.node.transactions || []

                const newTransactions = verifiedEntry.transactions || []

                const mergedTransactions = newTransactions.length > 0 ? newTransactions : existingTransactions

                return {
                  ...edge,
                  node: {
                    ...edge.node,
                    ...verifiedEntry,
                    transactions: mergedTransactions
                  }
                }
              }
              return edge
            })

            setLastUpdated(new Date())

            return {
              entries: {
                ...prev.entries,
                edges: verifiedEdges,
              },
            }

          case "CANCEL":
            const cancelledEntry = entry
            if (cancelledEntry?.hasOverpayment && cancelledEntry?.totalExcess > 0) {
              toast.warning(
                `Entry Cancelled: ${cancelledEntry?.entryNumber}`,
                {
                  description: `Excess amount: ₱${cancelledEntry?.totalExcess?.toLocaleString()}. A refund may be required.`,
                  duration: 5000,
                }
              )
            } else {
              toast.warning(`Entry Cancelled: ${cancelledEntry?.entryNumber}`, {
                duration: 5000,
              })
            }

            const cancelledEdges = prev.entries.edges.map((edge: any) =>
              edge.node._id === cancelledEntry._id
                ? {
                  ...edge,
                  node: {
                    ...edge.node,
                    ...cancelledEntry,
                    currentStatus: "CANCELLED",
                    transactions: cancelledEntry.transactions || edge.node.transactions
                  }
                }
                : edge
            )

            setLastUpdated(new Date())

            return {
              entries: {
                ...prev.entries,
                edges: cancelledEdges,
              },
            }

          case "REFUND":
            const refundedEntry = entry
            console.log('REFUND event received - forcing recalculation', {
              entryNumber: refundedEntry?.entryNumber,
              totalRefundAmount: refundedEntry?.totalRefundAmount,
              currentRefreshTrigger: refreshTrigger
            })
            toast.info(`💰 Refund Processed: ${refundedEntry?.entryNumber}`, {
              description: `Refund amount: ₱${refundedEntry?.totalRefundAmount?.toLocaleString()}`,
              duration: 5000,
            })
            setNewRefundsCount(prev => prev + 1)
            setLastUpdated(new Date())

            setTimeout(() => {
              refetchEntries().then(() => {
                setRefreshTrigger(prev => {
                  const newValue = prev + 1
                  console.log('Setting refreshTrigger to:', newValue)
                  return newValue
                })
              })
            }, 100)

            const refundEdges = prev.entries.edges.map((edge: any) => {
              if (edge.node._id === refundedEntry._id) {
                return {
                  ...edge,
                  node: {
                    ...edge.node,
                    ...refundedEntry,
                    totalRefundAmount: refundedEntry.totalRefundAmount ?? edge.node.totalRefundAmount,
                    totalPaid: refundedEntry.totalPaid ?? edge.node.totalPaid,
                    hasRefunds: refundedEntry.hasRefunds ?? (refundedEntry.totalRefundAmount > 0),
                    pendingAmount: refundedEntry.pendingAmount ?? edge.node.pendingAmount,
                    transactions: refundedEntry.transactions || edge.node.transactions
                  }
                }
              }
              return edge
            })

            return {
              entries: {
                ...prev.entries,
                edges: refundEdges,
              },
            }

          case "UPDATE":
          case "ASSIGN":
          case "APPROVE":
          case "PAID":
          case "PARTIALLY_PAID":
          case "REJECT":
            const updatedEntry = entry

            if (type === "APPROVE") {
              toast.success(`Entry Approved: ${updatedEntry?.entryNumber}`)
            } else if (type === "PAID") {
              toast.success(`Payment Received: ${updatedEntry?.entryNumber}`)
            } else if (type === "REJECT") {
              toast.warning(`Entry Rejected: ${updatedEntry?.entryNumber}`)
            }

            const updatedEdges = prev.entries.edges.map((edge: any) =>
              edge.node._id === updatedEntry._id
                ? {
                  ...edge,
                  node: {
                    ...edge.node,
                    ...updatedEntry,
                    transactions: updatedEntry.transactions || edge.node.transactions
                  }
                }
                : edge
            )

            setLastUpdated(new Date())

            return {
              entries: {
                ...prev.entries,
                edges: updatedEdges,
              },
            }

          case "DELETE":
            const deletedEntry = entry
            toast.info(`Entry Deleted: ${deletedEntry?.entryNumber}`)

            setLastUpdated(new Date())

            return {
              entries: {
                ...prev.entries,
                total: prev.entries.total - 1,
                edges: prev.entries.edges.filter(
                  (edge: any) => edge.node._id !== deletedEntry._id
                ),
              },
            }

          case "BATCH_UPDATE":
            const updatedEntries = entries
            toast.success(`Batch Update: ${updatedEntries.length} entries updated`)

            const updatedIds = new Set(updatedEntries.map((u: any) => u._id))

            setLastUpdated(new Date())

            return {
              entries: {
                ...prev.entries,
                edges: prev.entries.edges.map((edge: any) =>
                  updatedIds.has(edge.node._id)
                    ? {
                      ...edge,
                      node: {
                        ...edge.node,
                        ...updatedEntries.find((u: any) => u._id === edge.node._id),
                      },
                    }
                    : edge
                ),
              },
            }

          default:
            return prev
        }
      },
    })

    return () => {
      unsubscribeEntry()
    }
  }, [subscribeToMoreEntries])

  useEffect(() => {
    if (entriesData?.entries?.edges) {
      const entriesWithRefunds = entriesData.entries.edges.filter(
        edge => edge.node.hasRefunds || edge.node.totalRefundAmount > 0
      );

      if (entriesWithRefunds.length > 0) {
        console.log('Entries with refunds detected:', entriesWithRefunds.map(e => ({
          entryNumber: e.node.entryNumber,
          totalRefundAmount: e.node.totalRefundAmount,
          hasRefunds: e.node.hasRefunds
        })));
      }
    }
  }, [entriesData]);

  useEffect(() => {
    if (!subscribeToMoreEntries) return

    const unsubscribeRefund = subscribeToMoreEntries({
      document: REFUND_CHANGED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, refund } = subscriptionData.data.refundChanged

        if (type === "CREATE") {
          toast.success(
            `💰 Refund Processed: ₱${refund.amount.toLocaleString()} for entries: ${refund.entries}`
          )
          setNewRefundsCount(prev => prev + 1)
          setLastUpdated(new Date())
        }

        return prev
      },
    })

    return () => {
      unsubscribeRefund?.()
    }
  }, [subscribeToMoreEntries])

  useEffect(() => {
    if (!subscribeToMorePayments) return

    const unsubscribePayment = subscribeToMorePayments({
      document: PAYMENT_CHANGED,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const { type, payment, payments } = subscriptionData.data.paymentChanged

        switch (type) {
          case "CREATE":
            const newPayment = payment
            const newPaymentExists = prev.payments.edges.find(
              (edge: any) => edge.node._id === newPayment?._id
            )
            if (newPaymentExists) return prev

            toast.success(`💰 New Payment Created: ₱${newPayment?.amount?.toLocaleString()}`, {
              description: `From: ${newPayment?.payerName}`,
              duration: 5000,
            })

            setNewPaymentsCount(prev => prev + 1)
            setShowRefreshIndicator(true)
            setTimeout(() => setShowRefreshIndicator(false), 5000)
            setLastUpdated(new Date())

            return {
              payments: {
                ...prev.payments,
                total: prev.payments.total + 1,
                edges: [
                  { cursor: newPayment?._id, node: newPayment },
                  ...prev.payments.edges,
                ],
              },
            }

          case "UPDATE":
            const updatedPayment = payment

            const oldPayment = prev.payments.edges.find(
              (edge: any) => edge.node._id === updatedPayment._id
            )?.node

            const isRefundStatus = updatedPayment.currentStatus === "REJECTED" ||
              updatedPayment.currentStatus === "DUPLICATE" ||
              updatedPayment.currentStatus === "CANCELLED" ||
              updatedPayment.currentStatus === "REFUNDED"

            if (oldPayment && oldPayment.currentStatus !== updatedPayment.currentStatus && isRefundStatus) {
              toast.info(`Payment Refunded: ₱${updatedPayment?.amount?.toLocaleString()}`, {
                description: `Status changed from ${oldPayment?.currentStatus} to ${updatedPayment?.currentStatus}`,
                duration: 5000,
              })
              setNewRefundsCount(prev => prev + 1)
            }
            else if (oldPayment && oldPayment.currentStatus === "VERIFIED" && isRefundStatus) {
              toast.info(`Payment Fully Refunded: ₱${updatedPayment?.amount?.toLocaleString()}`, {
                description: `Previously verified payment has been refunded`,
                duration: 5000,
              })
              setNewRefundsCount(prev => prev + 1)
            }
            else {
              toast.success(`Payment Updated: ₱${updatedPayment?.amount?.toLocaleString()}`, {
                description: `Status: ${updatedPayment?.currentStatus}`,
                duration: 5000,
              })
            }

            const updatedPaymentEdges = prev.payments.edges.map((edge: any) =>
              edge.node._id === updatedPayment._id
                ? { ...edge, node: updatedPayment }
                : edge
            )

            setLastUpdated(new Date())
            setShowRefreshIndicator(true)
            setTimeout(() => setShowRefreshIndicator(false), 5000)

            return {
              payments: {
                ...prev.payments,
                edges: updatedPaymentEdges,
              },
            }

          case "DELETE":
            const deletedPayment = payment
            toast.info(`Payment Deleted: ₱${deletedPayment?.amount?.toLocaleString()}`)

            setLastUpdated(new Date())

            return {
              payments: {
                ...prev.payments,
                total: prev.payments.total - 1,
                edges: prev.payments.edges.filter(
                  (edge: any) => edge.node._id !== deletedPayment._id
                ),
              },
            }

          case "BATCH_UPDATE":
            const updatedPayments = payments
            toast.success(`Batch Update: ${updatedPayments.length} payments updated`)

            const updatedIds = new Set(updatedPayments.map((u: any) => u._id))

            setLastUpdated(new Date())

            return {
              payments: {
                ...prev.payments,
                edges: prev.payments.edges.map((edge: any) =>
                  updatedIds.has(edge.node._id)
                    ? {
                      ...edge,
                      node: {
                        ...edge.node,
                        ...updatedPayments.find((u: any) => u._id === edge.node._id),
                      },
                    }
                    : edge
                ),
              },
            }

          default:
            return prev
        }
      },
    })

    return () => {
      unsubscribePayment()
    }
  }, [subscribeToMorePayments])
  useEffect(() => {
    const currentCount = entriesData?.entries?.edges?.length || 0
    if (prevEntriesCount.current > 0 && currentCount > prevEntriesCount.current) {
      const newCount = currentCount - prevEntriesCount.current
      setNewEntriesCount(prev => prev + newCount)
    }
    prevEntriesCount.current = currentCount
    setLastUpdated(new Date())
  }, [entriesData])

  useEffect(() => {
    const currentCount = paymentsData?.payments?.edges?.length || 0
    if (prevPaymentsCount.current > 0 && currentCount > prevPaymentsCount.current) {
      const newCount = currentCount - prevPaymentsCount.current
      setNewPaymentsCount(prev => prev + newCount)
    }
    prevPaymentsCount.current = currentCount
    setLastUpdated(new Date())
  }, [paymentsData])

  const handleManualRefresh = async () => {
    setShowRefreshIndicator(true)
    await Promise.all([
      refetchEntries(),
      refetchLogs(),
      refetchPayments()
    ])
    setNewEntriesCount(0)
    setNewRefundsCount(0)
    setNewPaymentsCount(0)
    setTimeout(() => setShowRefreshIndicator(false), 2000)
    toast.success("Dashboard refreshed")
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const monthlyPaymentsFromEntries = useMemo(() => {
    if (!entriesData?.entries?.edges) return []

    const endDate = new Date()
    const startDate = subMonths(endDate, 11)
    startDate.setDate(1)

    const months = eachMonthOfInterval({ start: startDate, end: endDate })

    const monthlyData: MonthlyPayment[] = months.map(monthDate => ({
      month: format(monthDate, "MMMM yyyy"),
      monthDate,
      total: 0,
      count: 0,
      average: 0,
      verifiedCount: 0,
      verifiedTotal: 0,
      methods: {}
    }))

    entriesData.entries.edges.forEach(({ node }) => {
      if (!node.transactions) return

      node.transactions.forEach(transaction => {
        const txDate = new Date(transaction.transactionDate)
        const txMonth = format(txDate, "yyyy-MM")
        const monthData = monthlyData.find(m => format(m.monthDate, "yyyy-MM") === txMonth)

        if (!monthData) return

        if (transaction.transactionType === "BALANCE_PAYMENT" && transaction.amountChanged > 0) {
          monthData.total += transaction.amountChanged
          monthData.count++
          monthData.verifiedTotal += transaction.amountChanged
          monthData.verifiedCount++

          const method = "UNKNOWN"
          if (!monthData.methods[method]) {
            monthData.methods[method] = { count: 0, total: 0 }
          }
          monthData.methods[method].count++
          monthData.methods[method].total += transaction.amountChanged
        }

        if (transaction.transactionType === "REFUND_PAYMENT" && transaction.amountChanged < 0) {
          const refundAmount = Math.abs(transaction.amountChanged)
          monthData.verifiedTotal -= refundAmount
          monthData.verifiedCount = Math.max(0, monthData.verifiedCount - 1)

          monthData.total -= refundAmount
        }
      })
    })

    monthlyData.forEach(month => {
      month.average = month.verifiedCount > 0 ? Math.round(month.verifiedTotal / month.verifiedCount) : 0
    })

    return monthlyData.sort((a, b) => a.monthDate.getTime() - b.monthDate.getTime())
  }, [entriesData])

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

  const getActivityIcon = (action: string) => {
    if (action.toLowerCase().includes("entry")) return <Users className="h-4 w-4" />
    if (action.toLowerCase().includes("payment")) return <DollarSign className="h-4 w-4" />
    if (action.toLowerCase().includes("tournament")) return <Trophy className="h-4 w-4" />
    if (action.toLowerCase().includes("event")) return <CalendarDays className="h-4 w-4" />
    if (action.toLowerCase().includes("approv")) return <Medal className="h-4 w-4" />
    if (action.toLowerCase().includes("reject")) return <Zap className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getPriority = (days: number) => {
    if (days <= 3) return { label: "high", color: "text-red-600 dark:text-red-400" }
    if (days <= 7) return { label: "medium", color: "text-yellow-600 dark:text-yellow-400" }
    return { label: "low", color: "text-green-600 dark:text-green-400" }
  }

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

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

  const activeTournaments = tournamentsData?.tournaments?.edges?.filter(({ node }) => node.isActive) || []
  const inactiveTournaments = tournamentsData?.tournaments?.edges?.filter(({ node }) => !node.isActive) || []

  // March 14, 2026
  // const monthlyPayments = useMemo(() => {
  //   if (!entriesData?.entries?.edges) return []

  //   const endDate = new Date()
  //   const startDate = subMonths(endDate, 11)
  //   startDate.setDate(1)

  //   const months = eachMonthOfInterval({ start: startDate, end: endDate })

  //   const monthlyData: MonthlyPayment[] = months.map(monthDate => ({
  //     month: format(monthDate, "MMMM yyyy"),
  //     monthDate,
  //     total: 0,
  //     count: 0,
  //     average: 0,
  //     verifiedCount: 0,
  //     verifiedTotal: 0,
  //     methods: {}
  //   }))

  //   // Process each entry's transactions
  //   entriesData.entries.edges.forEach(({ node }) => {
  //     // Get all BALANCE_PAYMENT transactions (payments received)
  //     const payments = node.transactions?.filter(t =>
  //       t.transactionType === "BALANCE_PAYMENT" && t.amountChanged > 0
  //     ) || []

  //     // Get all REFUND_PAYMENT transactions (refunds given out)
  //     const refunds = node.transactions?.filter(t =>
  //       t.transactionType === "REFUND_PAYMENT" && t.amountChanged < 0
  //     ) || []

  //     // Process payments
  //     payments.forEach(payment => {
  //       const paymentDate = new Date(payment.transactionDate)
  //       const paymentMonth = format(paymentDate, "yyyy-MM")
  //       const monthData = monthlyData.find(m => format(m.monthDate, "yyyy-MM") === paymentMonth)

  //       if (monthData) {
  //         monthData.total += payment.amountChanged
  //         monthData.count++
  //         monthData.verifiedTotal += payment.amountChanged
  //         monthData.verifiedCount++

  //         // Track payment methods if available (you might need to get this from payment records)
  //         const method = "UNKNOWN"
  //         if (!monthData.methods[method]) {
  //           monthData.methods[method] = { count: 0, total: 0 }
  //         }
  //         monthData.methods[method].count++
  //         monthData.methods[method].total += payment.amountChanged
  //       }
  //     })

  //     // Process refunds (subtract from totals)
  //     refunds.forEach(refund => {
  //       const refundDate = new Date(refund.transactionDate)
  //       const refundMonth = format(refundDate, "yyyy-MM")
  //       const monthData = monthlyData.find(m => format(m.monthDate, "yyyy-MM") === refundMonth)

  //       if (monthData) {
  //         const refundAmount = Math.abs(refund.amountChanged)
  //         monthData.verifiedTotal -= refundAmount
  //         monthData.verifiedCount = Math.max(0, monthData.verifiedCount - 1)
  //         monthData.total -= refundAmount

  //         // Also subtract from methods if you have method info
  //         // This is tricky because refunds might come from different payment methods
  //       }
  //     })
  //   })

  //   monthlyData.forEach(month => {
  //     month.average = month.verifiedCount > 0 ? Math.round(month.verifiedTotal / month.verifiedCount) : 0
  //   })

  //   return monthlyData.sort((a, b) => a.monthDate.getTime() - b.monthDate.getTime())
  // }, [entriesData])

  // Get selected month data

  const monthlyPayments = useMemo(() => {
    console.log('Recalculating monthlyPayments with refreshTrigger:', refreshTrigger)
    if (!entriesData?.entries?.edges) return []

    const endDate = new Date()
    const startDate = subMonths(endDate, 11)
    startDate.setDate(1)

    const months = eachMonthOfInterval({ start: startDate, end: endDate })

    const monthlyData: MonthlyPayment[] = months.map(monthDate => ({
      month: format(monthDate, "MMMM yyyy"),
      monthDate,
      total: 0,
      count: 0,
      average: 0,
      verifiedCount: 0,
      verifiedTotal: 0,
      methods: {}
    }))

    entriesData.entries.edges.forEach(({ node }) => {
      if (!node.transactions) return

      node.transactions.forEach(transaction => {
        const txDate = new Date(transaction.transactionDate)
        const txMonth = format(txDate, "yyyy-MM")
        const monthData = monthlyData.find(m => format(m.monthDate, "yyyy-MM") === txMonth)

        if (!monthData) return

        if (transaction.transactionType === "BALANCE_PAYMENT" && transaction.amountChanged > 0) {
          monthData.total += transaction.amountChanged
          monthData.count++
          monthData.verifiedTotal += transaction.amountChanged
          monthData.verifiedCount++
        }

        if (transaction.transactionType === "REFUND_PAYMENT" && transaction.amountChanged < 0) {
          const refundAmount = Math.abs(transaction.amountChanged)
          monthData.verifiedTotal -= refundAmount
          monthData.verifiedCount = Math.max(0, monthData.verifiedCount - 1)
          monthData.total -= refundAmount
        }
      })
    })

    monthlyData.forEach(month => {
      month.average = month.verifiedCount > 0 ? Math.round(month.verifiedTotal / month.verifiedCount) : 0
    })

    return monthlyData.sort((a, b) => a.monthDate.getTime() - b.monthDate.getTime())
  }, [entriesData, refreshTrigger])

  const selectedMonthData = useMemo(() => {
    return monthlyPayments.find(m => format(m.monthDate, "yyyy-MM") === selectedMonth)
  }, [monthlyPayments, selectedMonth])

  const allTimeTotal = useMemo(() => {
    return monthlyPayments.reduce((sum, month) => sum + month.verifiedTotal, 0)
  }, [monthlyPayments])

  const growthPercentage = useMemo(() => {
    if (monthlyPayments.length < 2) return 0

    const currentMonth = monthlyPayments[monthlyPayments.length - 1].verifiedTotal
    const previousMonth = monthlyPayments[monthlyPayments.length - 2].verifiedTotal

    if (previousMonth === 0) return currentMonth > 0 ? 100 : 0
    return ((currentMonth - previousMonth) / previousMonth) * 100
  }, [monthlyPayments])

  const bestMonth = useMemo(() => {
    if (monthlyPayments.length === 0) return null
    return monthlyPayments.reduce((best, current) =>
      current.verifiedTotal > best.verifiedTotal ? current : best
    )
  }, [monthlyPayments])

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

  const getEntriesByStatus = (status: string) => {
    if (!entriesData?.entries?.edges) return []
    return entriesData.entries.edges
      .map(edge => edge.node)
      .filter(entry => entry.currentStatus === status)
  }

  const topEntries = useMemo(() => {
    if (!entriesData?.entries?.edges) return []

    return entriesData.entries.edges
      .map(edge => edge.node)
      .sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime())
      .slice(0, 5)
      .map(entry => ({
        _id: entry._id,
        entryNumber: entry.entryNumber,
        eventName: entry.eventName || "Unknown Event",
        tournamentName: entry.tournamentName || "Unknown Tournament",
        players: entry.playerList?.player2Name
          ? `${entry.playerList.player1Name} & ${entry.playerList.player2Name}`
          : entry.playerList?.player1Name || "Unknown Player",
        status: entry.currentStatus,
        amount: entry.pendingAmount,
        isEarlyBird: entry.isEarlyBird,
        date: entry.dateUpdated,
        hasOverpayment: entry.hasOverpayment,
        totalExcess: entry.totalExcess,
        hasRefunds: entry.hasRefunds,
        totalRefundAmount: entry.totalRefundAmount,
        totalPaid: entry.totalPaid
      }))
  }, [entriesData])

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

    const result = Array.from(eventMap.values())
    result.forEach(event => {
      event.percentage = (event.count / totalEntries) * 100
    })

    return result.sort((a, b) => b.count - a.count)
  }, [entriesData])

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status)
    setIsModalOpen(true)
  }

  const getStatusDisplayName = (status: string) => {
    return status.replace(/_/g, ' ')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      VERIFIED: "bg-green-100 text-green-800 border-green-200",
      PAYMENT_VERIFIED: "bg-teal-100 text-teal-800 border-teal-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PAYMENT_PENDING: "bg-orange-100 text-orange-800 border-orange-200",
      LEVEL_PENDING: "bg-purple-100 text-purple-800 border-purple-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
      CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
      REFUNDED: "bg-purple-100 text-purple-800 border-purple-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="space-y-6">
      {/* Real-time status bar */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live updates</span>
          </div>
          {newEntriesCount > 0 && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white animate-bounce">
              +{newEntriesCount} New {newEntriesCount === 1 ? 'Entry' : 'Entries'}
            </Badge>
          )}
          {newPaymentsCount > 0 && (
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
              +{newPaymentsCount} New {newPaymentsCount === 1 ? 'Payment' : 'Payments'}
            </Badge>
          )}
          {newRefundsCount > 0 && (
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
              +{newRefundsCount} New {newRefundsCount === 1 ? 'Refund' : 'Refunds'}
            </Badge>
          )}
          {showRefreshIndicator && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Updating...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={showRefreshIndicator}
            className="h-7"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${showRefreshIndicator ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

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
            <Card className="lg:col-span-3">
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

            <Card className="lg:col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Payment Overview
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
                  Verified payments breakdown by month (refunds are automatically deducted)
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
                    {/* Mini Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Current Month</p>
                        <p className="text-lg font-bold text-green-600">
                          ₱{(monthlyPayments[monthlyPayments.length - 1]?.verifiedTotal || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {monthlyPayments[monthlyPayments.length - 1]?.verifiedCount || 0} verified payments
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Month-over-Month</p>
                        <div className="flex items-center gap-1">
                          <p className="text-lg font-bold text-purple-600">
                            {growthPercentage > 0 ? '+' : ''}{growthPercentage.toFixed(1)}%
                          </p>
                          {growthPercentage > 0 ? (
                            <TrendUp className="h-4 w-4 text-green-500" />
                          ) : growthPercentage < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : null}
                        </div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">All Time Total</p>
                        <p className="text-lg font-bold text-amber-600">
                          ₱{allTimeTotal.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Standup-style Bar Graph */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Monthly Verified Payments (Last 12 Months)</h4>
                      <div className="h-48 flex items-end gap-1.5">
                        {monthlyPayments.map((month, index) => {
                          const maxTotal = Math.max(...monthlyPayments.map(m => m.verifiedTotal), 1)
                          const height = (month.verifiedTotal / maxTotal) * 100
                          const isCurrentMonth = index === monthlyPayments.length - 1

                          return (
                            <div key={month.month} className="flex-1 flex flex-col items-center gap-1 group">
                              <div className="relative w-full flex justify-center">
                                <div
                                  className={`w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer ${isCurrentMonth ? 'bg-gradient-to-t from-green-500 to-green-400' : 'bg-gradient-to-t from-blue-500 to-blue-400'
                                    }`}
                                  style={{ height: `${height}%`, minHeight: month.verifiedTotal > 0 ? '20px' : '4px' }}
                                />
                                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded py-1 px-2 shadow-lg whitespace-nowrap z-10">
                                  <p className="font-semibold">{month.month}</p>
                                  <p>Verified: ₱{month.verifiedTotal.toLocaleString()}</p>
                                  <p>Payments: {month.verifiedCount}</p>
                                  <p>Total (all): ₱{month.total.toLocaleString()}</p>
                                  <p>Avg: ₱{month.average.toLocaleString()}</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {format(month.monthDate, "MMM")}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Selected Month Details */}
                    {selectedMonthData && Object.keys(selectedMonthData.methods).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Payment Methods - {selectedMonthData.month}</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedMonthData.methods).map(([method, data]) => (
                            <Badge key={method} variant="secondary" className="px-3 py-1">
                              {method.replace(/_/g, ' ')}: ₱{data.total.toLocaleString()}
                              ({data.count})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {paymentsData?.payments?.edges?.some(edge =>
                      edge.node.currentStatus === "REFUNDED" ||
                      edge.node.currentStatus === "CANCELLED" ||
                      edge.node.currentStatus === "VOID"
                    ) && (
                        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                            <span className="text-sm text-purple-700 dark:text-purple-300">
                              Refunded/Cancelled payments are automatically excluded from totals
                            </span>
                          </div>
                        </div>
                      )}

                    {/* No payments state */}
                    {monthlyPayments.every(m => m.verifiedCount === 0) && (
                      <div className="text-center py-6 text-muted-foreground">
                        No verified payments found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Entry Summary
              </CardTitle>
              <CardDescription>
                Overview of all entries by status (click on any status to view details)
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
                      <p className="text-2xl font-bold text-red-600">₱{entrySummary.totalRefundAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">Total Pending Amount</p>
                      <p className="text-xl font-bold text-orange-600">₱{entrySummary.totalPendingAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">Total Paid Amount</p>
                      <p className="text-xl font-bold text-green-600">₱{entrySummary.totalPaidAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Entries by Status (click to view details)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {entrySummary.byStatus.map((status) => {
                        const Icon = status.icon
                        const percentage = (status.count / entrySummary.total) * 100
                        return (
                          <div
                            key={status.status}
                            className="bg-muted/20 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] border border-transparent hover:border-primary/20"
                            onClick={() => handleStatusClick(status.status)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded-full ${status.color.split(' ')[0]}`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                                <span className="text-sm font-medium">{status.status.replace(/_/g, ' ')}</span>
                              </div>
                              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                                {status.count} entries
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Percentage</span>
                                {/* <span className="font-medium">{percentage.toFixed(1)}%</span> */}
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

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedStatus && (
                    <>
                      {(() => {
                        const statusIcon = entrySummary.byStatus.find(s => s.status === selectedStatus)?.icon
                        const Icon = statusIcon || Activity
                        return <Icon className="h-4 w-4" />
                      })()}
                      {selectedStatus?.replace(/_/g, ' ')} Entries
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  List of all entries with status: {selectedStatus?.replace(/_/g, ' ')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedStatus && getEntriesByStatus(selectedStatus).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No entries found with this status
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedStatus && getEntriesByStatus(selectedStatus).map((entry) => (
                      <div key={entry._id} className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">{entry.entryNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.eventName || "Unknown Event"} • {entry.tournamentName || "Unknown Tournament"}
                              </p>
                            </div>
                            <Badge className={cn(getStatusColor(entry.currentStatus), "border")}>
                              {entry.currentStatus.replace(/_/g, ' ')}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            Players: {entry.playerList?.player2Name
                              ? `${entry.playerList.player1Name} & ${entry.playerList.player2Name}`
                              : entry.playerList?.player1Name || "Unknown Player"}
                          </p>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                Pending: ₱{entry.pendingAmount?.toLocaleString() || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                Paid: ₱{entry.totalPaid?.toLocaleString() || 0}
                              </span>

                            </div>
                            <span className="text-muted-foreground">
                              {formatDistanceToNow(new Date(entry.dateUpdated), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex flex-row gap-2">
                            {(entry.hasOverpayment || entry.hasRefunds) && (
                              <div className="flex items-center gap-2 text-xs">
                                {entry.hasOverpayment && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    Overpayment: ₱{entry.totalExcess?.toLocaleString() || 0}
                                  </Badge>
                                )}
                                {entry.hasRefunds && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    Refund: ₱{entry.totalRefundAmount?.toLocaleString() || 0}
                                  </Badge>
                                )}
                              </div>
                            )}
                            {entry.isEarlyBird && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Early Bird
                              </Badge>
                            )}

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
                  {entriesByEvent.map((event, index) => {
                    const earlyBirdPercentage = (event.earlyBirdCount / event.count) * 100
                    const verifiedPercentage = (event.verifiedCount / event.count) * 100
                    const pendingPercentage = (event.pendingCount / event.count) * 100

                    return (
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

                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                          {event.earlyBirdCount > 0 && (
                            <div
                              className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                              style={{ width: `${earlyBirdPercentage}%` }}
                              title={`Early Bird: ${event.earlyBirdCount} entries`}
                            />
                          )}
                          {event.verifiedCount > 0 && (
                            <div
                              className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
                              style={{ width: `${verifiedPercentage}%` }}
                              title={`Verified: ${event.verifiedCount} entries`}
                            />
                          )}
                          {event.pendingCount > 0 && (
                            <div
                              className="h-full bg-yellow-500 transition-all duration-500 ease-in-out"
                              style={{ width: `${pendingPercentage}%` }}
                              title={`Pending: ${event.pendingCount} entries`}
                            />
                          )}
                        </div>

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
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Recent Entries
                  </CardTitle>
                  {(() => {
                    const last24HoursCount = entriesData?.entries?.edges?.filter(({ node }) => {
                      const date = new Date(node.dateUpdated)
                      const now = new Date()
                      const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
                      return diffHours <= 24
                    }).length || 0

                    return last24HoursCount > 0 ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white ml-2">
                        +{last24HoursCount} {last24HoursCount === 1 ? 'Added New Entry' : 'Added New Entries'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2">
                        No new entries
                      </Badge>
                    )
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Clock className="h-3 w-3 mr-1" />
                    24h: {entriesData?.entries?.edges?.filter(({ node }) => {
                      const date = new Date(node.dateUpdated)
                      const now = new Date()
                      const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
                      return diffHours <= 24
                    }).length || 0}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Clock className="h-3 w-3 mr-1" />
                    7d: {entriesData?.entries?.edges?.filter(({ node }) => {
                      const date = new Date(node.dateUpdated)
                      const now = new Date()
                      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
                      return diffDays <= 7
                    }).length || 0}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <Clock className="h-3 w-3 mr-1" />
                    30d: {entriesData?.entries?.edges?.filter(({ node }) => {
                      const date = new Date(node.dateUpdated)
                      const now = new Date()
                      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
                      return diffDays <= 30
                    }).length || 0}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Most recently registered entries (live updates)
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
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Last 24 Hours</p>
                      <p className="text-lg font-bold text-blue-600">
                        {entriesData?.entries?.edges?.filter(({ node }) => {
                          const date = new Date(node.dateUpdated)
                          const now = new Date()
                          const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
                          return diffHours <= 24
                        }).length || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Last 7 Days</p>
                      <p className="text-lg font-bold text-green-600">
                        {entriesData?.entries?.edges?.filter(({ node }) => {
                          const date = new Date(node.dateUpdated)
                          const now = new Date()
                          const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
                          return diffDays <= 7
                        }).length || 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Last 30 Days</p>
                      <p className="text-lg font-bold text-purple-600">
                        {entriesData?.entries?.edges?.filter(({ node }) => {
                          const date = new Date(node.dateUpdated)
                          const now = new Date()
                          const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
                          return diffDays <= 30
                        }).length || 0}
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const todayCount = entriesData?.entries?.edges?.filter(({ node }) => {
                      const date = new Date(node.dateUpdated)
                      const today = new Date()
                      return date.toDateString() === today.toDateString()
                    }).length || 0

                    return todayCount > 0 ? (
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              Today's Registrations
                            </span>
                          </div>
                          <Badge className="bg-green-500 text-white">
                            +{todayCount} {todayCount === 1 ? 'new' : 'new'} today
                          </Badge>
                        </div>
                      </div>
                    ) : null
                  })()}

                  {topEntries.map((entry, index) => {
                    const rankIcon = index === 0 ? <Crown className="h-4 w-4 text-yellow-500" /> :
                      index === 1 ? <Award className="h-4 w-4 text-gray-400" /> :
                        index === 2 ? <Star className="h-4 w-4 text-amber-600" /> :
                          <span className="text-xs font-medium text-muted-foreground w-4 text-center">#{index + 1}</span>

                    const isVeryRecent = (() => {
                      const date = new Date(entry.date)
                      const now = new Date()
                      const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
                      return diffMinutes < 60
                    })()

                    const isToday = (() => {
                      const date = new Date(entry.date)
                      const today = new Date()
                      return date.toDateString() === today.toDateString()
                    })()

                    // Safe amount formatting with null check
                    const formattedAmount = entry.amount ? `₱${entry.amount.toLocaleString()}` : '₱0'

                    return (
                      <div key={entry._id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors relative">
                        {isVeryRecent && (
                          <div className="absolute -top-1 -right-1">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                          </div>
                        )}
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          {rankIcon}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">{entry.entryNumber}</p>
                              <p className="text-xs text-muted-foreground">{entry.eventName} • {entry.tournamentName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isToday && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px]">
                                  New Today
                                </Badge>
                              )}
                              <Badge variant={entry.isEarlyBird ? "default" : "secondary"} className={entry.isEarlyBird ? "bg-green-100 text-green-800" : ""}>
                                {entry.isEarlyBird ? "Early Bird" : "Regular"}
                              </Badge>
                            </div>
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
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                              </span>
                            </div>
                            <span className="font-medium">{formattedAmount}</span>
                          </div>
                          {(entry.hasRefunds || entry.hasOverpayment) && (
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              {entry.hasRefunds && entry.totalRefundAmount ? (
                                <span>Refunded: ₱{entry.totalRefundAmount.toLocaleString()}</span>
                              ) : null}
                              {entry.hasOverpayment && entry.totalExcess ? (
                                <span>Excess: ₱{entry.totalExcess.toLocaleString()}</span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  <Button variant="link" className="w-full mt-2" size="sm" asChild>
                    <Link href="/entries">
                      View all entries ({entriesData?.entries?.edges?.length || 0} total)
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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