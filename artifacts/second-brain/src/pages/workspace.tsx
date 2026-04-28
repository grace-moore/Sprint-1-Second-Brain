import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  getGetSessionQueryKey, 
  useGetSession, 
  useUpdateSession,
  getGetAnalysisQueryKey,
  useGetAnalysis,
  useUpdateAnalysisItem
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, CheckCircle2, Clock, AlertCircle, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Workspace() {
  const { id } = useParams();
  const sessionId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session, isLoading: sessionLoading } = useGetSession(sessionId, { 
    query: { enabled: !!sessionId, queryKey: getGetSessionQueryKey(sessionId) } 
  });
  
  const { data: analysis, isLoading: analysisLoading } = useGetAnalysis(sessionId, {
    query: { enabled: !!sessionId && session?.status !== 'draft', queryKey: getGetAnalysisQueryKey(sessionId) }
  });

  const updateSession = useUpdateSession();
  const updateAnalysisItem = useUpdateAnalysisItem();

  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  
  const initializedForId = useRef<number | null>(null);
  const lastSaved = useRef({ content: "" });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize content once
  useEffect(() => {
    if (session && initializedForId.current !== sessionId) {
      initializedForId.current = sessionId;
      setContent(session.content || "");
      lastSaved.current = { content: session.content || "" };
      if (session.status === 'analyzing') {
        setIsAnalyzing(true);
        // If it's stuck analyzing on load, we might need a status check or manual reset, but we'll assume SSE handles it.
      }
    }
  }, [session, sessionId]);

  // Auto-save logic
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus("saving");

    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      if (newContent !== lastSaved.current.content) {
        updateSession.mutate(
          { id: sessionId, data: { content: newContent } },
          {
            onSuccess: () => {
              lastSaved.current = { content: newContent };
              setSaveStatus("saved");
              setTimeout(() => setSaveStatus("idle"), 2000);
            }
          }
        );
      } else {
        setSaveStatus("idle");
      }
    }, 1000);
  };

  const handleRunChallenge = async () => {
    if (!content.trim()) {
      toast({ title: "Empty content", description: "Please add some text to analyze.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    
    // First save current content
    if (content !== lastSaved.current.content) {
      await updateSession.mutateAsync({ id: sessionId, data: { content } });
      lastSaved.current = { content };
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error("Analysis failed to start");
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                queryClient.invalidateQueries({ queryKey: getGetAnalysisQueryKey(sessionId) });
                queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(sessionId) });
                setIsAnalyzing(false);
                toast({ title: "Analysis Complete", description: "Review the findings in the tabs." });
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      setIsAnalyzing(false);
      toast({ title: "Error", description: "Failed to run challenge.", variant: "destructive" });
    }
  };

  const handleAcceptItem = (itemId: number, currentAccepted: boolean | null) => {
    const newAccepted = !currentAccepted;
    updateAnalysisItem.mutate(
      { id: sessionId, itemId, data: { accepted: newAccepted } },
      {
        onSuccess: (updatedItem) => {
          // Optimistically update cache
          queryClient.setQueryData(getGetAnalysisQueryKey(sessionId), (old: any) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.map((item: any) => 
                item.id === itemId ? { ...item, accepted: newAccepted } : item
              ),
              acceptedCount: old.items.filter((i: any) => 
                i.id === itemId ? newAccepted : i.accepted
              ).length
            };
          });
        }
      }
    );
  };

  if (sessionLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex gap-6 h-[600px]">
            <Skeleton className="w-1/2 h-full" />
            <Skeleton className="w-1/2 h-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) return <Layout><div>Session not found.</div></Layout>;

  const biasItems = analysis?.items.filter(i => i.type === "bias") || [];
  const fallacyItems = analysis?.items.filter(i => i.type === "fallacy") || [];
  const oppositionItems = analysis?.items.filter(i => i.type === "opposition") || [];

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{session.title}</h1>
              {session.status === "complete" ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                </Badge>
              ) : session.status === "analyzing" || isAnalyzing ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Analyzing
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  Draft
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>Updated {format(new Date(session.updatedAt), "MMM d, h:mm a")}</span>
              {saveStatus === "saving" && <span className="flex items-center text-amber-600"><Save className="w-3 h-3 mr-1" /> Saving...</span>}
              {saveStatus === "saved" && <span className="flex items-center text-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Saved</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session.status === "complete" && (
              <Button 
                variant="outline" 
                onClick={() => setLocation(`/sessions/${sessionId}/recap`)}
                data-testid="button-view-recap"
              >
                View Recap
              </Button>
            )}
            <Button 
              onClick={handleRunChallenge} 
              disabled={isAnalyzing || !content.trim()}
              data-testid="button-run-challenge"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Challenging...</>
              ) : (
                <><Play className="w-4 h-4 mr-2 fill-current" /> Run Challenge</>
              )}
            </Button>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Editor */}
          <div className="flex flex-col bg-white border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 font-medium text-sm flex justify-between items-center">
              <span>Argument Text</span>
            </div>
            <Textarea 
              value={content}
              onChange={handleContentChange}
              placeholder="Write or paste your argument here..."
              className="flex-1 border-0 rounded-none resize-none p-6 text-base leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
              data-testid="textarea-content"
            />
          </div>

          {/* Analysis */}
          <div className="flex flex-col bg-white border border-border rounded-lg shadow-sm overflow-hidden">
            <Tabs defaultValue="bias" className="flex flex-col h-full w-full">
              <div className="border-b border-border px-2">
                <TabsList className="bg-transparent h-12 w-full justify-start gap-6 rounded-none p-0">
                  <TabsTrigger 
                    value="bias" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
                  >
                    Bias ({biasItems.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="fallacy" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
                  >
                    Fallacy ({fallacyItems.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="opposition" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
                  >
                    Opposition ({oppositionItems.length})
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full w-full bg-[#F9FAFB]/50">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                      <p>Analyzing argument...</p>
                    </div>
                  ) : !analysis ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center px-6">
                      <AlertCircle className="w-8 h-8 mb-4 text-muted-foreground/50" />
                      <p>Run Challenge to generate analysis.</p>
                      <p className="text-sm mt-2">The AI will identify biases, fallacies, and counter-arguments.</p>
                    </div>
                  ) : (
                    <>
                      <TabsContent value="bias" className="m-0 p-4 space-y-4">
                        {biasItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">No specific biases detected.</p>
                        ) : (
                          biasItems.map(item => (
                            <AnalysisItemCard 
                              key={item.id} 
                              item={item} 
                              onToggle={() => handleAcceptItem(item.id, item.accepted)} 
                            />
                          ))
                        )}
                      </TabsContent>
                      <TabsContent value="fallacy" className="m-0 p-4 space-y-4">
                        {fallacyItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">No logical fallacies detected.</p>
                        ) : (
                          fallacyItems.map(item => (
                            <AnalysisItemCard 
                              key={item.id} 
                              item={item} 
                              onToggle={() => handleAcceptItem(item.id, item.accepted)} 
                            />
                          ))
                        )}
                      </TabsContent>
                      <TabsContent value="opposition" className="m-0 p-4 space-y-4">
                        {oppositionItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">No specific counter-arguments generated.</p>
                        ) : (
                          oppositionItems.map(item => (
                            <AnalysisItemCard 
                              key={item.id} 
                              item={item} 
                              onToggle={() => handleAcceptItem(item.id, item.accepted)} 
                            />
                          ))
                        )}
                      </TabsContent>
                    </>
                  )}
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function AnalysisItemCard({ item, onToggle }: { item: any, onToggle: () => void }) {
  return (
    <div className={`p-4 bg-white border rounded-md shadow-sm transition-colors ${item.accepted ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
      <div className="flex gap-3 items-start">
        <Checkbox 
          id={`item-${item.id}`} 
          checked={!!item.accepted} 
          onCheckedChange={onToggle}
          className="mt-1"
          data-testid={`checkbox-accept-${item.id}`}
        />
        <div className="flex-1 space-y-2">
          <Label htmlFor={`item-${item.id}`} className="text-base font-semibold leading-tight cursor-pointer">
            {item.content}
          </Label>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
