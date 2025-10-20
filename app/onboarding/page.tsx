import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CompanyForm } from "./CompanyForm"

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

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  // If user already has a company, redirect to dashboard
  const companyId = await checkUserCompany(userId);
  if (companyId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Clue
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's set up your company to get started
          </p>
        </div>

        <div className="mt-8 rounded-lg bg-white px-6 py-8 shadow">
          <CompanyForm />
        </div>

        <p className="text-center text-xs text-gray-500">
          You can update this information later in settings
        </p>
      </div>
    </div>
  )
}
