import React, { useState } from 'react';
import { Button, Badge } from '../../../shared/components/ui';
import { Table } from '../../../shared/components/ui/Table';

export function PermissionMatrix({ roles, permissions, onChangePermissions, loading }) {
  const [editingRole, setEditingRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  if (loading) return <div>Loading permissions...</div>;

  const handleEdit = (role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions?.map(p => p.name) || []);
  };

  const handleSave = async (roleName) => {
    await onChangePermissions(roleName, selectedPermissions);
    setEditingRole(null);
  };

  const togglePermission = (permName) => {
    setSelectedPermissions(prev =>
      prev.includes(permName)
        ? prev.filter(p => p !== permName)
        : [...prev, permName]
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Permission Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
              {permissions.map(perm => (
                <th key={perm.name} className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                  {perm.name}
                </th>
              ))}
              <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.name} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium capitalize">{role.name}</td>
                {permissions.map(perm => {
                  const hasPermission = editingRole?.name === role.name 
                    ? selectedPermissions.includes(perm.name) 
                    : role.permissions?.some(rp => rp.name === perm.name);

                  return (
                    <td key={perm.name} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={hasPermission}
                        disabled={editingRole?.name !== role.name}
                        onChange={() => togglePermission(perm.name)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  {editingRole?.name === role.name ? (
                    <div className="flex gap-2">
                       <Button size="sm" onClick={() => handleSave(role.name)}>Save</Button>
                       <Button size="sm" variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>Edit</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
