// ========== API CONFIGURATION ==========
// This file demonstrates how to integrate with a real backend API
// Replace the mock functions with actual API calls when ready

const API_CONFIG = {
  // Base URL for your API
  BASE_URL: process.env.API_URL || 'https://api.externai.com/v1',
  
  // API Key (should be stored securely, not in code)
  API_KEY: process.env.API_KEY || 'your-api-key-here',
  
  // Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    
    // Agents
    AGENTS_LIST: '/agents',
    AGENT_DETAIL: '/agents/:id',
    AGENT_START: '/agents/:id/start',
    AGENT_STOP: '/agents/:id/stop',
    AGENT_STATS: '/agents/:id/stats',
    AGENT_CONFIG: '/agents/:id/config',
    
    // Metrics
    METRICS_OVERVIEW: '/metrics/overview',
    METRICS_REALTIME: '/metrics/realtime',
    METRICS_HISTORY: '/metrics/history',
    
    // Activities
    ACTIVITIES_RECENT: '/activities/recent',
    ACTIVITIES_SEARCH: '/activities/search',
    
    // Indexes
    INDEXES_LIST: '/indexes',
    INDEX_DETAIL: '/indexes/:id',
    INDEX_SYNC: '/indexes/:id/sync',
    INDEX_DELETE: '/indexes/:id',
    
    // Logs
    LOGS_STREAM: '/logs/stream',
    LOGS_SEARCH: '/logs/search',
    LOGS_EXPORT: '/logs/export',
    
    // Billing
    BILLING_USAGE: '/billing/usage',
    BILLING_HISTORY: '/billing/history',
    BILLING_INVOICES: '/billing/invoices/:id',
    
    // Settings
    SETTINGS_GET: '/settings',
    SETTINGS_UPDATE: '/settings',
    
    // WebSocket
    WS_REALTIME: '/ws/realtime'
  },
  
  // Request timeout (ms)
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_MULTIPLIER: 2
  }
};

// ========== API CLIENT CLASS ==========
class ExternAIClient {
  constructor(config = API_CONFIG) {
    this.config = config;
    this.token = null;
    this.ws = null;
  }
  
  // Set authentication token
  setToken(token) {
    this.token = token;
  }
  
  // Build full URL
  buildUrl(endpoint, params = {}) {
    let url = `${this.config.BASE_URL}${endpoint}`;
    
    // Replace URL parameters
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    
    return url;
  }
  
