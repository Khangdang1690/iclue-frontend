import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Upload, Brain, BarChart3, Zap, GitBranch, TrendingUp, Lock } from "lucide-react";
import { IBM_Plex_Mono } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export default function Home() {
  return (
    <div className={`min-h-screen flex flex-col bg-background ${ibmPlexMono.className}`}>
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="iclue. logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">iclue.</h1>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors" style={{ borderRadius: 'var(--radius)' }}>
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </button>
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-[40%_60%] gap-12 items-center">
            {/* Left: Value Proposition */}
            <div className="space-y-8">
              <div className="inline-block px-3 py-1 text-xs font-medium bg-muted text-muted-foreground" style={{ borderRadius: 'var(--radius)' }}>
                AI-Powered Business Intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Data to insights in{" "}
                <span className="text-primary">minutes</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Upload data. Get AI-powered dashboards instantly. No SQL required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="px-8 py-3 text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors" style={{ borderRadius: 'var(--radius)' }}>
                      Start Free Trial
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <button className="px-8 py-3 text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors" style={{ borderRadius: 'var(--radius)' }}>
                      Go to Dashboard
                    </button>
                  </Link>
                </SignedIn>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4" />
                <span>Processes 10M+ rows in under 60 seconds</span>
              </div>
            </div>

            {/* Right: Visual Preview */}
            <div className="relative">
              <div className="bg-card border border-border overflow-hidden shadow-lg" style={{ borderRadius: 'calc(var(--radius) + 4px)' }}>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/datahub-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              {/* Decorative gradient */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-3xl rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Before */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-muted-foreground">The Old Way</h3>
              <ul className="space-y-4">
                {[
                  "Weeks writing SQL joins manually",
                  "Data analysts bottlenecked on every request",
                  "Relationships buried in inconsistent naming",
                  "Business users can't self-serve insights",
                  "Dashboards outdated by the time they're ready"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">The iclue. Way</h3>
              <ul className="space-y-4">
                {[
                  "AI detects relationships automatically, even with different naming",
                  "Self-service insights for every business user",
                  "Smart analysis finds patterns humans miss",
                  "From upload to dashboard in under a minute",
                  "Continuous intelligence as your data updates"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps from raw data to actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "1",
                icon: Upload,
                title: "Upload Data",
                description: "Drag and drop CSV, Excel, JSON, or Parquet files. No data preparation needed.",
                features: ["Multi-format support", "Auto-encoding detection", "10M+ row capacity"]
              },
              {
                number: "2",
                icon: Brain,
                title: "AI Analyzes",
                description: "Our 14-step pipeline detects relationships, understands context, and finds patterns.",
                features: ["Semantic analysis", "Relationship detection", "Anomaly finding"]
              },
              {
                number: "3",
                icon: BarChart3,
                title: "Get Insights",
                description: "Interactive dashboard, executive report, and actionable recommendations ready to share.",
                features: ["Auto-generated charts", "Written analysis", "Export to PDF"]
              }
            ].map((step) => (
              <div key={step.number} className="relative">
                <div className="bg-card border border-border p-8 h-full flex flex-col" style={{ borderRadius: 'calc(var(--radius) + 4px)' }}>
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-6" style={{ borderRadius: 'var(--radius)' }}>
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Step {step.number}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-6">{step.description}</p>
                  <ul className="space-y-2 mt-auto">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="px-4 sm:px-6 lg:px-8 py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how iclue. automatically discovers relationships that traditional tools miss
            </p>
          </div>

          <div className="bg-card border border-border p-8 lg:p-12" style={{ borderRadius: 'calc(var(--radius) + 4px)' }}>
            <div className="aspect-video bg-muted overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/analysis-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold mb-1">47s</div>
                <div className="text-sm text-muted-foreground">Average processing time</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">98%</div>
                <div className="text-sm text-muted-foreground">Relationship accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">14</div>
                <div className="text-sm text-muted-foreground">AI pipeline steps</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              What Makes iclue. Different
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Technology that&apos;s impossible to replicate
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "Semantic Analysis",
                description: "Understands your business context, not just column names. Knows 'revenue' from 'cost' automatically."
              },
              {
                icon: GitBranch,
                title: "Relationship Detection",
                description: "5-step algorithm finds connections others miss. Links client_id to user_id to customer_code intelligently."
              },
              {
                icon: Zap,
                title: "Self-Healing Code",
                description: "Generates working Python automatically. Retries with error feedback until it succeeds."
              },
              {
                icon: TrendingUp,
                title: "Advanced Analytics",
                description: "Anomaly detection, forecasting, causal inference, and variance decomposition built-in."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-card border border-border p-6" style={{ borderRadius: 'calc(var(--radius) + 4px)' }}>
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4" style={{ borderRadius: 'var(--radius)' }}>
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Technical Credibility */}
          <div className="mt-16 bg-muted p-8 text-center" style={{ borderRadius: 'calc(var(--radius) + 4px)' }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Enterprise-grade technology</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span>Powered by Gemini 2.5 Flash</span>
              <span>•</span>
              <span>PostgreSQL + pgvector</span>
              <span>•</span>
              <span>LangGraph workflows</span>
              <span>•</span>
              <span>Multi-stage LLM orchestration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to turn data into insights?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join forward-thinking companies who ship insights in minutes, not months.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-3 text-base font-medium bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors" style={{ borderRadius: 'var(--radius)' }}>
                  Start Free Trial
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="px-8 py-3 text-base font-medium bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors" style={{ borderRadius: 'var(--radius)' }}>
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>
          <p className="text-sm mt-6 opacity-75">No credit card required • Free forever plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 iclue. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
