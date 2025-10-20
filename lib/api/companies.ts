/**
 * Company API Service
 */

import { apiClient } from './client';
import { Company, CompanyCreate, CompanyUpdate } from './types';

export const companyService = {
  /**
   * Create a new company during onboarding
   */
  async createCompany(userId: string, data: CompanyCreate): Promise<Company> {
    return apiClient<Company>('/api/company/create', {
      method: 'POST',
      userId,
      body: JSON.stringify(data),
    });
  },

  /**
   * Get user's company
   */
  async getMyCompany(userId: string): Promise<Company> {
    return apiClient<Company>('/api/company/me', {
      method: 'GET',
      userId,
    });
  },

  /**
   * Update company information
   */
  async updateCompany(userId: string, data: CompanyUpdate): Promise<Company> {
    return apiClient<Company>('/api/company/update', {
      method: 'PUT',
      userId,
      body: JSON.stringify(data),
    });
  },
};
