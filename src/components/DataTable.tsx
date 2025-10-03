import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Database } from 'lucide-react';

interface SensorData {
  timestamp: string;
  temperature: string;
  humidity: string;
  ldr: string;
}

interface ApiResponse {
  status: string;
  data: SensorData[];
}

export function DataTable() {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/getdata');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.status === 'ok' && Array.isArray(result.data)) {
        setData(result.data);
        setLastRefresh(new Date());
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sensor Data Table
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-300">
            Error: {error}
          </span>
        </div>
      )}

      {loading && data.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading sensor data...</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                  Temperature (°C)
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                  Humidity (%)
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
                  LDR Value
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={`${row.timestamp}-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600">
                      {formatTimestamp(row.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600">
                      {row.temperature}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600">
                      {row.humidity}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600">
                      {row.ldr}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{data.length} records loaded</span>
          </div>
          <span>Auto-refresh every 5 seconds</span>
        </div>
      )}
    </div>
  );
}