import React from 'react';
import { render, screen } from '@testing-library/react';
import SummaryCard from '../../src/micro-apps/dashboard/components/SummaryCard';

// Mocking icons so tests don't fail due to lucide-react SVGs
jest.mock('lucide-react', () => ({
  TrendingUp: () => <svg data-testid="trending-up" />,
  TrendingDown: () => <svg data-testid="trending-down" />,
  Scale: () => <svg data-testid="scale" />,
  Activity: () => <svg data-testid="activity" />
}));

describe('SummaryCard', () => {
  it('should render skeleton when loading is true', () => {
    const { container } = render(<SummaryCard loading={true} />);
    const skeletonElement = container.querySelector('.skeleton');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('should display income value in green', () => {
    const { getByText } = render(
      <SummaryCard title="Total Income" value={1500} type="income" trend={10} loading={false} />
    );
    
    const valueEl = getByText('$1,500.00'); // Assuming formatting formats to standard US currency
    expect(valueEl).toBeInTheDocument();
    
    // Test for a CSS class or style denoting green. The exact style might vary based on your implementation
    expect(valueEl.className).toContain('text-green'); // Assuming utility class like "text-green-500" exists
    
    const labelEl = getByText('Total Income');
    expect(labelEl).toBeInTheDocument();
  });

  it('should display negative net balance in red', () => {
    const { getByText } = render(
      <SummaryCard title="Net Balance" value={-500} type="net" trend={-5} loading={false} />
    );
    
    const valueEl = getByText('-$500.00'); // Assuming formatting includes negative sign
    expect(valueEl).toBeInTheDocument();
    
    // Check if red text is applied for negative net
    expect(valueEl.className).toContain('text-red'); // Assuming utility class like "text-red-500" exists
  });
});
