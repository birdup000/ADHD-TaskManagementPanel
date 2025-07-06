import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe'; // Using global axe from setup
import TaskDescription from '../TaskDescription';
import { Task } from '@/app/types/task';

const mockTaskBase: Task = {
  id: 'task-desc-1',
  title: 'Task For Description Test',
  status: 'todo',
  priority: 'medium',
};

const mockOnUpdateTask = jest.fn();

describe('TaskDescription Component', () => {
  beforeEach(() => {
    mockOnUpdateTask.mockClear();
  });

  test('renders placeholder when description is empty', () => {
    const taskWithNoDescription = { ...mockTaskBase, description: undefined };
    render(
      <TaskDescription task={taskWithNoDescription} onUpdateTask={mockOnUpdateTask} />
    );
    expect(screen.getByText('Click to add a description...')).toBeInTheDocument();
    expect(screen.getByLabelText('Add a description')).toBeInTheDocument();
  });

  test('renders existing description', () => {
    const taskWithDescription = { ...mockTaskBase, description: 'This is a test description.' };
    render(<TaskDescription task={taskWithDescription} onUpdateTask={mockOnUpdateTask} />);
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    expect(screen.getByLabelText('Task description')).toBeInTheDocument();
  });

  test('switches to edit mode on click', () => {
    const taskWithDescription = { ...mockTaskBase, description: 'Test desc.' };
    render(<TaskDescription task={taskWithDescription} onUpdateTask={mockOnUpdateTask} />);

    const descriptionDisplay = screen.getByText('Test desc.');
    fireEvent.click(descriptionDisplay);

    const textarea = screen.getByRole('textbox', { name: 'Task description text area' });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test desc.');
  });

  test('switches to edit mode on pressing Enter or Space on the display div', async () => { // Made async
    render(<TaskDescription task={{...mockTaskBase, description: "Initial"}} onUpdateTask={mockOnUpdateTask} />);
    const displayDiv = screen.getByText("Initial");

    fireEvent.keyDown(displayDiv, { key: 'Enter', code: 'Enter' });
    let textarea = screen.getByRole('textbox', { name: 'Task description text area' });
    expect(textarea).toBeInTheDocument();

    // Revert to display mode for next test part
    fireEvent.blur(textarea);
    // Wait for state update that removes textarea
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());


    // Re-query displayDiv as it might have re-rendered or its event listeners changed
    const displayDivAfterBlur = screen.getByText("Initial");
    fireEvent.keyDown(displayDivAfterBlur, { key: ' ', code: 'Space' });
    textarea = screen.getByRole('textbox', { name: 'Task description text area' });
    expect(textarea).toBeInTheDocument();
  });


  test('updates description on blur after editing', async () => {
    render(<TaskDescription task={mockTaskBase} onUpdateTask={mockOnUpdateTask} />);
    fireEvent.click(screen.getByText('Click to add a description...'));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New description text' } });
    fireEvent.blur(textarea);

    await waitFor(() => {
      expect(mockOnUpdateTask).toHaveBeenCalledWith({ description: 'New description text' });
    }, { timeout: 800 }); // Wait for debounce
  });

  test('does not call update if description is unchanged', async () => {
    const taskWithDescription = { ...mockTaskBase, description: 'Unchanged desc' };
    render(<TaskDescription task={taskWithDescription} onUpdateTask={mockOnUpdateTask} />);
    fireEvent.click(screen.getByText('Unchanged desc'));
    const textarea = screen.getByRole('textbox');
    fireEvent.blur(textarea); // Blur without changing

    // Wait a bit to ensure debounce would have fired if there was a change
    await new Promise(resolve => setTimeout(resolve, 800));
    expect(mockOnUpdateTask).not.toHaveBeenCalled();
  });


  test('attach file button triggers alert (placeholder)', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<TaskDescription task={mockTaskBase} onUpdateTask={mockOnUpdateTask} />);

    const attachButton = screen.getByRole('button', { name: 'Attach file to description' });
    fireEvent.click(attachButton);

    expect(alertSpy).toHaveBeenCalledWith("Attach file clicked - integrate with file upload service.");
    alertSpy.mockRestore();
  });

  test('should have no axe violations when displaying description', async () => {
    const taskWithDescription = { ...mockTaskBase, description: 'Accessible description.' };
    const { container } = render(
      <TaskDescription task={taskWithDescription} onUpdateTask={mockOnUpdateTask} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should have no axe violations when editing description', async () => {
    const { container } = render(
      <TaskDescription task={mockTaskBase} onUpdateTask={mockOnUpdateTask} />
    );
    fireEvent.click(screen.getByText('Click to add a description...')); // Enter edit mode
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
