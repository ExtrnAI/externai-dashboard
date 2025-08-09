// ========== GLOBAL STATE ==========
let currentUser = null;
let currentPage = 'overview';
let sidebarCollapsed = false;
let refreshInterval = null;
let notifications = [];
let agents = [];
let activities = [];
let logs = [];
let indexes = [];

// ========== SIMULATED DATA ==========
const mockData = {
  agents: [
    { id: 'AGT-001', name: 'Reasoning Core', status: 'online', tasks: 1247, accuracy: 99.2, latency: 89, type: 'reasoning', cpu: 45, memory: 62 },
    { id: 'AGT-002', name: 'Vision Analyzer', status: 'online', tasks: 892, accuracy: 97.8, latency: 124, type: 'vision', cpu: 78, memory: 84 },
    { id: 'AGT-003', name: 'Text Generator', status: 'processing', tasks: 3421, accuracy: 98.9, latency: 156, type: 'generation', cpu: 92, memory: 71 },
    { id: 'AGT-004', name: 'Data Miner', status: 'online', tasks: 5672, accuracy: 99.7, latency: 43, type: 'analysis', cpu: 34, memory: 45 },
    { id: 'AGT-005', name: 'API Gateway', status: 'online', tasks: 10234, accuracy: 99.9, latency: 12, type: 'system', cpu: 23, memory: 38 },
    { id: 'AGT-006', name: 'Security Monitor', status: 'online', tasks: 8921, accuracy: 100, latency: 8, type: 'security', cpu: 15, memory: 22 },
    { id: 'AGT-007', name: 'Cache Manager', status: 'offline', tasks: 0, accuracy: 0, latency: 0, type: 'system', cpu: 0, memory: 0 },
    { id: 'AGT-008', name: 'Workflow Engine', status: 'online', tasks: 2341, accuracy: 98.1, latency: 67, type: 'automation', cpu: 56, memory: 68 },
    { id: 'AGT-009', name: 'NLP Processor', status: 'online', tasks: 4567, accuracy: 96.4, latency: 98, type: 'language', cpu: 67, memory: 73 },
    { id: 'AGT-010', name: 'Pattern Detector', status: 'processing', tasks: 1823, accuracy: 94.7, latency: 234, type: 'analysis', cpu: 88, memory: 91 },
    { id: 'AGT-011', name: 'Quality Checker', status: 'online', tasks: 6234, accuracy: 99.1, latency: 45, type: 'validation', cpu: 41, memory: 53 },
    { id: 'AGT-012', name: 'Edge Compute', status: 'online', tasks: 3456, accuracy: 97.2, latency: 178, type: 'distributed', cpu: 72, memory: 66 }
  ],
  
  activities: [
    { time: '10:23:45', agent: 'Reasoning Core', action: 'Process request #4821', status: 'success', duration: '124ms' },
    { time: '10:23:41', agent: 'Vision Analyzer', action: 'Image classification', status: 'success', duration: '892ms' },
    { time: '10:23:38', agent: 'Text Generator', action: 'Generate response', status: 'processing', duration: '1.2s' },
    { time: '10:23:35', agent: 'Data Miner', action: 'Extract patterns', status: 'success', duration: '43ms' },
    { time: '10:23:30', agent: 'API Gateway', action: 'Route request', status: 'success', duration: '12ms' },
    { time: '10:23:28', agent: 'Security Monitor', action: 'Scan for threats', status: 'success', duration: '8ms' },
    { time: '10:23:25', agent: 'Workflow Engine', action: 'Execute workflow', status: 'success', duration: '67ms' },
    { time: '10:23:20', agent: 'NLP Processor', action: 'Parse text', status: 'error', duration: '2.1s' },
  ],
  
  indexes: [
    { name: 'Knowledge Base v2', documents: 15234, size: '1.2GB', updated: '2025-01-15 14:30', status: 'active' },
    { name: 'Customer Data', documents: 8921, size: '456MB', updated: '2025-01-15 13:45', status: 'active' },
    { name: 'Product Catalog', documents: 3456, size: '234MB', updated: '2025-01-15 12:00', status: 'syncing' },
    { name: 'Support Tickets', documents: 45678, size: '789MB', updated: '2025-01-15 10:15', status: 'active' },
    { name: 'Documentation', documents: 2341, size: '123MB', updated: '2025-01-14 18:30', status: 'active' },
  ],
  
  billingHistory: [
    { date: '2025-01-01', amount: '$299.00', status: 'Paid', invoice: 'INV-2025-001' },
    { date: '2024-12-01', amount: '$299.00', status: 'Paid', invoice: 'INV-2024-012' },
    { date: '2024-11-01', amount: '$299.00', status: 'Paid', invoice: 'INV-2024-011' },
    { date: '2024-10-01', amount: '$299.00', status: 'Paid', invoice: 'INV-2024-010' },
  ]
};

