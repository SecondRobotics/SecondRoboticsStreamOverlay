"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronRightIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface FileContent {
  name: string;
  content: string;
  error?: string;
}

interface FileViewerProps {
  gameFileLocation: string;
}

export default function FileViewer({ gameFileLocation }: FileViewerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [files, setFiles] = useState<FileContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gameFileLocation) {
      loadFiles();
    } else {
      setFiles([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameFileLocation]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/game-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameFileLocation }),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setFiles([]);
      } else {
        setFiles(data.files || []);
      }
    } catch {
      setError('Failed to load files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };


  if (!gameFileLocation || gameFileLocation.trim() === '') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Game Files
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter a game file location to view .txt files
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div 
        className="p-2 cursor-pointer flex items-center justify-between"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-1">
          {isCollapsed ? (
            <ChevronRightIcon className="h-3 w-3 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-3 w-3 text-gray-500" />
          )}
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Game Files
          </h2>
          {files.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({files.length})
            </span>
          )}
        </div>
        {loading && (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-2 pb-2">
          {error && (
            <div className="mb-2 p-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
              <div className="flex items-center space-x-1">
                <ExclamationCircleIcon className="h-3 w-3 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {files.length === 0 && !error && !loading && (
            <p className="text-xs text-gray-500 dark:text-gray-400 p-2">
              No .txt files found in the specified location
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {files.map((file) => (
              <div key={file.name} className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                <div className="p-1 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center space-x-0.5 min-w-0">
                      <DocumentTextIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {file.name}
                      </span>
                    </div>
                    {file.error && (
                      <ExclamationCircleIcon className="h-3 w-3 text-red-500 flex-shrink-0 ml-1" />
                    )}
                  </div>
                  
                  {file.error ? (
                    <p className="text-xs text-red-600 dark:text-red-400 truncate">{file.error}</p>
                  ) : (
                    <pre className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-1 rounded overflow-hidden max-h-20 overflow-y-auto">
                      <code className="break-all whitespace-pre-wrap">{file.content || '(empty)'}</code>
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={loadFiles}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Refresh Files
          </button>
        </div>
      )}
    </div>
  );
}