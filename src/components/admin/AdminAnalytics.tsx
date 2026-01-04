import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface RevenueStats {
  totalUsers: number;
  paidUsers: number;
  alertServiceUsers: number;
  assistedAccessUsers: number;
  conversionRate: number;
  monthlySignups: { month: string; count: number }[];
  subscriptionBreakdown: { status: string; count: number }[];
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);

    // Fetch all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("status, subscription_status, created_at");

    if (profiles) {
      const totalUsers = profiles.length;
      const alertServiceUsers = profiles.filter(p => p.status === "alert_service").length;
      const assistedAccessUsers = profiles.filter(p => p.status === "assisted_access").length;
      const paidUsers = alertServiceUsers + assistedAccessUsers;
      const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;

      // Group signups by month
      const monthlyMap = new Map<string, number>();
      profiles.forEach(p => {
        if (p.created_at) {
          const date = new Date(p.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
        }
      });

      // Get last 6 months
      const monthlySignups: { month: string; count: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = d.toLocaleDateString("en-CA", { month: "short", year: "2-digit" });
        monthlySignups.push({
          month: monthLabel,
          count: monthlyMap.get(monthKey) || 0,
        });
      }

      // Subscription breakdown
      const subscriptionBreakdown = [
        { status: "Free", count: profiles.filter(p => p.status === "free").length },
        { status: "Alert Service", count: alertServiceUsers },
        { status: "Assisted Access", count: assistedAccessUsers },
      ];

      setStats({
        totalUsers,
        paidUsers,
        alertServiceUsers,
        assistedAccessUsers,
        conversionRate,
        monthlySignups,
        subscriptionBreakdown,
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Unable to load analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Subscribers
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.paidUsers}</div>
            <p className="text-xs text-muted-foreground">
              Alert Service + Assisted Access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground flex items-center gap-1">
              {stats.conversionRate.toFixed(1)}%
              {stats.conversionRate > 5 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">Free to paid conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assisted Access
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.assistedAccessUsers}
            </div>
            <p className="text-xs text-muted-foreground">Free tier grants</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Signups Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Signups</CardTitle>
            <CardDescription>New user registrations over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlySignups}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Breakdown</CardTitle>
            <CardDescription>User distribution by subscription status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subscriptionBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis
                    dataKey="status"
                    type="category"
                    className="text-xs fill-muted-foreground"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Summary</CardTitle>
          <CardDescription>Detailed breakdown of user subscription tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Free Users</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalUsers - stats.paidUsers}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.totalUsers - stats.paidUsers) / stats.totalUsers * 100 || 0).toFixed(1)}% of total
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-sm text-muted-foreground mb-1">Alert Service Subscribers</p>
              <p className="text-3xl font-bold text-green-600">{stats.alertServiceUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(stats.alertServiceUsers / stats.totalUsers * 100 || 0).toFixed(1)}% of total
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <p className="text-sm text-muted-foreground mb-1">Assisted Access Grants</p>
              <p className="text-3xl font-bold text-blue-600">{stats.assistedAccessUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(stats.assistedAccessUsers / stats.totalUsers * 100 || 0).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
