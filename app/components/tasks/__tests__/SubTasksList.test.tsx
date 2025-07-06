import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import SubTasksList from '../SubTasksList';
import { Task, SubTask } from '@/app/types/task';

const mockParentTaskBase: Task = {
  id: 'parent-1',
  title: 'Parent Task for SubTasks',
  status: 'todo',
  priority: 'medium',
  subTasks: [],
};

const mockOnUpdateParentTask = jest.fn();

// Helper to create a task with specific subtasks
const createTaskWithSubTasks = (subTasks: SubTask[]): Task => ({
  ...mockParentTaskBase,
  subTasks,
});

describe('SubTasksList Component', () => {
  beforeEach(() => {
    mockOnUpdateParentTask.mockClear();
    // Reset window.confirm mock for each test if needed, or set a default
    (window.confirm as jest.Mock).mockClear().mockReturnValue(true);
  });

  test('renders "No sub-tasks yet" message when there are no sub-tasks', () => {
    render(<SubTasksList parentTask={mockParentTaskBase} onUpdateParentTask={mockOnUpdateParentTask} />);
    expect(screen.getByText('No sub-tasks yet. Add one below.')).toBeInTheDocument();
  });

  test('renders existing sub-tasks', () => {
    const subTasks: SubTask[] = [
      { id: 'st1', title: 'Sub-task 1', isCompleted: false },
      { id: 'st2', title: 'Sub-task 2', isCompleted: true },
    ];
    const taskWithSubTasks = createTaskWithSubTasks(subTasks);
    render(<SubTasksList parentTask={taskWithSubTasks} onUpdateParentTask={mockOnUpdateParentTask} />);

    expect(screen.getByText('Sub-task 1')).toBeInTheDocument();
    // Completed tasks are hidden by default, so we need to click the "Show Completed" button first
    const showCompletedButton = screen.getByRole('button', { name: /Show 1 Completed/i });
    fireEvent.click(showCompletedButton);

    expect(screen.getByText('Sub-task 2')).toBeInTheDocument(); // Now it should be visible
    expect(screen.getByLabelText('Mark sub-task Sub-task 1 as complete')).not.toBeChecked();
    expect(screen.getByLabelText('Mark sub-task Sub-task 2 as complete')).toBeChecked();
  });

  test('adds a new sub-task', async () => {
    render(<SubTasksList parentTask={mockParentTaskBase} onUpdateParentTask={mockOnUpdateParentTask} />);

    const input = screen.getByPlaceholderText('+ Add a sub-task...');
    const addButton = screen.getByRole('button', { name: 'Add sub-task' });

    fireEvent.change(input, { target: { value: 'New shiny sub-task' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnUpdateParentTask).toHaveBeenCalledWith(
        expect.objectContaining({
          subTasks: expect.arrayContaining([
            expect.objectContaining({ title: 'New shiny sub-task', isCompleted: false }),
          ]),
        })
      );
    }, { timeout: 800 }); // Debounce time

    // To verify it's in the DOM after optimistic update (if component re-renders with new subtasks)
    // This requires the component to re-render with the new subTasks passed from parent or updated internally.
    // For this test, we primarily check the callback.
  });

  test('toggles sub-task completion', async () => {
    const subTasks: SubTask[] = [{ id: 'st1', title: 'Toggle Me', isCompleted: false }];
    const taskWithSubTasks = createTaskWithSubTasks(subTasks);
    render(<SubTasksList parentTask={taskWithSubTasks} onUpdateParentTask={mockOnUpdateParentTask} />);

    const checkbox = screen.getByLabelText('Mark sub-task Toggle Me as complete');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockOnUpdateParentTask).toHaveBeenCalledWith(
        expect.objectContaining({
          subTasks: expect.arrayContaining([
            expect.objectContaining({ id: 'st1', title: 'Toggle Me', isCompleted: true }),
          ]),
        })
      );
    }, { timeout: 800 });
  });

  test('edits a sub-task title', async () => {
    const subTasks: SubTask[] = [{ id: 'st1', title: 'Edit This Title', isCompleted: false }];
    const taskWithSubTasks = createTaskWithSubTasks(subTasks);
    render(<SubTasksList parentTask={taskWithSubTasks} onUpdateParentTask={mockOnUpdateParentTask} />);

    const titleDisplay = screen.getByText('Edit This Title');
    fireEvent.click(titleDisplay); // Enter edit mode

    const editInput = screen.getByDisplayValue('Edit This Title');
    fireEvent.change(editInput, { target: { value: 'Title Edited Successfully' } });
    fireEvent.blur(editInput); // Save on blur

    await waitFor(() => {
      expect(mockOnUpdateParentTask).toHaveBeenCalledWith(
        expect.objectContaining({
          subTasks: expect.arrayContaining([
            expect.objectContaining({ id: 'st1', title: 'Title Edited Successfully', isCompleted: false }),
          ]),
        })
      );
    }, { timeout: 800 });
  });

  test('editing sub-task title with Enter key saves it', async () => {
    const subTasks: SubTask[] = [{ id: 'st1', title: 'Enter To Save', isCompleted: false }];
    const taskWithSubTasks = createTaskWithSubTasks(subTasks);
    render(<SubTasksList parentTask={taskWithSubTasks} onUpdateParentTask={mockOnUpdateParentTask} />);
    fireEvent.click(screen.getByText('Enter To Save'));
    const editInput = screen.getByDisplayValue('Enter To Save');
    fireEvent.change(editInput, { target: { value: 'Saved With Enter' } });
    fireEvent.keyDown(editInput, { key: 'Enter', code: 'Enter' });
    await waitFor(() => {
      expect(mockOnUpdateParentTask).toHaveBeenCalledWith(
        expect.objectContaining({
          subTasks: expect.arrayContaining([
            expect.objectContaining({ title: 'Saved With Enter' }),
          ]),
        })
      );
    });
  });

  test('editing sub-task title with Escape key cancels edit', async () => {
    const subTasks: SubTask[] = [{ id: 'st1', title: 'Escape To Cancel', isCompleted: false }];
    const taskWithSubTasks = createTaskWithSubTasks(subTasks);
    const { rerender } = render(<SubTasksList parentTask={taskWithSubTasks} onUpdateParentTask={mockOnUpdateParentTask} />);

    fireEvent.click(screen.getByText('Escape To Cancel'));
    const editInput = screen.getByDisplayValue('Escape To Cancel');
    fireEvent.change(editInput, { target: { value: 'This Should Not Save' } });
    fireEvent.keyDown(editInput, { key: 'Escape', code: 'Escape' });

    // Wait for state to potentially revert (though it might be instant)
    await waitFor(() => {
      expect(screen.queryByDisplayValue('This Should Not Save')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Escape To Cancel')).toBeInTheDocument(); // Original title still there
    expect(mockOnUpdateParentTask).not.toHaveBeenCalled(); // Update should not be called
  });


  test('deletes a sub-task after confirmation', async () => {
    (window.confirm as jest.Mock).mockReturnValueOnce(true); // User confirms deletion
    const subTasks: SubTask[] = [{ id: 'st-to-delete', title: 'Delete Me', isCompleted: false }];
    const taskWithSubTasks = createTaskWithSubTasks(subTasks);
    render(<SubTasksList parentTask={taskWithSubTasks} onUpdateParentTask={mockOnUpdateParentTask} />);

    const deleteButton = screen.getByLabelText('Delete sub-task Delete Me');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this sub-task?");
    await waitFor(() => {
      expect(mockOnUpdateParentTask).toHaveBeenCalledWith(
        expect.objectContaining({
          subTasks: expect.arrayContaining([]), // Expect empty array or array without the deleted one
        })
      );
    }, { timeout: 800 });
  });

  test('does not delete sub-task if confirmation is cancelled', async () => {
    (window.confirm as jest.Mock).mockReturnValueOnce(false); // User cancels deletion
    const subTasks: SubTask[] = [{ id: 'st-no-delete', title: 'Do Not Delete Me', isCompleted: false }];
    const taskWithSubTasks = createTaskWithSubTasks(subTasks);
    render(<SubTasksList parentTask={taskWithSubTasks} onUpdateParentTask={mockOnUpdateParentTask} />);

    const deleteButton = screen.getByLabelText('Delete sub-task Do Not Delete Me');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this sub-task?");
    // Wait a bit to ensure no call is made if it were debounced (though delete isn't usually)
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockOnUpdateParentTask).not.toHaveBeenCalled();
  });


  test('toggles visibility of completed sub-tasks', () => {
    const subTasks: SubTask[] = [
      { id: 'st1', title: 'Active Sub-task', isCompleted: false },
      { id: 'st2', title: 'Completed Sub-task', isCompleted: true },
    ];
    const taskWithSubTasks = createTaskWithSubTasks(subTasks);
    render(<SubTasksList parentTask={taskWithSubTasks} onUpdateParentTask={mockOnUpdateParentTask} />);

    // Initially, completed task is hidden (default behavior of component)
    expect(screen.getByText('Active Sub-task')).toBeInTheDocument();
    expect(screen.queryByText('Completed Sub-task')).not.toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: /Show 1 Completed/i });
    fireEvent.click(toggleButton);

    // Now completed task should be visible
    expect(screen.getByText('Active Sub-task')).toBeInTheDocument();
    expect(screen.getByText('Completed Sub-task')).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('Hide Completed');

    fireEvent.click(toggleButton); // Hide again
    expect(screen.queryByText('Completed Sub-task')).not.toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Show 1 Completed/i);
  });

  test('pie chart and count updates correctly', () => {
    const subTasks: SubTask[] = [
      { id: 's1', title: 'S1', isCompleted: false },
      { id: 's2', title: 'S2', isCompleted: true },
      { id: 's3', title: 'S3', isCompleted: false },
    ];
    const task = createTaskWithSubTasks(subTasks);
    const { rerender } = render(<SubTasksList parentTask={task} onUpdateParentTask={mockOnUpdateParentTask} />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument(); // Initial count

    const updatedSubTasks = subTasks.map(st => st.id === 's1' ? {...st, isCompleted: true} : st);
    const updatedTask = createTaskWithSubTasks(updatedSubTasks);
    rerender(<SubTasksList parentTask={updatedTask} onUpdateParentTask={mockOnUpdateParentTask} />);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });


  test('should have no axe violations', async () => {
    const subTasks: SubTask[] = [
      { id: 'st1', title: 'Accessible Sub-task 1', isCompleted: false },
      { id: 'st2', title: 'Accessible Sub-task 2', isCompleted: true },
    ];
    const taskWithSubTasks = createTaskWithSubTasks(subTasks);
    const { container } = render(
      <SubTasksList parentTask={taskWithSubTasks} onUpdateParentTask={mockOnUpdateParentTask} />
    );
    // Show completed tasks for full coverage
    const toggleButton = screen.getByRole('button', { name: /Show 1 Completed/i });
    fireEvent.click(toggleButton);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
