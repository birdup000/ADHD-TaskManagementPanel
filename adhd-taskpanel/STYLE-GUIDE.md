# ADHD Task Panel Style Guide

## CSS Architecture

### Layer Organization
```css
/* 1. Critical CSS */
@import "./critical.css";  /* Core styles needed for initial render */

/* 2. Base Styles */
@import "./variables.css"; /* CSS Custom Properties */
@import "./theme.css";     /* Theme definitions */
@import "./base.css";      /* Base element styles */

/* 3. Components */
@import "./components/_index.css"; /* Component-specific styles */

/* 4. Utilities */
@import "./utilities/_index.css";  /* Utility classes */
```

### CSS Custom Properties

#### Colors
- Primary colors use RGB format for opacity support
- All colors meet WCAG 2.1 Level AAA contrast requirements
- Dark mode colors are properly inverted

#### Spacing
- Uses consistent rem-based scale
- Follows 4px (0.25rem) grid system
- Variables defined in variables.css

#### Typography
- Font families: Geist Sans (primary), Geist Mono (code)
- Font sizes follow modular scale
- Line heights optimized for readability

### Components

#### Buttons
- Use semantic HTML button elements
- Include proper focus states
- Support disabled states
- Include hover and active states
- Maintain minimum touch target size (44x44px)

#### Forms
- Include proper validation states
- Use semantic form elements
- Include proper labels and ARIA attributes
- Support keyboard navigation

### Accessibility Guidelines

#### Color Contrast
- Text: Minimum 7:1 contrast ratio for normal text
- Large Text: Minimum 4.5:1 contrast ratio
- Interactive Elements: Clear focus and hover states

#### Typography
- Base font size: 16px (1rem)
- Line height: Minimum 1.5 for body text
- Maximum width: 75ch for optimal readability

#### Focus Management
- Visible focus indicators
- Skip links for keyboard navigation
- Proper tab order

### Performance

#### Critical CSS
- Inline critical styles
- Async load non-critical CSS
- Preload key assets
- Minimize render-blocking resources

#### CSS Loading Strategy
1. Inline critical CSS
2. Preload essential styles
3. Async load remaining stylesheets
4. Load print styles with media query

### Best Practices

#### Naming Conventions
- Use BEM methodology for components
- Utility classes follow Tailwind conventions
- Custom properties use kebab-case

#### Media Queries
- Mobile-first approach
- Standard breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

#### Code Style
- Use modern CSS features
- Maintain consistent formatting
- Document complex selectors
- Use CSS custom properties for theming

### Development Workflow

#### Tools
- Stylelint for linting
- PostCSS for processing
- CSS Modules for component styles
- Tailwind for utility classes

#### Testing
- Visual regression testing
- Cross-browser testing
- Accessibility testing
- Performance monitoring

### Resources

#### Documentation
- Tailwind CSS docs
- MDN Web Docs
- WCAG Guidelines
- CSS-Tricks