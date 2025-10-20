/**
 * ETL and Dataset API Service
 */

import { uploadFiles } from './client';
import { apiClient } from './client';
import { Dataset } from './types';

export const etlService = {
  /**
   * Upload files for ETL processing with SSE streaming
   * Returns the Response object for SSE streaming
   */
  async uploadFilesWithProgress(
    userId: string,
    files: File[],
    forceActions?: Record<string, 'skip' | 'replace' | 'append_anyway'>
  ): Promise<Response> {
    return uploadFiles('/api/etl/upload', files, userId, forceActions);
  },

  /**
   * Get all datasets for the user's company
   */
  async getDatasets(userId: string): Promise<Dataset[]> {
    return apiClient<Dataset[]>('/api/etl/datasets', {
      method: 'GET',
      userId,
    });
  },

  /**
   * Get a specific dataset by ID
   */
  async getDataset(userId: string, datasetId: string): Promise<Dataset> {
    return apiClient<Dataset>(`/api/etl/datasets/${datasetId}`, {
      method: 'GET',
      userId,
    });
  },

  /**
   * Delete a dataset
   */
  async deleteDataset(userId: string, datasetId: string): Promise<void> {
    return apiClient<void>(`/api/etl/datasets/${datasetId}`, {
      method: 'DELETE',
      userId,
    });
  },

  /**
   * Get dataset data with pagination
   */
  async getDatasetData(
    userId: string,
    datasetId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<{
    columns: string[];
    rows: any[][];
    total_rows: number;
    limit: number;
    offset: number;
    has_more: boolean;
  }> {
    return apiClient(`/api/etl/datasets/${datasetId}/data?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      userId,
    });
  },
};
