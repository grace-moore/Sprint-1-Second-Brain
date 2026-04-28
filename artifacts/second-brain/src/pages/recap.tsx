import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetSession, getGetSessionQueryKey, useRateSession, useGetAnalysis, getGetAnalysisQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShieldAlert, Target, Scale, BarChart3, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Recap() {
  const { id } = useParams();
  const sessionId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useGetSession(sessionId, {
    query: { enabled: !!sessionId, queryKey: getGetSessionQueryKey(sessionId) }
  });

  const { data: analysis, isLoading: isAnalysisLoading } = useGetAnalysis(sessionId, {
    query: { enabled: !!sessionId, queryKey: getGetAnalysisQueryKey(sessionId) }
  });

  const rateSession = useRateSession();
  const [rating, setRating] = useState<number>(session?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleRate = (val: number) => {
    setRating(val);
    rateSession.mutate(
      { id: sessionId, data: { rating: val } },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetSessionQueryKey(sessionId), data);
          toast({ title: "Rating saved", description: "Thanks for your feedback." });
        }
      }
    );
  };

  if (isLoading || isAnalysisLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6" aria-busy="true" aria-label="Loading recap">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!session) return <Layout><div role="alert">Session not found.</div></Layout>;

  const biasCount = analysis?.biasCount ?? 0;
  const fallacyCount = analysis?.fallacyCount ?? 0;
  const oppositionCount = analysis?.oppositionCount ?? 0;
  const acceptedCount = analysis?.acceptedCount ?? 0;
  const totalCount = biasCount + fallacyCount + oppositionCount;

  const activeRating = hoverRating || rating || session.rating || 0;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div
            className="mx-auto w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4"
            aria-hidden="true"
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Session Complete</h1>
          <p className="text-muted-foreground">Here's a summary of the analysis for "{session.title}"</p>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Breakdown of identified issues</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="flex flex-col items-center p-6 bg-[#F9FAFB] rounded-lg border border-border">
                <Scale className="w-8 h-8 text-primary mb-3" aria-hidden="true" />
                <dt className="text-sm font-medium text-muted-foreground mt-1 order-last">Biases</dt>
                <dd className="text-3xl font-bold" data-testid="count-biases">{biasCount}</dd>
              </div>
              <div className="flex flex-col items-center p-6 bg-[#F9FAFB] rounded-lg border border-border">
                <Target className="w-8 h-8 text-primary mb-3" aria-hidden="true" />
                <dt className="text-sm font-medium text-muted-foreground mt-1 order-last">Fallacies</dt>
                <dd className="text-3xl font-bold" data-testid="count-fallacies">{fallacyCount}</dd>
              </div>
              <div className="flex flex-col items-center p-6 bg-[#F9FAFB] rounded-lg border border-border">
                <ShieldAlert className="w-8 h-8 text-primary mb-3" aria-hidden="true" />
                <dt className="text-sm font-medium text-muted-foreground mt-1 order-last">Counter-arguments</dt>
                <dd className="text-3xl font-bold" data-testid="count-opposition">{oppositionCount}</dd>
              </div>
            </dl>
            {acceptedCount > 0 && (
              <p className="mt-6 text-center text-sm text-muted-foreground" aria-live="polite">
                You accepted <span className="font-semibold text-foreground">{acceptedCount}</span> of{" "}
                <span className="font-semibold text-foreground">{totalCount}</span> identified issues
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="text-center">
            <CardTitle id="rating-label">How helpful was this review?</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <div
              role="radiogroup"
              aria-labelledby="rating-label"
              className="flex gap-2"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  role="radio"
                  aria-checked={rating === star || session.rating === star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Rate ${star} out of 5 stars`}
                  data-testid={`button-rate-${star}`}
                >
                  <Star 
                    className={`w-8 h-8 transition-colors ${
                      star <= activeRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30 hover:text-muted-foreground/50"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" onClick={() => setLocation(`/sessions/${sessionId}`)} data-testid="button-back-workspace">
            Back to Workspace
          </Button>
          <Button onClick={() => setLocation('/progress')} data-testid="button-view-progress">
            <BarChart3 className="w-4 h-4 mr-2" aria-hidden="true" />
            View Overall Progress
          </Button>
        </div>
      </div>
    </Layout>
  );
}
