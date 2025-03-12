import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const useNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize view from URL or default to 'list'
  const defaultView = searchParams.get('view') as 'list' | 'board' | 'calendar' | null;
  const [currentView, setCurrentView] = useState<'list' | 'board' | 'calendar'>(
    defaultView && ['list', 'board', 'calendar'].includes(defaultView) ? defaultView : 'list'
  );

  const handleSmartListClick = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // If clicking the active filter, clear it
    if (searchParams.get('smartList') === id) {
      params.delete('smartList');
    } else {
      params.set('smartList', id);
      params.delete('category');
      params.delete('tag');
    }
    router.push(`/?${params.toString()}`);
  };

  const handleCategoryClick = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // If clicking the active filter, clear it
    if (searchParams.get('category') === id) {
      params.delete('category');
    } else {
      params.set('category', id);
      params.delete('smartList');
      params.delete('tag');
    }
    router.push(`/?${params.toString()}`);
  };

  const handleTagClick = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // If clicking the active filter, clear it
    if (searchParams.get('tag') === id) {
      params.delete('tag');
    } else {
      params.set('tag', id);
      params.delete('category');
      params.delete('smartList');
    }
    router.push(`/?${params.toString()}`);
  };

  const handleViewChange = (view: 'list' | 'board' | 'calendar') => {
    setCurrentView(view);
    const params = new URLSearchParams(searchParams.toString());
    // Preserve existing filters when changing view
    params.set('view', view);
    // Make sure we keep existing filters
    const smartList = searchParams.get('smartList');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    if (smartList) params.set('smartList', smartList);
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);
    router.push(`/?${params.toString()}`);
  };

  return {
    currentView,
    handleSmartListClick,
    handleCategoryClick,
    handleTagClick,
    handleViewChange,
  };
};