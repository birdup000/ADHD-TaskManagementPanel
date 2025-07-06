import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import TaskHeader from '../TaskHeader';
import { Task } from '@/app/types/task';

// Mock the useTasks hook or any other external dependencies if necessary
// For TaskHeader, it primarily relies on props.

const mockTask: Task = {
  id: 'task-1',
  title: 'Initial Task Title',
  status: 'todo',
  priority: 'medium',
  // Add other required fields for Task type if any
};

const mockOnUpdateTask = jest.fn();
const mockOnClosePanel = jest.fn();

describe('TaskHeader Component', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockOnUpdateTask.mockClear();
    mockOnClosePanel.mockClear();
  });

  test('renders task title and checkbox correctly', () => {
    render(
      <TaskHeader
        task={mockTask}
        onUpdateTask={mockOnUpdateTask}
        onClosePanel={mockOnClosePanel}
      />
    );

    expect(screen.getByText('Initial Task Title')).toBeInTheDocument();
    const checkbox = screen.getByLabelText(`Mark task ${mockTask.title} as complete`);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  test('checkbox toggles task status and progress', async () => {
    const { rerender } = render( // Destructure rerender from render result
      <TaskHeader
        task={mockTask}
        onUpdateTask={mockOnUpdateTask}
        onClosePanel={mockOnClosePanel}
      />
    );

    const checkbox = screen.getByLabelText(`Mark task ${mockTask.title} as complete`);
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockOnUpdateTask).toHaveBeenCalledWith({
        status: 'completed',
        progress: 100,
      });
    });

    // Simulate task being updated to completed
    const completedTask = { ...mockTask, status: 'completed' as Task['status'], progress: 100 };
    // Use rerender to update props of the already mounted component
    rerender(
      <TaskHeader
        task={completedTask}
        onUpdateTask={mockOnUpdateTask}
        onClosePanel={mockOnClosePanel}
      />
    );
    // The checkbox is still the same element, just its checked status has changed due to rerender
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);

    await waitFor(() => {
        // Check the latest call since mockOnUpdateTask was called before
        expect(mockOnUpdateTask.mock.calls[mockOnUpdateTask.mock.calls.length - 1][0]).toEqual({
            status: 'todo',
            progress: 0,
        });
    });
  });

  test('allows editing task title', async () => {
    render(
      <TaskHeader
        task={mockTask}
        onUpdateTask={mockOnUpdateTask}
        onClosePanel={mockOnClosePanel}
      />
    );

    const titleDisplay = screen.getByText('Initial Task Title');
    fireEvent.click(titleDisplay);

    const titleInput = screen.getByRole('textbox', { name: 'Task title input' });
    expect(titleInput).toBeInTheDocument();
    fireEvent.change(titleInput, { target: { value: 'Updated Task Title' } });
    fireEvent.blur(titleInput); // Triggers debounced update

    await waitFor(() => {
      expect(mockOnUpdateTask).toHaveBeenCalledWith({ title: 'Updated Task Title' });
    }, { timeout: 600 }); // Wait for debounce
  });

  test('title input reverts to original if blurred empty', async () => {
    render(<TaskHeader task={mockTask} onUpdateTask={mockOnUpdateTask} />);
    fireEvent.click(screen.getByText('Initial Task Title'));
    const titleInput = screen.getByRole('textbox', { name: 'Task title input' });
    fireEvent.change(titleInput, { target: { value: '  ' } }); // Empty value with spaces
    fireEvent.blur(titleInput);

    // Title should revert, and onUpdateTask should not be called with empty.
    // Depending on exact implementation, it might not be called at all, or called with original.
    // For this component, it seems it won't call if title is empty after trim.
    expect(mockOnUpdateTask).not.toHaveBeenCalled();
    expect(screen.getByText('Initial Task Title')).toBeInTheDocument(); // Check it reverted
  });


  test('header collapse button toggles aria-expanded', () => {
    render(
      <TaskHeader
        task={mockTask}
        onUpdateTask={mockOnUpdateTask}
        onClosePanel={mockOnClosePanel}
      />
    );
    const collapseButton = screen.getByRole('button', { name: /collapse header/i });
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true'); // Initially expanded
    fireEvent.click(collapseButton);
    expect(collapseButton).toHaveAttribute('aria-expanded', 'false'); // Collapsed
    fireEvent.click(collapseButton);
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true'); // Expanded again
  });

  test('calls onClosePanel when close button is clicked', () => {
    render(
      <TaskHeader
        task={mockTask}
        onUpdateTask={mockOnUpdateTask}
        onClosePanel={mockOnClosePanel}
      />
    );
    const closeButton = screen.getByRole('button', { name: 'Close task view' });
    fireEvent.click(closeButton);
    expect(mockOnClosePanel).toHaveBeenCalledTimes(1);
  });

  test('link task button triggers alert (placeholder functionality)', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<TaskHeader task={mockTask} onUpdateTask={mockOnUpdateTask} />);
    fireEvent.click(screen.getByRole('button', { name: 'Link task' }));
    expect(alertSpy).toHaveBeenCalledWith("Link task clicked - implement linking functionality.");
    alertSpy.mockRestore();
  });

  // Accessibility Check
  test('should have no axe violations', async () => {
    const { container } = render(
      <TaskHeader
        task={mockTask}
        onUpdateTask={mockOnUpdateTask}
        onClosePanel={mockOnClosePanel}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
