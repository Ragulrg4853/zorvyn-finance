import React from 'react';
import { Select } from '../../../shared/components/ui/Select';

export function RoleSelector({ roles, loading, value, onChange, label = 'Role' }) {
  const options = roles?.map(role => ({
    label: role.name,
    value: role.name
  })) || [];

  return (
    <Select
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      disabled={loading}
    />
  );
}
