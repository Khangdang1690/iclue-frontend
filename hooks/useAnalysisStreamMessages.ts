/**
 * Hook for streaming real-time analysis messages (Claude-style)
 * Receives narrative messages directly from the backend as analysis runs.
 */

import { useState, useEffect, useRef } from 'react';

export interface StreamMessage {
  type: 'thinking' | 'insight' | 'recommendation' | 'narrative' | 'complete' | 'info' | 'success' | 'error';
  content: string;
  timestamp?: string;
}

interface UseAnalysisStreamMessagesOptions {
  analysisId: string | null;
  enabled?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useAnalysisStreamMessages({
  analysisId,
  enabled = true,
}: UseAnalysisStreamMessagesOptions) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousAnalysisIdRef = useRef<string | null>(null);
  const sawCompletionRef = useRef<boolean>(false);

  useEffect(() => {
    if (!analysisId || !enabled) {
      return;
    }

    // Only clear messages if this is a NEW analysis (different ID)
    const isNewAnalysis = previousAnalysisIdRef.current !== analysisId;
    if (isNewAnalysis) {
      console.log('[MESSAGE-STREAM] New analysis, clearing previous messages');
      setMessages([]);
      previousAnalysisIdRef.current = analysisId;
      sawCompletionRef.current = false;
    }

    // Abort existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const url = `${API_URL}/api/analyses/${analysisId}/stream`;
    console.log(`[MESSAGE-STREAM] Connecting to: ${url}`);

    (async () => {
      try {
        setIsStreaming(true);
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

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const data = JSON.parse(line);
              console.log('[MESSAGE-STREAM] Received:', data);

              // Skip keepalive
              if (data.type === 'keepalive') continue;

              // Handle error
              if (data.type === 'error') {
                setMessages(prev => [...prev, {
                  type: 'error',
                  content: `Error: ${data.error}`,
                  timestamp: new Date().toISOString()
                }]);
                setError(new Error(data.error));
                setIsStreaming(false);
                break;
              }

              // Handle complete
              if (data.type === 'complete') {
                console.log('[MESSAGE-STREAM] ✅ COMPLETION MESSAGE RECEIVED!');
                console.log('[MESSAGE-STREAM] Insights:', data.insights_count, 'Recommendations:', data.recommendations_count);

                const completionMessage = {
                  type: 'complete' as const,
                  content: `✅ Analysis complete! Generated ${data.insights_count || 0} insights and ${data.recommendations_count || 0} recommendations.`,
                  timestamp: new Date().toISOString()
                };

                setMessages(prev => {
                  const newMessages = [...prev, completionMessage];
                  console.log('[MESSAGE-STREAM] Added completion message. Total messages:', newMessages.length);
                  return newMessages;
                });

                console.log('[MESSAGE-STREAM] Setting isStreaming to FALSE');
                setIsStreaming(false);
                sawCompletionRef.current = true;
                break;
              }

              // Handle message - just add it directly
              if (data.type === 'message') {
                console.log('[MESSAGE-STREAM] Adding message:', data.content);
                setMessages(prev => {
                  const newMessages = [...prev, {
                    type: data.message_type || 'info',
                    content: data.content,
                    timestamp: new Date().toISOString()
                  }];
                  console.log('[MESSAGE-STREAM] Total messages now:', newMessages.length);
                  return newMessages;
                });
              }

            } catch (parseError) {
              console.error('[MESSAGE-STREAM] Parse error:', parseError);
            }
          }
        }

      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Stream error');
        if (error.name !== 'AbortError') {
          console.error('[MESSAGE-STREAM] ❌ Error:', error);
          setError(error);
          setIsStreaming(false);
        } else {
          console.log('[MESSAGE-STREAM] Stream aborted (normal disconnection)');
        }
      } finally {
        console.log('[MESSAGE-STREAM] 🏁 Finally block - setting isStreaming to false');
        setIsStreaming(false);

        // Fallback: if stream ended without a completion event, check analysis status
        // This handles races where the backend completes before the client registers
        if (analysisId && !sawCompletionRef.current) {
          try {
            const statusRes = await fetch(`${API_URL}/api/analyses/${analysisId}`, {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
            });
            if (statusRes.ok) {
              const statusJson = await statusRes.json();
              const status = statusJson?.analysis?.status;
              if (status === 'completed') {
                const completionMessage: StreamMessage = {
                  type: 'complete',
                  content: '✅ Analysis complete! (detected via status check)',
                  timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, completionMessage]);
                sawCompletionRef.current = true;
              } else if (status === 'failed') {
                const errorMsg = statusJson?.analysis?.error_message || 'Analysis failed';
                setMessages(prev => [...prev, { type: 'error', content: `Error: ${errorMsg}`, timestamp: new Date().toISOString() }]);
                setError(new Error(errorMsg));
              }
            }
          } catch (e) {
            console.warn('[MESSAGE-STREAM] Fallback status check failed', e);
          }
        }
      }
    })();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [analysisId, enabled]);

  return {
    messages,
    isStreaming,
    error,
  };
}