// ========== AUTHENTICATION ==========
function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;
  
  // Simple authentication check
  if (username === 'admin' && password === 'admin') {
    currentUser = { username, role: 'admin' };
    
    // Store in localStorage if remember me is checked
    if (remember) {
      localStorage.setItem('externai_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.setItem('externai_user', JSON.stringify(currentUser));
    }
    
    // Show dashboard
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('userDisplay').textContent = username.charAt(0).toUpperCase() + username.slice(1);
    
    // Initialize dashboard
    initDashboard();
    
    showNotification('Welcome back, ' + username + '!', 'success');
  } else {
    // Show error
    document.getElementById('loginError').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('loginError').classList.add('hidden');
    }, 3000);
  }
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    currentUser = null;
    localStorage.removeItem('externai_user');
    sessionStorage.removeItem('externai_user');
    
    // Stop refresh interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    // Show login screen
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginContainer').classList.remove('hidden');
    
    // Reset form
    document.getElementById('loginForm').reset();
  }
}

// ========== DASHBOARD INITIALIZATION ==========
function initDashboard() {
  // Load data
  agents = [...mockData.agents];
  activities = [...mockData.activities];
  indexes = [...mockData.indexes];
  
  // Initialize components
  updateMetrics();
  renderAgents();
  renderActivities();
  initCharts();
  startClock();
  
  // Set up auto-refresh
  refreshInterval = setInterval(refreshData, 5000);
  
  // Initialize logs
  addLog('info', 'System initialized successfully');
  addLog('success', 'Connected to ExternAI servers');
  addLog('info', 'Dashboard ready');
}

// ========== NAVIGATION ==========
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const page = item.dataset.page;
      navigateToPage(page);
      
      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function navigateToPage(page) {
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(p => {
    p.classList.add('hidden');
  });
  
  // Show selected page
  const pageElement = document.getElementById(`${page}-page`);
  if (pageElement) {
    pageElement.classList.remove('hidden');
  }
  
  // Update page title
  const titles = {
    overview: 'Dashboard Overview',
    agents: 'AI Agents Management',
    indexes: 'Knowledge Indexes',
    analytics: 'Advanced Analytics',
    logs: 'System Logs',
    billing: 'Billing & Usage',
    settings: 'Settings'
  };
  
  document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
  currentPage = page;
  
  // Load page-specific content
  loadPageContent(page);
}

function loadPageContent(page) {
  switch(page) {
    case 'agents':
      renderAllAgents();
      break;
    case 'indexes':
      renderIndexes();
      break;
    case 'analytics':
      renderAnalytics();
      break;
    case 'logs':
      renderLogs();
      break;
    case 'billing':
      renderBilling();
      break;
  }
}

// ========== SIDEBAR TOGGLE ==========
function setupSidebar() {
  const toggleBtn = document.getElementById('sidebarToggle');
  
  toggleBtn.addEventListener('click', () => {
    sidebarCollapsed = !sidebarCollapsed;
    const dashboard = document.getElementById('dashboard');
    
    if (sidebarCollapsed) {
      dashboard.classList.add('sidebar-collapsed');
    } else {
      dashboard.classList.remove('sidebar-collapsed');
    }
  });
}

// ========== METRICS UPDATE ==========
function updateMetrics() {
  // Simulate metric updates
  const activeAgents = agents.filter(a => a.status !== 'offline').length;
  const totalRequests = Math.floor(Math.random() * 5000 + 45000);
  const responseTime = Math.floor(Math.random() * 50 + 100);
  const successRate = (Math.random() * 2 + 98).toFixed(1);
  const indexSize = (Math.random() * 0.5 + 2.2).toFixed(1);
  const apiUsage = Math.floor(Math.random() * 20 + 70);
  
  document.getElementById('activeAgents').textContent = activeAgents;
  document.getElementById('totalRequests').textContent = (totalRequests / 1000).toFixed(1) + 'K';
  document.getElementById('responseTime').textContent = responseTime + 'ms';
  document.getElementById('successRate').textContent = successRate + '%';
  document.getElementById('indexSize').textContent = indexSize + 'GB';
  document.getElementById('apiUsage').textContent = apiUsage + '%';
}

// ========== AGENTS RENDERING ==========
function renderAgents() {
  const grid = document.getElementById('agentsGrid');
  grid.innerHTML = '';
  
  // Show first 6 agents on overview
  const displayAgents = agents.slice(0, 6);
  
  displayAgents.forEach(agent => {
    const card = createAgentCard(agent);
    grid.appendChild(card);
  });
}

