import React from 'react';
import { Table, Badge, Pagination } from '../../../shared/components/ui';
import { format } from 'date-fns';

export function AuditLogViewer({ logs, loading, meta, filters, onFilterChange }) {
  const columns = [
    { key: 'timestamp', header: 'Time', render: (val) => format(new Date(val), 'MMM d, yyyy HH:mm:ss') },
    { key: 'user_id', header: 'User ID' },
    { key: 'action', header: 'Action', render: (val) => <Badge variant={val.includes('DELETE') ? 'danger' : 'primary'}>{val}</Badge> },
    { key: 'resource_type', header: 'Resource' },
    { key: 'resource_id', header: 'Resource ID' },
    { key: 'status', header: 'Status', render: (val) => <Badge variant={val === 'success' ? 'success' : 'danger'}>{val}</Badge> },
    { key: 'ip_address', header: 'IP Address' }
  ];

  const handlePageChange = (page) => {
    onFilterChange({ ...filters, page });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Audit Logs</h3>
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Filter by action..."
          className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={filters.action}
          onChange={(e) => onFilterChange({ ...filters, action: e.target.value, page: 1 })}
        />
      </div>
      <Table data={logs} columns={columns} loading={loading} />
      
      {meta && meta.total_pages > 1 && (
        <Pagination
          currentPage={meta.current_page}
          totalPages={meta.total_pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
