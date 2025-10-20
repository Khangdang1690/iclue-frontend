import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { userService, etlService } from "@/lib/api";
import { DataHubClient } from "./DataHubClient";

export default async function DataHubPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Check if user has completed onboarding
  const companyId = await userService.getUserCompany(userId);
  if (!companyId) {
    redirect('/onboarding');
  }

  // Fetch initial datasets
  const datasets = await etlService.getDatasets(userId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Data Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and manage your business datasets
        </p>
      </div>

      <DataHubClient initialDatasets={datasets} userId={userId} />
    </div>
  );
}
