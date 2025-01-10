import React from 'react';

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const handleClose = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center transition-opacity duration-300">
      <div className="bg-background p-8 rounded-lg shadow-lg relative transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Welcome to the Task Panel!</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p className="mb-4">
          This is a quick tutorial to help you get started.
        </p>
        <p className="mb-2">
          1. Use the "+" button to add a new task.
        </p>
        <p className="mb-2">
          2. Click on a task to view its details.
        </p>
        <p className="mb-2">
          3. Use the chat to interact with your tasks.
        </p>
        <p className="mb-2">
          4. Use the account icon to log out or view this tutorial again.
        </p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-secondary hover:bg-secondary/80 text-foreground rounded-lg px-4 py-2 transition-colors"
          >
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;