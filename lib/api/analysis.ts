/**
 * Business Discovery and Analysis API Service
 */

import { apiClient } from './client';

export interface BusinessDiscoveryRequest {
  user_id: string;
  dataset_ids?: string[];
  analysis_name?: string;
}

export interface Insight {
  id: string;
  title: string;
  narrative: string;
  priority: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  category: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  effort: string;
  priority: number;
}

export interface AnalyticsResult {
  type: "anomaly" | "forecast" | "causal" | "variance";
  title: string;
  description: string;
  data: any;
}

export interface BusinessDiscoveryResponse {
  success: boolean;
  analysis_id?: string;  // ID of the created analysis session
  company_id: string;
  dataset_count: number;
  insights: Insight[];
  synthesized_insights: Insight[];
  recommendations: Recommendation[];
  analytics_results?: {
    anomalies?: any[];
    forecasts?: any[];
    causal_relationships?: any[];
    variance_decomposition?: any[];
  };
  executive_summary?: string;
  dashboard_url?: string;
  error?: string;
}

export interface AnalysisSummary {
  anomalies_count: number;
  forecasts_count: number;
  causal_relationships_count: number;
  variance_components_count: number;
}

export interface AnalysisSession {
  id: string;
  name: string;
  description?: string;
  dataset_count: number;
  insights_generated: number;
  recommendations_generated: number;
  executive_summary?: string;
  analytics_summary?: AnalysisSummary;
  status: "running" | "completed" | "failed";
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface ListAnalysesResponse {
  success: boolean;
  analyses: AnalysisSession[];
  count: number;
}

export interface GetAnalysisResponse {
  success: boolean;
  analysis: AnalysisSession & {
    dataset_ids: string[];
    dashboard_path?: string;
    report_path?: string;
  };
}

export const analysisService = {
  /**
   * Run business discovery workflow on user's datasets
   */
  async runBusinessDiscovery(
    userId: string,
    datasetIds?: string[],
    analysisName?: string
  ): Promise<BusinessDiscoveryResponse> {
    return apiClient<BusinessDiscoveryResponse>('/api/agents/business-discovery/run', {
      method: 'POST',
      userId,
      body: JSON.stringify({
        user_id: userId,
        dataset_ids: datasetIds,
        analysis_name: analysisName || 'Business Analysis',
      }),
    });
  },

  /**
   * List all analyses for a user
   */
  async listAnalyses(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ListAnalysesResponse> {
    return apiClient<ListAnalysesResponse>(
      `/api/analyses?user_id=${userId}&limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        userId,
      }
    );
  },

  /**
   * Get a specific analysis by ID
   */
  async getAnalysis(userId: string, analysisId: string): Promise<GetAnalysisResponse> {
    return apiClient<GetAnalysisResponse>(`/api/analyses/${analysisId}`, {
      method: 'GET',
      userId,
    });
  },

  /**
   * Get dashboard HTML URL for an analysis
   */
  getDashboardUrl(analysisId: string): string {
    return `/api/analyses/${analysisId}/dashboard`;
  },

  /**
   * Get report markdown content for an analysis
   */
  async getReport(userId: string, analysisId: string): Promise<string> {
    const response = await fetch(`http://localhost:8000/api/analyses/${analysisId}/report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch report: ${response.statusText}`);
    }

    return response.text();
  },

  /**
   * Get download URL for report
   */
  getDownloadUrl(analysisId: string): string {
    return `/api/analyses/${analysisId}/download`;
  },

  /**
   * Delete an analysis and its files
   */
  async deleteAnalysis(userId: string, analysisId: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/api/analyses/${analysisId}`, {
      method: 'DELETE',
      userId,
    });
  },
};
