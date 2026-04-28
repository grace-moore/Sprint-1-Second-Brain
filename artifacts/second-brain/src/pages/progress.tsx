import React from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetProgress } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CheckCircle2, Target, Scale, ShieldAlert, Star, Trophy } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Progress() {
  const { data: progress, isLoading } = useGetProgress();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Layout>
    );
  }

  if (!progress) return <Layout><div>Could not load progress data.</div></Layout>;

  // Format data for chart
  const chartData = [...progress.dataPoints]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(point => ({
      ...point,
      displayDate: format(parseISO(point.date), "MMM d"),
    }));

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Progress</h1>
          <p className="text-muted-foreground mt-1">Track your critical thinking development over time.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-primary" />
                Completed Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold">{progress.completedSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">of {progress.totalSessions} total</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                Accepted Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold">{progress.totalItemsAccepted}</div>
              <p className="text-xs text-muted-foreground mt-1">items acknowledged</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Target className="w-4 h-4 mr-2 text-destructive" />
                Total Issues Found
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold">
                {progress.totalBiasIdentified + progress.totalFallaciesIdentified + progress.totalOppositionGenerated}
              </div>
              <p className="text-xs text-muted-foreground mt-1">across all categories</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Star className="w-4 h-4 mr-2 text-amber-500" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold">{progress.averageRating?.toFixed(1) || "-"}</div>
              <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>Total issues identified vs accepted per session</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="displayDate" 
                      stroke="#9ca3af" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      name="Total Issues Found"
                      dataKey="totalItems" 
                      stroke="#2563EB" 
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      name="Issues Accepted"
                      dataKey="acceptedItems" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] w-full flex items-center justify-center border border-dashed border-border rounded-md mt-4">
                <p className="text-muted-foreground">Complete sessions to see your progress chart.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
