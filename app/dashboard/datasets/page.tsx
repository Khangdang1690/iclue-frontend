import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Database, Upload } from "lucide-react";
import type { Dataset } from "@/lib/api/types";
import { userService, etlService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DatasetsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  // Check if user has completed onboarding
  const companyId = await userService.getUserCompany(userId);
  if (!companyId) {
    redirect('/onboarding');
  }

  const datasets = await etlService.getDatasets(userId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Datasets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'} in your workspace
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button size="sm">
            <Upload className="h-3.5 w-3.5 mr-2" />
            Upload
          </Button>
        </Link>
      </div>

      {/* Datasets Grid */}
      {datasets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-base font-medium mb-2">
                No datasets
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                Upload your first dataset to begin AI-powered analysis
              </p>
              <Link href="/dashboard/upload">
                <Button size="sm">
                  <Upload className="h-3.5 w-3.5 mr-2" />
                  Upload Dataset
                </Button>
              </Link>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((dataset: Dataset) => (
              <Card key={dataset.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                      dataset.status === 'ready'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {dataset.status}
                    </span>
                  </div>
                  <CardTitle className="mt-3 text-base">{dataset.table_name}</CardTitle>
                  <CardDescription className="text-xs">{dataset.original_filename}</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2.5 text-xs">
                    {dataset.domain && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Domain</dt>
                        <dd className="font-medium">{dataset.domain}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Rows</dt>
                      <dd className="font-medium font-mono">{dataset.row_count?.toLocaleString() || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Columns</dt>
                      <dd className="font-medium font-mono">{dataset.column_count || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border">
                      <dt className="text-muted-foreground">Uploaded</dt>
                      <dd className="font-medium">
                        {new Date(dataset.uploaded_at).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
          ))}
        </div>
      )}
    </div>
  )
}
