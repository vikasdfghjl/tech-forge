import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToolData } from '@/hooks/useToolData';

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { _id: 'user-123', name: 'Test User' },
  }),
}));

// Mock fetch
const mockFetchResponse = (data: any, ok = true) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => data,
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad Request',
  });
};

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useToolData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tools successfully', async () => {
    const mockTools = [
      { id: '1', name: 'Tool 1' },
      { id: '2', name: 'Tool 2' },
    ];
    
    mockFetchResponse({ tools: mockTools });
    
    const { result } = renderHook(() => useToolData());
    
    await act(async () => {
      const tools = await result.current.getTools();
      expect(tools).toEqual(mockTools);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tools'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should handle tool fetch errors', async () => {
    mockFetchResponse({ message: 'Error fetching tools' }, false);
    
    const { result } = renderHook(() => useToolData());
    
    await expect(result.current.getTools()).rejects.toThrow();
  });

  it('should add a new tool successfully', async () => {
    const newTool = {
      name: 'New Tool',
      description: 'A new tool description',
      category: 'development',
    };

    mockFetchResponse({ tool: { ...newTool, id: '3' } });
    
    const { result } = renderHook(() => useToolData());
    
    await act(async () => {
      await result.current.addTool(newTool);
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tools'),
      expect.objectContaining({ 
        method: 'POST',
        body: expect.any(String)
      })
    );
  });
});