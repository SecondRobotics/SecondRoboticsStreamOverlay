import { useEffect, useRef } from 'react';

interface FileChangeEvent {
  type: 'file_changed' | 'connected';
  field?: string;
  fileName?: string;
  filePath?: string;
  timestamp?: number;
}

interface FileWatcherOptions {
  field1Path?: string;
  field2Path?: string;
  onFileChange?: (event: FileChangeEvent) => void;
  enabled?: boolean;
}

export const useFileWatcher = (options: FileWatcherOptions) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { field1Path, field2Path, onFileChange, enabled = false } = options;

  useEffect(() => {
    if (!enabled || (!field1Path && !field2Path)) {
      return;
    }

    // Create EventSource connection for Server-Sent Events
    const eventSource = new EventSource('/api/overlay-watch');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('File watcher connected');
      
      // Start watching the specified paths
      fetch('/api/overlay-watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          paths: {
            field1: field1Path,
            field2: field2Path
          }
        })
      }).catch(console.error);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: FileChangeEvent = JSON.parse(event.data);
        if (onFileChange) {
          onFileChange(data);
        }
      } catch (error) {
        console.error('Error parsing file watcher message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('File watcher connection error:', error);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          eventSourceRef.current = new EventSource('/api/overlay-watch');
        }
      }, 5000);
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      // Stop watching on cleanup
      fetch('/api/overlay-watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      }).catch(console.error);
    };
  }, [field1Path, field2Path, enabled, onFileChange]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN
  };
};