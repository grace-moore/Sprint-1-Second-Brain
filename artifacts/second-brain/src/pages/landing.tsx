import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, ShieldAlert, Target, Scale, MoveRight, Layers, FileText } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-[#F9FAFB] text-foreground font-sans">
      <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-semibold text-lg tracking-tight">Second Brain</span>
        </div>
        <Link href="/sessions">
          <Button variant="outline" size="sm" data-testid="button-login">Go to App</Button>
        </Link>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Bring your arguments to be challenged.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A rigorous, distraction-free workspace that acts as your personal academic researcher. 
              Find hidden biases, spot logical fallacies, and anticipate counter-arguments before you publish.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/sessions">
                <Button size="lg" className="px-8 h-12 text-base rounded-md" data-testid="button-start-review-hero">
                  Start Argument Review
                  <MoveRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Concept Section */}
        <section className="py-20 bg-white px-6 border-y border-border">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Not validation. Verification.</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Most writing tools try to make your writing sound better. Second Brain tries to make your thinking stronger. 
                  We don't correct your grammar; we pressure-test your logic. Enter the study room and see if your thesis holds up to scrutiny.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#F9FAFB] p-6 rounded-lg border border-border flex gap-4">
                  <div className="bg-primary/10 w-10 h-10 rounded-md flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Detect Fallacies</h3>
                    <p className="text-sm text-muted-foreground">Automatically flag straw man arguments, ad hominem attacks, and slippery slopes.</p>
                  </div>
                </div>
                <div className="bg-[#F9FAFB] p-6 rounded-lg border border-border flex gap-4">
                  <div className="bg-primary/10 w-10 h-10 rounded-md flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Uncover Biases</h3>
                    <p className="text-sm text-muted-foreground">Highlight subjective framing, confirmation bias, and emotional appeals in your tone.</p>
                  </div>
                </div>
                <div className="bg-[#F9FAFB] p-6 rounded-lg border border-border flex gap-4">
                  <div className="bg-primary/10 w-10 h-10 rounded-md flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Anticipate Opposition</h3>
                    <p className="text-sm text-muted-foreground">Generate the strongest counter-arguments before your reviewers do.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-16">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-left space-y-4">
                <div className="w-12 h-12 bg-white border border-border rounded-lg flex items-center justify-center text-xl font-bold text-primary shadow-sm">1</div>
                <h3 className="text-xl font-semibold">Bring your draft</h3>
                <p className="text-muted-foreground">Start from scratch, paste your existing text, or upload your document into the focused workspace.</p>
              </div>
              <div className="text-left space-y-4">
                <div className="w-12 h-12 bg-white border border-border rounded-lg flex items-center justify-center text-xl font-bold text-primary shadow-sm">2</div>
                <h3 className="text-xl font-semibold">Run the challenge</h3>
                <p className="text-muted-foreground">Our AI engine analyzes your text paragraph by paragraph to find weak points in your argument.</p>
              </div>
              <div className="text-left space-y-4">
                <div className="w-12 h-12 bg-white border border-border rounded-lg flex items-center justify-center text-xl font-bold text-primary shadow-sm">3</div>
                <h3 className="text-xl font-semibold">Refine & track</h3>
                <p className="text-muted-foreground">Review the feedback, accept valid criticisms, and track your progress over time as a critical thinker.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-white border-t border-border px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Ready to think deeper?</h2>
            <p className="text-lg text-muted-foreground">Join the focused workspace and start testing your ideas today.</p>
            <Link href="/sessions">
              <Button size="lg" className="px-8 h-12 text-base rounded-md" data-testid="button-start-review-bottom">
                Enter Second Brain
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-[#F9FAFB] py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm text-muted-foreground">Second Brain</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Second Brain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
