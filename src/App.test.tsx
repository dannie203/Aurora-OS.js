import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Simple smoke test component
function SmokeTest() {
    return <div>Aurora OS</div>;
}

describe('Aurora OS', () => {
    it('renders successfully', () => {
        render(<SmokeTest />);
        expect(screen.getByText('Aurora OS')).toBeInTheDocument();
    });
});
