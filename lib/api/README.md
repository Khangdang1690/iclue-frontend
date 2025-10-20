# API Service Layer

This directory contains the centralized API service layer for the Next.js frontend, following 2025 best practices for scalable Next.js App Router architecture.

## Architecture Overview

```
lib/api/
├── client.ts      # Base API client with fetch wrapper
├── types.ts       # TypeScript interfaces for API responses
├── users.ts       # User-related API calls
├── companies.ts   # Company management API calls
├── etl.ts         # ETL and dataset API calls
└── index.ts       # Central exports

lib/actions/
└── company.ts     # Server Actions for mutations
```

## Design Principles

### Server Actions vs API Service Layer

**Server Actions** (`lib/actions/`) - Use for:
- Mutations (create, update, delete)
- Operations that need automatic cache revalidation
- Form submissions from client components

**API Service Layer** (`lib/api/`) - Use for:
- Data fetching in Server Components
- Reusable API logic across multiple pages
- Type-safe API calls with error handling

## Usage Examples

### 1. Fetching Data in Server Components

```typescript
import { userService, etlService } from '@/lib/api';

export default async function Page() {
  const { userId } = await auth();

  // Fetch data using service layer
  const datasets = await etlService.getDatasets(userId!);
  const companyId = await userService.getUserCompany(userId!);

  return <div>{/* Render datasets */}</div>;
}
```

### 2. Server Actions for Mutations

```typescript
'use client';

import { createCompanyAction } from '@/lib/actions/company';

export function CompanyForm() {
  async function handleSubmit(data) {
    const result = await createCompanyAction(data);

    if (result.success) {
      // Handle success
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Client-Side API Calls with SSE Streaming

```typescript
'use client';

import { etlService } from '@/lib/api';

export function FileUploader() {
  async function handleUpload(files: File[]) {
    const response = await etlService.uploadFilesWithProgress(userId, files);

    // Read SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      // Process SSE events
    }
  }
}
```

## API Services

### User Service (`userService`)

```typescript
// Get user data
const user = await userService.getUser(userId);

// Check if user has company
const companyId = await userService.getUserCompany(userId);
```

### Company Service (`companyService`)

```typescript
// Create company (prefer Server Action)
const company = await companyService.createCompany(userId, { name, industry });

// Get user's company
const company = await companyService.getMyCompany(userId);

// Update company
const updated = await companyService.updateCompany(userId, { name: 'New Name' });
```

### ETL Service (`etlService`)

```typescript
// Upload files (returns Response for SSE streaming)
const response = await etlService.uploadFilesWithProgress(userId, files);

// Get all datasets
const datasets = await etlService.getDatasets(userId);

// Get specific dataset
const dataset = await etlService.getDataset(userId, datasetId);

// Delete dataset
await etlService.deleteDataset(userId, datasetId);
```

## Error Handling

All API calls throw `APIError` with proper status codes:

```typescript
import { APIError } from '@/lib/api';

try {
  const data = await userService.getUser(userId);
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error ${error.status}:`, error.message);
    console.error('Details:', error.data);
  }
}
```

## Configuration

Set the API base URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Type Safety

All responses are fully typed with TypeScript:

```typescript
import { Dataset, Company, User } from '@/lib/api/types';

const datasets: Dataset[] = await etlService.getDatasets(userId);
```

## Best Practices

1. **Always use the service layer** instead of direct fetch calls
2. **Use Server Actions** for mutations that need cache revalidation
3. **Handle errors** with try-catch blocks
4. **Type everything** - leverage TypeScript for safety
5. **Centralize logic** - add new endpoints to the appropriate service file

## Adding New API Endpoints

1. Add TypeScript types to `types.ts`
2. Create method in appropriate service file
3. Export from `index.ts` if creating a new service
4. Create Server Action in `lib/actions/` if it's a mutation

Example:

```typescript
// lib/api/types.ts
export interface Insight {
  id: string;
  title: string;
  content: string;
}

// lib/api/insights.ts
export const insightService = {
  async getInsights(userId: string): Promise<Insight[]> {
    return apiClient<Insight[]>('/api/insights', {
      method: 'GET',
      userId,
    });
  },
};

// lib/api/index.ts
export { insightService } from './insights';
```

## Migration Guide

### Before (Direct fetch):

```typescript
const response = await fetch('http://localhost:8000/api/etl/datasets', {
  headers: { 'Authorization': `Bearer ${userId}` },
  cache: 'no-store'
});
const datasets = await response.json();
```

### After (Service layer):

```typescript
const datasets = await etlService.getDatasets(userId);
```

Benefits:
- Type safety
- Centralized error handling
- Consistent authentication
- Easier testing
- Better maintainability