function renderAllAgents() {
  const grid = document.getElementById('allAgentsGrid');
  grid.innerHTML = '';
  
  agents.forEach(agent => {
    const card = createAgentCard(agent, true);
    grid.appendChild(card);
  });
}

function createAgentCard(agent, showActions = false) {
  const card = document.createElement('div');
  card.className = 'agent-card';
  card.innerHTML = `
    <div class="agent-status ${agent.status}"></div>
    <div class="agent-name">${agent.name}</div>
    <div class="agent-type">${agent.type}</div>
    <div class="agent-stats">
      <div class="agent-stat">
        <span class="agent-stat-label">Tasks</span>
        <span class="agent-stat-value">${agent.tasks.toLocaleString()}</span>
      </div>
      <div class="agent-stat">
        <span class="agent-stat-label">Accuracy</span>
        <span class="agent-stat-value">${agent.accuracy}%</span>
      </div>
      <div class="agent-stat">
        <span class="agent-stat-label">Latency</span>
        <span class="agent-stat-value">${agent.latency}ms</span>
      </div>
      <div class="agent-stat">
        <span class="agent-stat-label">CPU</span>
        <span class="agent-stat-value">${agent.cpu}%</span>
      </div>
    </div>
    ${showActions ? `
      <div class="agent-actions">
        <button class="btn btn-sm" onclick="showAgentDetails('${agent.id}')">Details</button>
        <button class="btn btn-sm ${agent.status === 'offline' ? 'btn-success' : 'btn-danger'}" 
                onclick="toggleAgent('${agent.id}')">
          ${agent.status === 'offline' ? 'Start' : 'Stop'}
        </button>
      </div>
    ` : ''}
  `;
  
  card.onclick = () => showAgentDetails(agent.id);
  
  return card;
}

function showAgentDetails(agentId) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;
  
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  modalTitle.textContent = `Agent: ${agent.name}`;
  modalBody.innerHTML = `
    <div style="display:grid;gap:20px">
      <div>
        <h3>Status</h3>
        <span class="status-badge ${agent.status}">${agent.status}</span>
      </div>
      <div>
        <h3>Performance Metrics</h3>
        <table class="data-table">
          <tr><td>Total Tasks</td><td>${agent.tasks.toLocaleString()}</td></tr>
          <tr><td>Accuracy Rate</td><td>${agent.accuracy}%</td></tr>
          <tr><td>Average Latency</td><td>${agent.latency}ms</td></tr>
          <tr><td>CPU Usage</td><td>${agent.cpu}%</td></tr>
          <tr><td>Memory Usage</td><td>${agent.memory}%</td></tr>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" onclick="editAgent('${agent.id}')">Edit Configuration</button>
      </div>
    </div>
  `;
  
  showModal();
}

function toggleAgent(agentId) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;
  
  if (agent.status === 'offline') {
    agent.status = 'online';
    showNotification(`Agent ${agent.name} started successfully`, 'success');
  } else {
    agent.status = 'offline';
    agent.cpu = 0;
    agent.memory = 0;
    showNotification(`Agent ${agent.name} stopped`, 'warning');
  }
  
  // Re-render agents
  if (currentPage === 'agents') {
    renderAllAgents();
  } else {
    renderAgents();
  }
}