  // Build headers
  buildHeaders(customHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.API_KEY,
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...customHeaders
    };
  }
  
  // Make API request with retry logic
  async request(method, endpoint, options = {}) {
    const { params, data, headers, retry = true } = options;
    const url = this.buildUrl(endpoint, params);
    
    let lastError;
    let attempts = retry ? this.config.RETRY.MAX_ATTEMPTS : 1;
    let delay = this.config.RETRY.DELAY;
    
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await fetch(url, {
          method,
          headers: this.buildHeaders(headers),
          body: data ? JSON.stringify(data) : undefined,
          signal: AbortSignal.timeout(this.config.TIMEOUT)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error;
        
        if (i < attempts - 1) {
          await this.sleep(delay);
          delay *= this.config.RETRY.BACKOFF_MULTIPLIER;
        }
      }
    }
    
    throw lastError;
  }
  
  // Helper sleep function
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // ========== AUTHENTICATION ==========
  async login(username, password) {
    const response = await this.request('POST', this.config.ENDPOINTS.LOGIN, {
      data: { username, password },
      retry: false
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }
  
  async logout() {
    try {
      await this.request('POST', this.config.ENDPOINTS.LOGOUT);
    } finally {
      this.token = null;
      this.disconnect();
    }
  }
  
  async verifyToken() {
    return await this.request('GET', this.config.ENDPOINTS.VERIFY);
  }
  
  // ========== AGENTS ==========
  async getAgents() {
    return await this.request('GET', this.config.ENDPOINTS.AGENTS_LIST);
  }
  
  async getAgent(id) {
    return await this.request('GET', this.config.ENDPOINTS.AGENT_DETAIL, {
      params: { id }
    });
  }
  
  async startAgent(id) {
    return await this.request('POST', this.config.ENDPOINTS.AGENT_START, {
      params: { id }
    });
  }
  
  async stopAgent(id) {
    return await this.request('POST', this.config.ENDPOINTS.AGENT_STOP, {
      params: { id }
    });
  }
  
  async getAgentStats(id, timeRange = '24h') {
    return await this.request('GET', this.config.ENDPOINTS.AGENT_STATS, {
      params: { id },
      data: { timeRange }
    });
  }
  
  async updateAgentConfig(id, config) {
    return await this.request('PUT', this.config.ENDPOINTS.AGENT_CONFIG, {
      params: { id },
      data: config
    });
  }
  
  // ========== METRICS ==========
  async getMetricsOverview() {
    return await this.request('GET', this.config.ENDPOINTS.METRICS_OVERVIEW);
  }
  
  async getRealtimeMetrics() {
    return await this.request('GET', this.config.ENDPOINTS.METRICS_REALTIME);
  }
  
  async getMetricsHistory(timeRange = '24h', interval = '1h') {
    return await this.request('GET', this.config.ENDPOINTS.METRICS_HISTORY, {
      data: { timeRange, interval }
    });
  }
  
  // ========== ACTIVITIES ==========
  async getRecentActivities(limit = 20) {
    return await this.request('GET', this.config.ENDPOINTS.ACTIVITIES_RECENT, {
      data: { limit }
    });
  }
  
  async searchActivities(query, filters = {}) {
    return await this.request('POST', this.config.ENDPOINTS.ACTIVITIES_SEARCH, {
      data: { query, ...filters }
    });
  }
  
  // ========== INDEXES ==========
  async getIndexes() {
    return await this.request('GET', this.config.ENDPOINTS.INDEXES_LIST);
  }
  
  async getIndex(id) {
    return await this.request('GET', this.config.ENDPOINTS.INDEX_DETAIL, {
      params: { id }
    });
  }
  
  async syncIndex(id) {
    return await this.request('POST', this.config.ENDPOINTS.INDEX_SYNC, {
      params: { id }
    });
  }
  
  async deleteIndex(id) {
    return await this.request('DELETE', this.config.ENDPOINTS.INDEX_DELETE, {
      params: { id }
    });
  }
  
  // ========== LOGS ==========
  async streamLogs(callback, filters = {}) {
    // For streaming, you might want to use Server-Sent Events or WebSocket
    const eventSource = new EventSource(
      this.buildUrl(this.config.ENDPOINTS.LOGS_STREAM) + 
      '?' + new URLSearchParams(filters)
    );
    
    eventSource.onmessage = (event) => {
      const log = JSON.parse(event.data);
      callback(log);
    };
    
    eventSource.onerror = (error) => {
      console.error('Log stream error:', error);
      eventSource.close();
    };
    
    return eventSource;
  }
  
  async searchLogs(query, filters = {}) {
    return await this.request('POST', this.config.ENDPOINTS.LOGS_SEARCH, {
      data: { query, ...filters }
    });
  }
  
  async exportLogs(format = 'json', filters = {}) {
    const response = await this.request('POST', this.config.ENDPOINTS.LOGS_EXPORT, {
      data: { format, ...filters }
    });
    
    // Handle file download
    if (response.downloadUrl) {
      window.open(response.downloadUrl, '_blank');
    }
    
    return response;
  }
  
  // ========== BILLING ==========
  async getBillingUsage() {
    return await this.request('GET', this.config.ENDPOINTS.BILLING_USAGE);
  }
  
  async getBillingHistory() {
    return await this.request('GET', this.config.ENDPOINTS.BILLING_HISTORY);
  }
  
  async downloadInvoice(id) {
    const response = await this.request('GET', this.config.ENDPOINTS.BILLING_INVOICES, {
      params: { id }
    });
    
    if (response.downloadUrl) {
      window.open(response.downloadUrl, '_blank');
    }
    
    return response;
  }
  
  // ========== SETTINGS ==========
  async getSettings() {
    return await this.request('GET', this.config.ENDPOINTS.SETTINGS_GET);
  }
  
  async updateSettings(settings) {
    return await this.request('PUT', this.config.ENDPOINTS.SETTINGS_UPDATE, {
      data: settings
    });
  }
  
  // ========== WEBSOCKET ==========
  connect(onMessage, onError) {
    if (this.ws) {
      this.disconnect();
    }
    
    const wsUrl = this.config.BASE_URL.replace('http', 'ws') + 
                  this.config.ENDPOINTS.WS_REALTIME;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      
      // Send authentication
      if (this.token) {
        this.ws.send(JSON.stringify({
          type: 'auth',
          token: this.token
        }));
      }
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.ws = null;
      
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        if (!this.ws) {
          this.connect(onMessage, onError);
        }
      }, 5000);
    };
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  // Send message through WebSocket
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }
}

// ========== USAGE EXAMPLE ==========
/*
// Initialize client
const apiClient = new ExternAIClient();

// Login
async function loginToAPI(username, password) {
  try {
    const response = await apiClient.login(username, password);
    console.log('Login successful:', response);
    
    // Connect to WebSocket for real-time updates
    apiClient.connect(
      (data) => {
        console.log('Real-time update:', data);
        // Handle real-time updates
        handleRealtimeUpdate(data);
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );
    
    // Start fetching data
    await loadDashboardData();
  } catch (error) {
    console.error('Login failed:', error);
    showNotification('Login failed: ' + error.message, 'error');
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Fetch all data in parallel
    const [agents, metrics, activities, indexes] = await Promise.all([
      apiClient.getAgents(),
      apiClient.getMetricsOverview(),
      apiClient.getRecentActivities(),
      apiClient.getIndexes()
    ]);
    
    // Update UI with real data
    updateAgents(agents);
    updateMetrics(metrics);
    updateActivities(activities);
    updateIndexes(indexes);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    showNotification('Failed to load data', 'error');
  }
}

// Handle real-time updates
function handleRealtimeUpdate(data) {
  switch (data.type) {
    case 'agent_status':
      updateAgentStatus(data.agentId, data.status);
      break;
    case 'new_activity':
      addActivity(data.activity);
      break;
    case 'metric_update':
      updateMetric(data.metric, data.value);
      break;
    case 'log_entry':
      addLog(data.level, data.message);
      break;
    default:
      console.log('Unknown update type:', data.type);
  }
}
*/

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, ExternAIClient };
}
