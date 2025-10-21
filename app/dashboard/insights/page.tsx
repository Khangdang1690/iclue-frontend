import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { InsightPanelContextualLayout } from "./InsightPanelContextualLayout"

export default async function InsightsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return <InsightPanelContextualLayout userId={userId} />
}
