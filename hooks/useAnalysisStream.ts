/**
 * Hook for streaming real-time analysis progress via HTTP streaming (Claude-style)
 * Uses fetch with chunked transfer encoding instead of EventSource/SSE
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';

export interface AnalysisStep {
  name: string;
  display_name: string;
  order: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  details?: {
    message?: string;
    [key: string]: any;
  };
}

export interface AnalysisProgress {
  analysis_id: string;
  status: 'running' | 'completed' | 'failed';
  current_step: number;
  total_steps: number;
  started_at: string;
  steps: Record<string, AnalysisStep>;
  dashboard_url?: string;
  report_path?: string;
  insights_count?: number;
  recommendations_count?: number;
  error?: string;
}

export interface UseAnalysisStreamOptions {
  analysisId: string | null;
  enabled?: boolean;
}

export interface UseAnalysisStreamReturn {
  progress: AnalysisProgress | null;
  isConnected: boolean;
  error: Error | null;
  reconnect: () => void;
}

const STREAM_URL_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/analyses`;

export function useAnalysisStream({
  analysisId,
  enabled = true,
}: UseAnalysisStreamOptions): UseAnalysisStreamReturn {
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateCountRef = useRef(0);

  // Track previous values to detect what's changing
  const prevAnalysisIdRef = useRef(analysisId);
  const prevEnabledRef = useRef(enabled);

  // Connect when analysisId changes or component mounts
  useEffect(() => {
    // Log what changed to trigger this effect
    if (prevAnalysisIdRef.current !== analysisId) {
      console.log(`[STREAM] analysisId changed: ${prevAnalysisIdRef.current} -> ${analysisId}`);
    }
    if (prevEnabledRef.current !== enabled) {
      console.log(`[STREAM] enabled changed: ${prevEnabledRef.current} -> ${enabled}`);
    }
    prevAnalysisIdRef.current = analysisId;
    prevEnabledRef.current = enabled;

    if (!analysisId || !enabled) {
      console.log(`[STREAM] Not connecting: analysisId=${analysisId}, enabled=${enabled}`);
      return;
    }

    // Abort existing connection if any
    if (abortControllerRef.current) {
      console.log('[STREAM] Aborting existing connection before creating new one');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const url = `${STREAM_URL_BASE}/${analysisId}/stream`;
    const connectionId = Date.now();
    console.log(`[STREAM ${connectionId}] Connecting to: ${url}`);

    // Connect using fetch streaming
    (async () => {
      try {
        setIsConnected(true);
        setError(null);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/x-ndjson',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        console.log(`[STREAM ${connectionId}] Connected successfully`);

        // Get reader from response body
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Buffer for incomplete chunks
        let buffer = '';

        // Read stream
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log(`[STREAM ${connectionId}] Stream closed by server`);
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

              // Handle different event types
              if (data.type === 'keepalive') {
                console.log(`[STREAM ${connectionId}] Keepalive received`);
                continue;
              }

              if (data.type === 'error') {
                console.error(`[STREAM ${connectionId}] Error from server:`, data.error);

                flushSync(() => {
                  setProgress((prev) => ({
                    ...prev!,
                    status: 'failed',
                    error: data.error,
                  }));
                  setError(new Error(data.error || 'Unknown error'));
                  setIsConnected(false);
                });
                break;
              }

              if (data.type === 'complete') {
                updateCountRef.current += 1;
                console.log(`[STREAM ${connectionId}] Analysis complete (update #${updateCountRef.current})`);

                // Remove 'type' field before setting progress
                const { type, ...progressData } = data;

                flushSync(() => {
                  setProgress(progressData as AnalysisProgress);
                  setIsConnected(false);
                });
                break;
              }

              if (data.type === 'progress') {
                updateCountRef.current += 1;
                const updateNumber = updateCountRef.current;

                // DETAILED logging
                console.log(`[STREAM ${connectionId}] Progress update #${updateNumber}:`);
                console.log(`  - analysis_id: ${data.analysis_id}`);
                console.log(`  - status: ${data.status}`);
                console.log(`  - current_step: ${data.current_step}`);
                console.log(`  - total_steps: ${data.total_steps}`);

                // Log step statuses
                if (data.steps) {
                  const stepStatuses: Record<string, string> = {};
                  Object.entries(data.steps).forEach(([name, step]) => {
                    stepStatuses[name] = (step as AnalysisStep).status;
                  });
                  console.log(`  - steps:`, stepStatuses);
                } else {
                  console.log(`  - steps: MISSING!`);
                }

                // Remove 'type' field before setting progress
                const { type, ...progressData } = data;

                // Use flushSync to force immediate re-render
                flushSync(() => {
                  setProgress(progressData as AnalysisProgress);
                });

                console.log(`[STREAM ${connectionId}] setProgress called successfully`);
              }

            } catch (parseError) {
              console.error(`[STREAM ${connectionId}] Failed to parse JSON:`, line, parseError);
            }
          }
        }

      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Connection failed');
        if (error.name === 'AbortError') {
          console.log(`[STREAM ${connectionId}] Connection aborted`);
        } else {
          console.error(`[STREAM ${connectionId}] Connection error:`, error);
          setError(error);
          setIsConnected(false);
        }
      } finally {
        setIsConnected(false);
        console.log(`[STREAM ${connectionId}] Disconnected`);
      }
    })();

    // Cleanup on unmount or when analysisId changes
    return () => {
      console.log('[STREAM] Cleanup: aborting connection');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      updateCountRef.current = 0;
    };
  }, [analysisId, enabled]);

  const reconnect = useCallback(() => {
    console.log('[STREAM] Manual reconnect requested');
    // Trigger reconnection by aborting current connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Stop reconnection attempts when analysis is completed or failed
  useEffect(() => {
    if (progress?.status === 'completed' || progress?.status === 'failed') {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }
  }, [progress?.status]);

  return {
    progress,
    isConnected,
    error,
    reconnect,
  };
}
