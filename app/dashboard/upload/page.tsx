import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FileUploader } from "./FileUploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function checkUserCompany(userId: string) {
  try {
    const response = await fetch(`http://localhost:8000/api/me/${userId}`, {
      cache: 'no-store'
    });

    if (response.ok) {
      const userData = await response.json();
      return userData.company_id;
    }
    return null;
  } catch (error) {
    console.error("Error checking user company:", error);
    return null;
  }
}

export default async function UploadPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  // Check if user has completed onboarding
  const companyId = await checkUserCompany(userId);
  if (!companyId) {
    redirect('/onboarding');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload Dataset</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Import CSV or Excel files for AI-powered analysis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <FileUploader />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processing Pipeline</CardTitle>
            <CardDescription>Automated ETL workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-primary/10 text-xs font-medium text-primary">
                  1
                </span>
                <span className="text-muted-foreground text-xs">
                  Semantic analysis & domain classification
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-primary/10 text-xs font-medium text-primary">
                  2
                </span>
                <span className="text-muted-foreground text-xs">
                  Cross-table relationship detection
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-primary/10 text-xs font-medium text-primary">
                  3
                </span>
                <span className="text-muted-foreground text-xs">
                  Data quality validation & cleaning
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-primary/10 text-xs font-medium text-primary">
                  4
                </span>
                <span className="text-muted-foreground text-xs">
                  Industry-specific KPI generation
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-primary/10 text-xs font-medium text-primary">
                  5
                </span>
                <span className="text-muted-foreground text-xs">
                  Vector embedding & storage
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
