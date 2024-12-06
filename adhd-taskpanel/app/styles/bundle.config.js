// CSS Bundle Configuration
module.exports = {
  // Critical CSS bundle
  critical: [
    './styles/critical.css',
    './styles/variables.css',
  ],

  // Component CSS bundle
  components: [
    './styles/components/_index.css',
    './styles/task-panel.css',
  ],

  // Utility CSS bundle
  utilities: [
    './styles/utilities/_index.css',
  ],

  // Base bundle
  base: [
    './styles/theme.css',
    './styles/base.css',
  ],

  // Bundle configuration
  output: {
    critical: './public/styles/critical.css',
    components: './public/styles/components.css',
    utilities: './public/styles/utilities.css',
    base: './public/styles/base.css',
  },

  // PostCSS plugins configuration for each bundle
  plugins: {
    critical: ['postcss-import', 'autoprefixer', 'cssnano'],
    components: ['postcss-import', 'tailwindcss', 'autoprefixer', 'cssnano'],
    utilities: ['postcss-import', 'tailwindcss', 'autoprefixer', 'cssnano'],
    base: ['postcss-import', 'autoprefixer', 'cssnano'],
  }
};