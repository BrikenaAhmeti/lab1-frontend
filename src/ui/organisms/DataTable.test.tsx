import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { lt } from '@/config/copy';
import DataTable from '@/ui/organisms/DataTable';

describe('DataTable', () => {
  it('renders API text as inert text instead of HTML', () => {
    const payload = '<img src=x onerror=alert("xss")>';

    render(
      <LanguageProvider>
        <DataTable
          rows={[{ id: 'patient-1', name: payload }]}
          columns={[{ key: 'name', label: lt('Name', 'Name') }]}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(payload)).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
    expect(document.querySelector('script')).toBeNull();
  });
});
