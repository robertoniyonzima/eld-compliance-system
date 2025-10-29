// src/components/manager/DocumentsManagement.jsx
import { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import { apiService } from '../../services/api';

const DocumentsManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Get all daily logs from all drivers
      const response = await apiService.eld.getDailyLogs();
      const logs = response.data || [];
      
      // Filter only finalized logs (those that can have PDFs)
      const finalizedLogs = logs.filter(log => log.is_finalized);
      
      // Sort by date (most recent first)
      finalizedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setDocuments(finalizedLogs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (logId, driverName, date) => {
    try {
      const response = await apiService.eld.generatePDF(logId);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `ELD_Log_${driverName}_${date}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getFilteredDocuments = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return documents.filter(doc => {
      const docDate = new Date(doc.date);
      
      switch(filter) {
        case 'today':
          return docDate >= today;
        case 'week':
          return docDate >= weekAgo;
        case 'month':
          return docDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filteredDocs = getFilteredDocuments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          ELD Documents & PDFs
        </h2>
        <div className="flex space-x-2">
          {['all', 'today', 'week', 'month'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-slate-600 dark:text-slate-400">Loading documents...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <GlassCard key={doc.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        ELD Log - {doc.driver_name || 'Driver'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(doc.date)}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                        <span>📍 {doc.total_miles_driving_today || 0} miles</span>
                        <span>⏱️ {doc.total_driving_hours_today || 0}h driving</span>
                        <span className={`px-2 py-1 rounded ${
                          doc.is_certified 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {doc.is_certified ? '✅ Certified' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadPDF(doc.id, doc.driver_name || 'Driver', doc.date)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                >
                  <span>📥</span>
                  <span>Download PDF</span>
                </button>
              </div>
            </GlassCard>
          ))}

          {filteredDocs.length === 0 && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No documents found for this period
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsManagement;