// ========== ACTIVITIES RENDERING ==========
function renderActivities() {
  const table = document.getElementById('activityTable');
  table.innerHTML = '';
  
  activities.slice(0, 10).forEach(activity => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${activity.time}</td>
      <td>${activity.agent}</td>
      <td>${activity.action}</td>
      <td><span class="status-badge ${activity.status}">${activity.status}</span></td>
      <td>${activity.duration}</td>
    `;
    table.appendChild(row);
  });
}

// ========== INDEXES RENDERING ==========
function renderIndexes() {
  const table = document.getElementById('indexesTable');
  table.innerHTML = '';
  
  indexes.forEach(index => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index.name}</td>
      <td>${index.documents.toLocaleString()}</td>
      <td>${index.size}</td>
      <td>${index.updated}</td>
      <td><span class="status-badge ${index.status}">${index.status}</span></td>
      <td>
        <button class="btn btn-sm" onclick="syncIndex('${index.name}')">Sync</button>
        <button class="btn btn-sm" onclick="deleteIndex('${index.name}')">Delete</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function syncIndex(name) {
  showNotification(`Syncing index: ${name}`, 'info');
  
  // Find and update index status
  const index = indexes.find(i => i.name === name);
  if (index) {
    index.status = 'syncing';
    renderIndexes();
    
    // Simulate sync completion
    setTimeout(() => {
      index.status = 'active';
      index.updated = new Date().toLocaleString();
      renderIndexes();
      showNotification(`Index ${name} synced successfully`, 'success');
    }, 3000);
  }
}

function deleteIndex(name) {
  if (confirm(`Are you sure you want to delete index: ${name}?`)) {
    indexes = indexes.filter(i => i.name !== name);
    renderIndexes();
    showNotification(`Index ${name} deleted`, 'warning');
  }
}

// ========== ANALYTICS RENDERING ==========
function renderAnalytics() {
  const container = document.getElementById('analyticsMetrics');
  container.innerHTML = '';
  
  const metrics = [
    { label: 'Avg Response Time', value: '132ms', change: '↓ 12ms' },
    { label: 'Error Rate', value: '0.02%', change: '↓ 0.01%' },
    { label: 'Throughput', value: '8.4K/s', change: '↑ 1.2K/s' },
    { label: 'Active Sessions', value: '1,234', change: '↑ 234' },
    { label: 'Cache Hit Rate', value: '94.5%', change: '↑ 2.3%' },
    { label: 'Queue Length', value: '23', change: '↓ 5' }
  ];
  
  metrics.forEach(metric => {
    const card = document.createElement('div');
    card.className = 'metric-card';
    card.innerHTML = `
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${metric.value}</div>
      <div class="metric-change positive">${metric.change}</div>
    `;
    container.appendChild(card);
  });
  
  // Draw performance chart
  drawPerformanceChart();
}

// ========== LOGS RENDERING ==========
function renderLogs() {
  const terminal = document.getElementById('logsTerminal');
  terminal.innerHTML = '';
  
  logs.forEach(log => {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `
      <span class="terminal-time">${log.time}</span>
      <span class="terminal-level ${log.level}">[${log.level.toUpperCase()}]</span>
      <span>${log.message}</span>
    `;
    terminal.appendChild(line);
  });
  
  // Auto-scroll to bottom
  terminal.scrollTop = terminal.scrollHeight;
}

function addLog(level, message) {
  const log = {
    time: new Date().toLocaleTimeString(),
    level,
    message
  };
  
  logs.unshift(log);
  
  // Keep only last 100 logs
  if (logs.length > 100) {
    logs = logs.slice(0, 100);
  }
  
  // Update UI if on logs page
  if (currentPage === 'logs') {
    renderLogs();
  }
}

function clearLogs() {
  if (confirm('Clear all logs?')) {
    logs = [];
    renderLogs();
    addLog('info', 'Logs cleared by user');
  }
}

function exportLogs() {
  const logsText = logs.map(log => 
    `${log.time} [${log.level.toUpperCase()}] ${log.message}`
  ).join('\n');
  
  const blob = new Blob([logsText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `externai-logs-${Date.now()}.txt`;
  a.click();
  
  showNotification('Logs exported successfully', 'success');
}

// ========== BILLING RENDERING ==========
function renderBilling() {
  const table = document.getElementById('billingHistory');
  table.innerHTML = '';
  
  mockData.billingHistory.forEach(bill => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${bill.date}</td>
      <td>${bill.amount}</td>
      <td><span class="status-badge success">${bill.status}</span></td>
      <td><a href="#" onclick="downloadInvoice('${bill.invoice}'); return false;">${bill.invoice}</a></td>
    `;
    table.appendChild(row);
  });
}

function downloadInvoice(invoiceId) {
  showNotification(`Downloading invoice ${invoiceId}...`, 'info');
  // Simulate download
  setTimeout(() => {
    showNotification('Invoice downloaded successfully', 'success');
  }, 1000);
}

// ========== CHARTS ==========
function initCharts() {
  drawVolumeChart();
  drawDistributionChart();
}

