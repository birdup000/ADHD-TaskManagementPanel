// CSS loading utilities
export const preloadCriticalCSS = () => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = '/styles/preload-critical.css';
    document.head.appendChild(link);
  }
};

export const loadNonCriticalCSS = () => {
  if (typeof window !== 'undefined') {
    const cssFiles = [
      '/styles/utilities.css',
      '/styles/components.css',
    ];
    
    cssFiles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
      document.head.appendChild(link);
    });
  }
};