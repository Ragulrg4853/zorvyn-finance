import React from 'react';
import { Table, Button, Badge } from '../../../shared/components';

export function UserTable({ users, loading, onEdit, onDeactivate }) {
  const columns = [
    { key: 'full_name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (val) => <Badge variant="primary">{val}</Badge> },
    { key: 'is_active', header: 'Status', render: (val) => <Badge variant={val ? 'success' : 'danger'}>{val ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(row)}>Edit</Button>
          {row.is_active && (
            <Button variant="danger" size="sm" onClick={() => onDeactivate(row.id)}>Deactivate</Button>
          )}
        </div>
      )
    }
  ];

  return <Table data={users} columns={columns} loading={loading} />;
}
