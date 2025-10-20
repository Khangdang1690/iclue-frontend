/**
 * User API Service
 */

import { apiClient } from './client';
import { User } from './types';

export const userService = {
  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    return apiClient<User>(`/api/me/${userId}`, {
      method: 'GET',
    });
  },

  /**
   * Check if user has a company
   */
  async getUserCompany(userId: string): Promise<string | null> {
    try {
      const user = await this.getUser(userId);
      return user.company_id;
    } catch (error) {
      console.error('Error getting user company:', error);
      return null;
    }
  },
};
