/**
 * Hook for streaming real-time ETL progress via HTTP streaming
 * Matches the pattern from useAnalysisStream exactly
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';

export interface ETLStreamState {
  progress: number;
  message: string;
  step: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  error: string | null;
  data: any | null;
}

export interface UseETLStreamOptions {
  jobId: string | null;
  userId: string;
  enabled?: boolean;
}

export interface UseETLStreamReturn {
  state: ETLStreamState;
  isConnected: boolean;
  error: Error | null;
  reconnect: () => void;
}

const STREAM_URL_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/etl`;

export function useETLStream({
  jobId,
  userId,
  enabled = true,
}: UseETLStreamOptions): UseETLStreamReturn {
  const [state, setState] = useState<ETLStreamState>({
    progress: 0,
    message: '',
    step: '',
    status: 'idle',
    error: null,
    data: null,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const updateCountRef = useRef(0);

  // Track previous values
  const prevJobIdRef = useRef(jobId);
  const prevEnabledRef = useRef(enabled);

  useEffect(() => {
    // Log what changed
    if (prevJobIdRef.current !== jobId) {
      console.log(`[ETL-STREAM] jobId changed: ${prevJobIdRef.current} -> ${jobId}`);
    }
    if (prevEnabledRef.current !== enabled) {
      console.log(`[ETL-STREAM] enabled changed: ${prevEnabledRef.current} -> ${enabled}`);
    }
    prevJobIdRef.current = jobId;
    prevEnabledRef.current = enabled;

    if (!jobId || !enabled) {
      console.log(`[ETL-STREAM] Not connecting: jobId=${jobId}, enabled=${enabled}`);
      return;
    }

    // Abort existing connection if any
    if (abortControllerRef.current) {
      console.log('[ETL-STREAM] Aborting existing connection');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const url = `${STREAM_URL_BASE}/${jobId}/stream`;
    const connectionId = Date.now();
    console.log(`[ETL-STREAM ${connectionId}] Connecting to: ${url}`);

    // Connect using fetch streaming
    (async () => {
      try {
        setIsConnected(true);
        setError(null);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/x-ndjson',
            'Authorization': `Bearer ${userId}`,
          },
          signal: controller.signal,
        });

        console.log(`[ETL-STREAM ${connectionId}] Response:`, {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        console.log(`[ETL-STREAM ${connectionId}] Connected successfully`);

        // Get reader from response body
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Buffer for incomplete chunks
        let buffer = '';

        // Read stream
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log(`[ETL-STREAM ${connectionId}] Stream closed by server`);
            break;
          }

          // Decode chunk
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete lines (separated by \n)
          const lines = buffer.split('\n');

          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';

          // Process each complete line
          for (const line of lines) {
            if (!line.trim()) continue; // Skip empty lines

            try {
              const data = JSON.parse(line);
              updateCountRef.current += 1;

              console.log(`[ETL-STREAM ${connectionId}] Message #${updateCountRef.current}:`, data.type);

              // Handle different message types
              if (data.type === 'keepalive') {
                console.log(`[ETL-STREAM ${connectionId}] Keepalive received`);
                continue;
              }

              if (data.type === 'error') {
                console.error(`[ETL-STREAM ${connectionId}] Error from server:`, data.error);

                flushSync(() => {
                  setState({
                    progress: 0,
                    message: data.error || 'Unknown error',
                    step: '',
                    status: 'error',
                    error: data.error,
                    data: null,
                  });
                  setError(new Error(data.error || 'Unknown error'));
                  setIsConnected(false);
                });
                break;
              }

              if (data.type === 'complete') {
                console.log(`[ETL-STREAM ${connectionId}] Processing complete`);

                flushSync(() => {
                  setState({
                    progress: 100,
                    message: data.message || 'Processing complete',
                    step: 'Complete',
                    status: 'completed',
                    error: null,
                    data: data.data || null,
                  });
                  setIsConnected(false);
                });
                break;
              }

              if (data.type === 'progress') {
                console.log(`[ETL-STREAM ${connectionId}] Progress: ${data.progress}% - ${data.message}`);

                flushSync(() => {
                  setState({
                    progress: data.progress || 0,
                    message: data.message || '',
                    step: data.step || '',
                    status: 'running',
                    error: null,
                    data: null,
                  });
                });
              }

            } catch (parseError) {
              console.error(`[ETL-STREAM ${connectionId}] Failed to parse JSON:`, line, parseError);
            }
          }
        }

      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Connection failed');
        if (error.name === 'AbortError') {
          console.log(`[ETL-STREAM ${connectionId}] Connection aborted`);
        } else {
          console.error(`[ETL-STREAM ${connectionId}] Connection error:`, error);
          setError(error);
          setIsConnected(false);
        }
      } finally {
        setIsConnected(false);
        console.log(`[ETL-STREAM ${connectionId}] Disconnected`);
      }
    })();

    // Cleanup on unmount or when jobId changes
    return () => {
      console.log('[ETL-STREAM] Cleanup: aborting connection');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      updateCountRef.current = 0;
    };
  }, [jobId, userId, enabled]); // ONLY these dependencies, NO callbacks

  const reconnect = useCallback(() => {
    console.log('[ETL-STREAM] Manual reconnect requested');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    state,
    isConnected,
    error,
    reconnect,
  };
}
