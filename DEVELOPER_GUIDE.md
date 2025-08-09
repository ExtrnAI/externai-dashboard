# ExternAI Dashboard - Developer Guide 🛠️

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Code Organization](#code-organization)
4. [API Integration](#api-integration)
5. [State Management](#state-management)
6. [Event Handling](#event-handling)
7. [Styling System](#styling-system)
8. [Performance Optimization](#performance-optimization)
9. [Security Considerations](#security-considerations)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Process](#deployment-process)
12. [Troubleshooting](#troubleshooting)

## Architecture Overview

The ExternAI Dashboard is built with a **vanilla JavaScript** architecture, focusing on:
- **No external dependencies** for maximum performance
- **Modular code structure** for maintainability
- **Event-driven architecture** for real-time updates
- **Responsive design** with CSS Grid and Flexbox
- **Progressive enhancement** approach

### Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Charts**: Canvas API for data visualization
- **Storage**: LocalStorage/SessionStorage for state persistence
- **Real-time**: WebSocket support ready (in api-config.js)

## Project Structure

```
externai-dashboard/
├── Core Files
│   ├── index.html          # Main HTML structure
│   ├── style.css           # All styling and animations
│   └── script.js           # Main application logic
│
├── API Integration
│   └── api-config.js       # API client and configuration
│
├── Configuration
│   ├── package.json        # Node.js configuration
│   ├── vercel.json         # Vercel deployment config
│   ├── netlify.toml        # Netlify deployment config
│   └── .gitignore          # Git ignore rules
│
├── CI/CD
│   └── .github/
│       └── workflows/
│           └── deploy.yml  # GitHub Actions workflow
│
└── Documentation
    ├── README.md           # User documentation
    ├── DEVELOPER_GUIDE.md  # This file
    └── LICENSE             # MIT License
```

## Code Organization

### JavaScript Structure (script.js)

```javascript
// Global State Management
let currentUser = null;
let currentPage = 'overview';
let agents = [];
let activities = [];

// Main Sections
1. Authentication (lines 1-100)
2. Dashboard Initialization (lines 101-200)
3. Navigation System (lines 201-300)
4. Data Rendering (lines 301-600)
5. Chart Functions (lines 601-800)
6. Utility Functions (lines 801-900)
7. Event Handlers (lines 901-end)
```

### CSS Architecture (style.css)

```css
/* Design System Variables */
:root {
  --primary: #0066FF;
  --success: #00FF00;
  /* ... */
}

/* Component Sections */
1. Core System (Reset, Typography)
2. Layout Components (Grid, Flexbox)
3. UI Components (Cards, Buttons, Forms)
4. Data Display (Tables, Charts)
5. Interactive Elements (Modals, Notifications)
6. Responsive Design (Media Queries)
7. Animations (Keyframes)
8. Utilities (Helper Classes)
```

## API Integration

### Setting Up Real API

1. **Configure Endpoints** in `api-config.js`:
```javascript
const API_CONFIG = {
  BASE_URL: 'https://your-api.com/v1',
  API_KEY: 'your-api-key',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    AGENTS_LIST: '/agents',
    // ... other endpoints
  }
};
```

2. **Initialize Client**:
```javascript
const apiClient = new ExternAIClient();
await apiClient.login(username, password);
```

3. **Replace Mock Data** in `script.js`:
```javascript
// Instead of:
agents = [...mockData.agents];

// Use:
agents = await apiClient.getAgents();
```

### WebSocket Integration

```javascript
// Connect to real-time updates
apiClient.connect(
  (data) => handleRealtimeUpdate(data),
  (error) => console.error(error)
);

// Handle different update types
function handleRealtimeUpdate(data) {
  switch(data.type) {
    case 'agent_status':
      updateAgentStatus(data);
      break;
    case 'metric_update':
      updateMetric(data);
      break;
  }
}
```

## State Management

### Global State Variables
```javascript
// User session
let currentUser = null;

// UI state
let currentPage = 'overview';
let sidebarCollapsed = false;

// Data state
let agents = [];
let activities = [];
let logs = [];
let indexes = [];

// Intervals
let refreshInterval = null;
```

### State Persistence
```javascript
// Save to localStorage
localStorage.setItem('externai_user', JSON.stringify(currentUser));

// Save to sessionStorage
sessionStorage.setItem('externai_temp', JSON.stringify(tempData));

// Retrieve on load
const savedUser = localStorage.getItem('externai_user');
if (savedUser) {
  currentUser = JSON.parse(savedUser);
}
```

## Event Handling

### Navigation Events
```javascript
// Page navigation
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToPage(item.dataset.page);
  });
});
```

### Form Submissions
```javascript
// Login form
document.getElementById('loginForm')
  .addEventListener('submit', handleLogin);
```

### Real-time Updates
```javascript
// Auto-refresh every 5 seconds
refreshInterval = setInterval(refreshData, 5000);
```

## Styling System

### CSS Variables
```css
/* Light Mode (default) */
:root {
  --bg: #FFFFFF;
  --fg: #000000;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #000000;
    --fg: #FFFFFF;
  }
}
```

### Animation System
```css
/* Reusable animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Apply to elements */
.element {
  animation: fadeIn var(--dur-2) var(--ease);
}
```

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet styles */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Desktop styles */
}
```

## Performance Optimization

### Best Practices Implemented

1. **Debouncing**: Prevent excessive API calls
```javascript
let debounceTimer;
function debounce(func, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
}
```

2. **Virtual Scrolling**: For large data sets
```javascript
// Only render visible items
const visibleItems = items.slice(startIndex, endIndex);
```

3. **Lazy Loading**: Load components on demand
```javascript
if (currentPage === 'analytics') {
  loadAnalyticsModule();
}
```

4. **Canvas Optimization**: Efficient chart rendering
```javascript
// Clear and redraw only changed areas
ctx.clearRect(changedArea);
```

### Performance Metrics
- First Paint: < 0.5s
- Time to Interactive: < 1s
- Total Bundle Size: < 50KB

## Security Considerations

### Authentication
```javascript
// Never store sensitive data in code
const API_KEY = process.env.API_KEY; // Use environment variables

// Validate all inputs
function validateInput(input) {
  return input.replace(/[<>]/g, ''); // Basic XSS prevention
}
```

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self';">
```

### HTTPS Only
```javascript
// Force HTTPS in production
if (location.protocol !== 'https:' && !location.hostname.includes('localhost')) {
  location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

## Testing Strategy

### Unit Tests (to be implemented)
```javascript
// Example test structure
describe('Authentication', () => {
  test('should login with valid credentials', async () => {
    const result = await login('admin', 'admin');
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests
```javascript
// Test API integration
async function testAPIConnection() {
  try {
    const response = await apiClient.verifyToken();
    console.assert(response.valid, 'Token should be valid');
  } catch (error) {
    console.error('API test failed:', error);
  }
}
```

### E2E Tests (Cypress/Playwright)
```javascript
// Example E2E test
describe('Dashboard Flow', () => {
  it('should login and navigate', () => {
    cy.visit('/');
    cy.get('#username').type('admin');
    cy.get('#password').type('admin');
    cy.get('form').submit();
    cy.contains('Dashboard Overview').should('be.visible');
  });
});
```

## Deployment Process

### GitHub Pages
```bash
# Push to main branch
git add .
git commit -m "Update dashboard"
git push origin main

# Enable Pages in repository settings
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Drag and drop to Netlify
# Or use CLI
netlify deploy --prod
```

### Docker (optional)
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### Common Issues

1. **Charts not rendering**
   - Check Canvas support
   - Verify element IDs exist
   - Check console for errors

2. **Login not working**
   - Verify credentials (admin/admin)
   - Check localStorage/sessionStorage
   - Clear browser cache

3. **Real-time updates not working**
   - Check WebSocket connection
   - Verify API endpoints
   - Check network tab for errors

4. **Responsive layout broken**
   - Check viewport meta tag
   - Verify CSS Grid support
   - Test in different browsers

### Debug Mode
```javascript
// Enable debug logging
const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log('[ExternAI]', ...args);
  }
}
```

### Browser DevTools
```javascript
// Expose functions for debugging
window.externaiDebug = {
  getState: () => ({ currentUser, agents, activities }),
  resetState: () => location.reload(),
  testAPI: () => testAPIConnection()
};
```

## Contributing

### Code Style
- Use ES6+ features
- Follow consistent naming (camelCase for functions, UPPER_CASE for constants)
- Add JSDoc comments for functions
- Keep functions small and focused

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

## Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [Can I Use](https://caniuse.com/)
- [Web.dev](https://web.dev/)
- [A11y Project](https://www.a11yproject.com/)

## Support

For questions or issues:
- Open an issue on GitHub
- Email: dev@externai.com
- Documentation: https://docs.externai.com

---

**Happy Coding! 🚀**
