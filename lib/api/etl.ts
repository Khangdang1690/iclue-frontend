/**
 * ETL and Dataset API Service
 */

import { uploadFiles } from './client';
import { apiClient } from './client';
import { Dataset } from './types';

// Base URL for ETL endpoints
const ETL_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/etl`;

export interface UploadResponse {
  job_id: string;
  status: string;
}

export const etlService = {
  /**
   * Upload files for ETL processing (fire-and-forget)
   * Returns job_id for streaming progress
   */
  async uploadFilesWithProgress(
    userId: string,
    files: File[],
    forceActions?: Record<string, 'skip' | 'replace' | 'append_anyway'>
  ): Promise<UploadResponse> {
    const response = await uploadFiles('/api/etl/upload', files, userId, forceActions);

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Server returned non-JSON response`);
    }

    // Read response as text first (more reliable than using .json() directly)
    const text = await response.text();
    const data = JSON.parse(text);

    // Validate response structure
    if (!data || !data.job_id) {
      throw new Error(`Invalid response: missing job_id`);
    }

    return data;
  },

  /**
   * Get stream URL for a job
   */
  getStreamUrl(jobId: string): string {
    return `${ETL_BASE_URL}/${jobId}/stream`;
  },

  /**
   * Get status URL for polling fallback
   */
  getStatusUrl(jobId: string): string {
    return `${ETL_BASE_URL}/${jobId}/status`;
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
    rows: (string | number | null | boolean)[][];
    total_rows: number;
    limit: number;
    offset: number;
    has_more: boolean;
  }> {
    return apiClient(`/api/etl/datasets/${datasetId}/data`, {
      method: 'GET',
      userId,
      params: {
        limit: limit.toString(),
        offset: offset.toString(),
      },
    });
  },

  /**
   * Get schema view with all datasets and relationships
   */
  async getSchema(userId: string): Promise<{
    datasets: Array<{
      id: string;
      name: string;
      original_filename: string;
      domain: string;
      description: string;
      row_count: number;
      column_count: number;
      columns: Array<{
        name: string;
        data_type: string;
        semantic_type: string;
        is_primary_key: boolean;
        is_foreign_key: boolean;
        business_meaning: string;
        position: number;
      }>;
      department: string | null;
      dataset_type: string | null;
      time_period: string | null;
      entities: string[];
      typical_use_cases: string[];
      business_context: Record<string, string>;
    }>;
    relationships: Array<{
      id: string;
      from_dataset_id: string;
      to_dataset_id: string;
      from_column: string;
      to_column: string;
      relationship_type: string;
      confidence: number;
      match_percentage: number;
      join_strategy: string;
    }>;
  }> {
    return apiClient('/api/etl/schema', {
      method: 'GET',
      userId,
    });
  },
};
