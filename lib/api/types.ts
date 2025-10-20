/**
 * TypeScript types for API responses
 */

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  table_name: string;
  original_filename: string;
  domain: string | null;
  row_count: number | null;
  column_count: number | null;
  status: 'ready' | 'processing' | 'error';
  uploaded_at: string;
  created_at: string;
}

export interface DuplicateFileInfo {
  file_path: string;
  dataset_id: string;
  dataset_name: string;
  overlap_percentage: number;
  new_rows: number;
}

export interface ETLProgressUpdate {
  step: string;
  progress: number;
  message: string;
  current_step: string;
  status: 'running' | 'completed' | 'error' | 'duplicate_detected' | 'duplicates_detected';
  error?: string;

  // File processing fields
  file_name?: string;
  file_index?: number;

  // Single duplicate detection fields (legacy, for backward compatibility)
  file_path?: string;
  dataset_id?: string;
  dataset_name?: string;

  // Batch duplicate detection fields (new two-phase approach)
  duplicates?: Record<string, DuplicateFileInfo>; // filename -> duplicate info

  options?: Array<'skip' | 'replace' | 'append_anyway'>;
  metadata?: {
    overlap_percentage?: number;
    new_rows?: number;
    [key: string]: any;
  };

  // Completion data
  data?: {
    company_id?: number;
    total_files?: number;
    processed_files?: number;
    results?: Array<{
      dataset_id: string;
      dataset_name: string;
      status: string;
      metadata: Record<string, any>;
    }>;
    [key: string]: any;
  };
}

export interface CompanyCreate {
  name: string;
  industry: string;
}

export interface CompanyUpdate {
  name?: string;
  industry?: string;
}
