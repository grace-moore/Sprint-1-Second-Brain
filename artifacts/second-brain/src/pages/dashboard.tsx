import React from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useListSessions } from "@workspace/api-client-react";
import { Plus, Clock, FileText, CheckCircle2, ShieldAlert, Target, Scale, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: sessions, isLoading } = useListSessions();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Sessions</h1>
            <p className="text-muted-foreground mt-1">Manage your argument reviews</p>
          </div>
          <Link href="/sessions/new">
            <Button data-testid="button-new-review" className="rounded-md">
              <Plus className="w-4 h-4 mr-2" />
              New Argument Review
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-sm border-border">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mt-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="bg-white border border-dashed border-border rounded-lg p-12 text-center">
            <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              You haven't run any arguments through Second Brain yet. Start a new session to pressure-test your ideas.
            </p>
            <Link href="/sessions/new">
              <Button data-testid="button-new-session-empty" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create your first session
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card 
                key={session.id} 
                className="shadow-sm border-border hover:border-primary/30 transition-colors cursor-pointer group"
                onClick={() => setLocation(`/sessions/${session.id}`)}
                data-testid={`card-session-${session.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {session.title || "Untitled Session"}
                    </CardTitle>
                    {session.status === "complete" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    ) : session.status === "analyzing" ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1" />
                        Analyzing
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 whitespace-nowrap">
                        <FileText className="w-3 h-3 mr-1" />
                        Draft
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center text-xs">
                    {format(new Date(session.updatedAt), "MMM d, yyyy h:mm a")}
                    {session.rating && (
                      <span className="flex items-center ml-3 pl-3 border-l border-border text-amber-500">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {session.rating}/5
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {session.analysisCount > 0 ? (
                    <div className="flex items-center justify-start gap-6 pt-2 border-t border-border/50">
                      <div className="flex flex-col items-center" title="Biases Found">
                        <div className="flex items-center text-sm font-medium text-foreground">
                          <Scale className="w-4 h-4 mr-1.5 text-muted-foreground" />
                          {session.biasCount}
                        </div>
                      </div>
                      <div className="flex flex-col items-center" title="Fallacies Detected">
                        <div className="flex items-center text-sm font-medium text-foreground">
                          <Target className="w-4 h-4 mr-1.5 text-muted-foreground" />
                          {session.fallacyCount}
                        </div>
                      </div>
                      <div className="flex flex-col items-center" title="Counter-arguments">
                        <div className="flex items-center text-sm font-medium text-foreground">
                          <ShieldAlert className="w-4 h-4 mr-1.5 text-muted-foreground" />
                          {session.oppositionCount}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-sm text-muted-foreground italic">No analysis run yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