function drawVolumeChart() {
  const canvas = document.getElementById('volumeChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Generate random data points
  const points = [];
  for (let i = 0; i < 24; i++) {
    points.push(Math.random() * height * 0.8 + height * 0.1);
  }
  
  // Draw line chart
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary');
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  points.forEach((point, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = point;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
  
  // Draw gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(0, 102, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
}

function drawDistributionChart() {
  const canvas = document.getElementById('distributionChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Pie chart data
  const data = [
    { label: 'Reasoning', value: 40, color: '#0066FF' },
    { label: 'Analysis', value: 25, color: '#00FF00' },
    { label: 'Generation', value: 20, color: '#FFD700' },
    { label: 'Vision', value: 10, color: '#FF00FF' },
    { label: 'Other', value: 5, color: '#808080' }
  ];
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;
  
  let currentAngle = -Math.PI / 2;
  
  data.forEach(segment => {
    const angle = (segment.value / 100) * Math.PI * 2;
    
    // Draw segment
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = segment.color;
    ctx.fill();
    
    currentAngle += angle;
  });
}

function drawPerformanceChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw multiple lines
  const datasets = [
    { color: '#0066FF', data: [] },
    { color: '#00FF00', data: [] },
    { color: '#FFD700', data: [] }
  ];
  
  // Generate data
  for (let i = 0; i < 50; i++) {
    datasets.forEach(dataset => {
      dataset.data.push(Math.random() * height * 0.8 + height * 0.1);
    });
  }
  
  // Draw each dataset
  datasets.forEach(dataset => {
    ctx.strokeStyle = dataset.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    dataset.data.forEach((point, i) => {
      const x = (i / (dataset.data.length - 1)) * width;
      const y = point;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  });
}

// ========== MODALS ==========
function showModal(type = 'default') {
  const modal = document.getElementById('modal');
  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('active');
}

function editAgent(agentId) {
  // Placeholder for agent editing
  showNotification('Agent configuration editor coming soon', 'info');
  closeModal();
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'info') {
  const container = document.getElementById('notifications');
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <span style="cursor:pointer" onclick="this.parentElement.remove()">×</span>
  `;
  
  container.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// ========== UTILITIES ==========
function startClock() {
  function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const element = document.getElementById('currentTime');
    if (element) {
      element.textContent = timeString;
    }
  }
  
  updateClock();
  setInterval(updateClock, 1000);
}

function refreshData() {
  // Simulate data refresh
  updateMetrics();
  
  // Add random activity
  if (Math.random() > 0.7) {
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const actions = ['Process request', 'Analyze data', 'Generate response', 'Execute task'];
    const statuses = ['success', 'success', 'success', 'processing', 'error'];
    
    const newActivity = {
      time: new Date().toLocaleTimeString(),
      agent: randomAgent.name,
      action: actions[Math.floor(Math.random() * actions.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      duration: Math.floor(Math.random() * 2000) + 'ms'
    };
    
    activities.unshift(newActivity);
    activities = activities.slice(0, 50);
    
    if (currentPage === 'overview') {
      renderActivities();
    }
    
    // Add log
    addLog(newActivity.status === 'error' ? 'error' : 'info', 
           `${newActivity.agent}: ${newActivity.action}`);
  }
  
  // Update agent stats
  agents.forEach(agent => {
    if (agent.status === 'online') {
      agent.tasks += Math.floor(Math.random() * 10);
      agent.cpu = Math.floor(Math.random() * 100);
      agent.memory = Math.floor(Math.random() * 100);
    }
  });
  
  // Redraw charts
  if (currentPage === 'overview') {
    drawVolumeChart();
    drawDistributionChart();
  }
}

function toggleApiKey() {
  const input = document.getElementById('apiKey');
  if (input.type === 'password') {
    input.type = 'text';
    input.value = 'sk-proj-abc123xyz789def456ghi';
  } else {
    input.type = 'password';
    input.value = 'sk-...abc123';
  }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  // Check for saved session
  const savedUser = localStorage.getItem('externai_user') || 
                   sessionStorage.getItem('externai_user');
  
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('userDisplay').textContent = 
      currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
    initDashboard();
  }
  
  // Set up event listeners
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  setupNavigation();
  setupSidebar();
  
  // Close modal on outside click
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
      closeModal();
    }
  });
  
  // Chart time range selector
  const chartTimeRange = document.getElementById('chartTimeRange');
  if (chartTimeRange) {
    chartTimeRange.addEventListener('change', () => {
      showNotification(`Switching to ${chartTimeRange.value} view`, 'info');
      drawVolumeChart();
    });
  }
  
  // Log filter
  const logFilter = document.getElementById('logFilter');
  if (logFilter) {
    logFilter.addEventListener('change', () => {
      const filter = logFilter.value;
      if (filter === 'all') {
        renderLogs();
      } else {
        const filtered = logs.filter(log => log.level === filter);
        const terminal = document.getElementById('logsTerminal');
        terminal.innerHTML = '';
        
        filtered.forEach(log => {
          const line = document.createElement('div');
          line.className = 'terminal-line';
          line.innerHTML = `
            <span class="terminal-time">${log.time}</span>
            <span class="terminal-level ${log.level}">[${log.level.toUpperCase()}]</span>
            <span>${log.message}</span>
          `;
          terminal.appendChild(line);
        });
      }
    });
  }
});
