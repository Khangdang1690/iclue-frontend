/**
 * Server Actions for Company operations
 * These run on the server and can be called from client components
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { companyService } from '@/lib/api';
import { CompanyCreate } from '@/lib/api/types';

/**
 * Create a new company during onboarding
 */
export async function createCompanyAction(data: CompanyCreate) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const company = await companyService.createCompany(userId, data);

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return { success: true, company };
  } catch (error) {
    console.error('Failed to create company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create company',
    };
  }
}

/**
 * Update company information
 */
export async function updateCompanyAction(data: Partial<CompanyCreate>) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const company = await companyService.updateCompany(userId, data);

    // Revalidate settings page
    revalidatePath('/dashboard/settings');

    return { success: true, company };
  } catch (error) {
    console.error('Failed to update company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update company',
    };
  }
}
