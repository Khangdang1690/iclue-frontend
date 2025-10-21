import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { InsightPanelClient } from "./InsightPanelClient"

export default async function InsightsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insight Panel</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered business insights and recommendations from your data
        </p>
      </div>

      <InsightPanelClient userId={userId} />
    </div>
  )
}
