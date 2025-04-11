import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToolCard from '@/components/ToolCard';
import { BrowserRouter } from 'react-router-dom';

// Mock the hooks we'll need
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { _id: 'user-123' },
  }),
}));

describe('ToolCard Component', () => {
  const mockTool = {
    _id: 'tool-123',
    name: 'Test Tool',
    description: 'A tool for testing',
    category: 'development',
    upvotes: 5,
    wantCount: 3,
    imageUrl: '/placeholder.svg',
    createdBy: { _id: 'user-123', name: 'Test User' },
    createdAt: new Date().toISOString(),
    bookmarked: false,
  };

  const mockHandlers = {
    onUpvote: vi.fn(),
    onWantClick: vi.fn(),
    onBookmark: vi.fn(),
  };

  it('renders the tool card with correct information', () => {
    render(
      <BrowserRouter>
        <ToolCard
          tool={mockTool}
          onUpvote={mockHandlers.onUpvote}
          onWantClick={mockHandlers.onWantClick}
          onBookmark={mockHandlers.onBookmark}
          loading={{}}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Tool')).toBeInTheDocument();
    expect(screen.getByText('A tool for testing')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // upvotes
  });

  it('calls onUpvote when upvote button is clicked', () => {
    render(
      <BrowserRouter>
        <ToolCard
          tool={mockTool}
          onUpvote={mockHandlers.onUpvote}
          onWantClick={mockHandlers.onWantClick}
          onBookmark={mockHandlers.onBookmark}
          loading={{}}
        />
      </BrowserRouter>
    );

    const upvoteButton = screen.getByLabelText(/upvote/i);
    fireEvent.click(upvoteButton);
    
    expect(mockHandlers.onUpvote).toHaveBeenCalledWith('tool-123');
  });
});