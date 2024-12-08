export const handleSelectionUpdate = (contentElement: HTMLDivElement): void => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = selection.getRangeAt(0);
  if (!range) return;

  const storedContainer = range.startContainer;
  const storedOffset = range.startOffset;

  if (storedContainer && contentElement.isConnected) {
    requestAnimationFrame(() => {
      try {
        const newRange = document.createRange();
        if (contentElement.contains(storedContainer)) {
          newRange.setStart(storedContainer, storedOffset);
          newRange.setEnd(storedContainer, storedOffset);
        } else {
          const fallbackNode = contentElement.firstChild || contentElement;
          const maxOffset = Math.min(storedOffset, fallbackNode.textContent?.length || 0);
          newRange.setStart(fallbackNode, maxOffset);
          newRange.setEnd(fallbackNode, maxOffset);
        }
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (err) {
        console.warn('Failed to restore cursor position:', err);
      }
    });
  }
};