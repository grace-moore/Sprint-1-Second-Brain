import React, { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSession } from "@workspace/api-client-react";
import { FileText, ClipboardPaste, FileUp, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type InputMethod = "paste" | "blank" | "upload";

export default function NewSession() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createSession = useCreateSession();
  
  const [title, setTitle] = useState("");
  const [method, setMethod] = useState<InputMethod>("blank");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
      toast({ title: "Copied from clipboard", description: "Text successfully pasted." });
    } catch (err) {
      toast({ title: "Paste failed", description: "Could not read from clipboard.", variant: "destructive" });
    }
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a title for your session.", variant: "destructive" });
      return;
    }
    
    createSession.mutate(
      {
        data: {
          title,
          inputMethod: method,
          content: method === "blank" ? "" : content,
        }
      },
      {
        onSuccess: (data) => {
          setLocation(`/sessions/${data.id}`);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create session.", variant: "destructive" });
        }
      }
    );
  };

  const methods: { value: InputMethod; label: string; description: string; icon: typeof FileText }[] = [
    { value: "blank", label: "Start Blank", description: "Write a new argument from scratch in the editor.", icon: FileText },
    { value: "paste", label: "Paste Draft", description: "Paste an existing draft into the editor.", icon: ClipboardPaste },
    { value: "upload", label: "Upload Document", description: "Upload a saved text file for review.", icon: FileUp },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">New Argument Review</h1>
          <p className="text-muted-foreground mt-1">Set up a new workspace to challenge your ideas.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">Session Title</Label>
            <Input 
              id="title" 
              placeholder="e.g., Thesis Chapter 2 Draft" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="max-w-md h-11"
              data-testid="input-session-title"
              aria-required="true"
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Starting Point</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label="Choose how to start your session">
              {methods.map(({ value, label, description, icon: Icon }) => (
                <Card 
                  key={value}
                  role="radio"
                  aria-checked={method === value}
                  tabIndex={0}
                  className={`cursor-pointer transition-all ${method === value ? "border-primary ring-1 ring-primary/20 bg-primary/5" : "hover:border-border/80"}`}
                  onClick={() => setMethod(value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMethod(value); } }}
                  data-testid={`card-method-${value}`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="bg-white border border-border w-10 h-10 rounded-md flex items-center justify-center mb-2" aria-hidden="true">
                      <Icon className={`w-5 h-5 ${method === value ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <CardTitle className="text-base">{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                    {description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </fieldset>

          {method === "paste" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <Label className="text-sm font-medium">Content</Label>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handlePaste} data-testid="button-paste-clipboard">
                  <ClipboardPaste className="w-4 h-4 mr-2" aria-hidden="true" />
                  Paste from Clipboard
                </Button>
              </div>
              {content && (
                <div
                  className="p-3 bg-white border border-border rounded-md text-sm text-muted-foreground max-h-32 overflow-hidden relative"
                  aria-label="Preview of pasted content"
                >
                  {content.slice(0, 200)}...
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
                </div>
              )}
            </div>
          )}

          {method === "upload" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <Label htmlFor="file-upload" className="text-sm font-medium">Select File (.txt)</Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="file-upload"
                  type="file" 
                  accept=".txt" 
                  onChange={handleFileUpload}
                  className="max-w-sm"
                  data-testid="input-file-upload"
                  aria-describedby={fileName ? "file-loaded-status" : undefined}
                />
                {fileName && (
                  <span id="file-loaded-status" className="text-sm text-muted-foreground" aria-live="polite">
                    {fileName} loaded
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Run Challenge to generate analysis in the next step.
            </p>
            <Button 
              onClick={handleCreate} 
              disabled={createSession.isPending}
              size="lg"
              aria-busy={createSession.isPending}
              data-testid="button-create-session"
            >
              {createSession.isPending ? "Creating..." : "Enter Workspace"}
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
