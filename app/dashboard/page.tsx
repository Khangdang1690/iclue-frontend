import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Database, TrendingUp, Upload, BarChart3 } from "lucide-react";
import type { Dataset } from "@/lib/api/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userService, etlService } from "@/lib/api";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Check if user has completed onboarding (has a company)
  const companyId = await userService.getUserCompany(userId);
  if (!companyId) {
    redirect('/onboarding');
  }

  const datasets = await etlService.getDatasets(userId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your data analytics and business insights
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Datasets
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datasets.length}</div>
            <p className="text-xs text-muted-foreground">
              {datasets.length === 0 ? 'Upload your first dataset' : 'Active datasets'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Rows
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {datasets.reduce((acc: number, ds: Dataset) => acc + (ds.row_count || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all datasets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Analyses Run
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              AI-powered insights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Insights Generated
            </CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Business discoveries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Datasets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Datasets</CardTitle>
            <CardDescription>
              Your most recently uploaded datasets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {datasets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No datasets yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your first CSV or Excel file to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {datasets.slice(0, 5).map((dataset: Dataset) => (
                  <div key={dataset.id} className="flex items-center border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex h-8 w-8 items-center justify-center bg-muted">
                      <Database className="h-3.5 w-3.5" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {dataset.table_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dataset.row_count?.toLocaleString() || 0} rows • {dataset.domain || 'Unknown'}
                      </p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(dataset.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Getting Started</CardTitle>
            <CardDescription>
              Three steps to insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary text-primary-foreground text-xs font-medium">
                1
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Upload Data</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Import CSV or Excel files containing your business data
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary text-primary-foreground text-xs font-medium">
                2
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">AI Analysis</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automatic semantic analysis and pattern detection
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary text-primary-foreground text-xs font-medium">
                3
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Actionable Insights</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review AI-generated business insights and recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
