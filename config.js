// API Configuration for CHIETA Mobile App
const API_CONFIG = {
  // Production - Your deployed backend on Render
  PRODUCTION: {
    BASE_URL: "https://mobile-app-api-p2o5.onrender.com",
    NAME: "Production"
  },
  
  // Development - Local backend
  DEVELOPMENT: {
    BASE_URL: "http://localhost:5000", 
    NAME: "Development"
  },
  
  // Staging/Testing environment
  STAGING: {
    BASE_URL: "https://mobile-app-api-p2o5.onrender.com",
    NAME: "Staging"
  },
  
  // Common endpoints for all environments
  ENDPOINTS: {
    // Authentication
    LOGIN: "/login",
    HEALTH: "/health",
    USER: "/user/:email",
    
    // Student/SSDD Endpoints
    STUDENTS: "/students/:email",
    STUDENT_STATUS: "/student-status/:email",
    DOCUMENTS: "/documents/:email",
    
    // GM Dashboard Endpoints
    SUMMARY_STATS: "/summary-stats/:email",
    PROGRAM_BREAKDOWN: "/program-breakdown/:email",
    CONTRACT_DETAILS: "/contract-details/:email",
    GM_DASHBOARD: "/gm-dashboard/:email",
    ORGANISATION_PROFILE: "/organisation-profile/:email",
    
    // IM Dashboard Endpoints  
    MG_STATUS: "/mg-status",
    DG_STATUS: "/dg-status",
    ORGANISATION_APPLICATIONS: "/organisation-applications/:email",
    MG_APPLICATIONS_DETAILS: "/mg-applications-details/:sdlNo",
    DG_APPLICATIONS_DETAILS: "/dg-applications-details/:sdlNo",
    DOWNLOAD_DOCUMENT: "/download-document/:applicationNumber/:documentType",
    
    // Documents
    DOCUMENTS_STATS: "/documents-stats/:email",
    
    // Legacy endpoints (keep for compatibility)
    ORGANISATION_CONTRACTS: "/organisation-contracts",
    
    // New endpoints for application details
    MG_APPLICATION_DETAIL: "/mg-application-detail/:applicationNumber",
    DG_APPLICATION_DETAIL: "/dg-application-detail/:applicationNumber",
    ORG_DETAIL: "/organisation-detail/:sdlNo",
    
    // Document download endpoints
    DOCUMENT_DOWNLOAD: "/download-document/:applicationNumber/:documentType",
    DIRECT_DOWNLOAD: "/download/document/:filename"
  },
  
  // API Timeout settings
  TIMEOUT: {
    DEFAULT: 15000, // 15 seconds
    UPLOAD: 30000,  // 30 seconds for file uploads
    HEALTH_CHECK: 10000 // 10 seconds for health checks
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
    BACKOFF_MULTIPLIER: 2
  }
};

// Environment detection
const getEnvironment = () => {
  if (__DEV__) {
    return 'DEVELOPMENT';
  }
  
  // You can add more environment detection logic here
  // For React Native, you might use:
  // - __DEV__ for development
  // - Process.env.NODE_ENV if using metro config
  // - App specific logic
  
  return 'PRODUCTION';
};

// Get the appropriate base URL based on environment.
// An explicit EXPO_PUBLIC_API_URL always wins — this is how deploys, staging,
// and CI/E2E point the app at a chosen backend without code changes (and is the
// single place all API calls should resolve their host from).
const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log(`🔗 API Base URL (env override): ${process.env.EXPO_PUBLIC_API_URL}`);
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const environment = getEnvironment();
  const config = API_CONFIG[environment] || API_CONFIG.PRODUCTION;

  console.log(`🌍 Environment: ${config.NAME}`);
  console.log(`🔗 API Base URL: ${config.BASE_URL}`);

  return config.BASE_URL;
};

// Build complete URL for an endpoint
const buildURL = (endpoint, params = {}) => {
  const baseURL = getBaseURL();
  let url = endpoint;
  
  // Replace parameters in the endpoint
  Object.keys(params).forEach(key => {
    const paramPlaceholder = `:${key}`;
    if (url.includes(paramPlaceholder)) {
      url = url.replace(paramPlaceholder, encodeURIComponent(params[key]));
    }
  });
  
  // Add timestamp to avoid caching issues
  const separator = url.includes('?') ? '&' : '?';
  const finalURL = `${baseURL}${url}${separator}_t=${Date.now()}`;
  
  console.log(`🔗 Built URL: ${finalURL}`);
  return finalURL;
};

// Main configuration function
const getConfig = () => {
  const baseURL = getBaseURL();
  
  return {
    ...API_CONFIG,
    BASE_URL: baseURL,
    ENVIRONMENT: getEnvironment(),
    
    // Helper methods
    buildURL,
    getEnvironment,
    
    // Specific endpoint builders
    buildLoginURL: () => buildURL(API_CONFIG.ENDPOINTS.LOGIN),
    buildHealthURL: () => buildURL(API_CONFIG.ENDPOINTS.HEALTH),
    buildUserURL: (email) => buildURL(API_CONFIG.ENDPOINTS.USER, { email }),
    buildStudentsURL: (email) => buildURL(API_CONFIG.ENDPOINTS.STUDENTS, { email }),
    buildStudentStatusURL: (email) => buildURL(API_CONFIG.ENDPOINTS.STUDENT_STATUS, { email }),
    buildDocumentsURL: (email) => buildURL(API_CONFIG.ENDPOINTS.DOCUMENTS, { email }),
    buildSummaryStatsURL: (email) => buildURL(API_CONFIG.ENDPOINTS.SUMMARY_STATS, { email }),
    buildProgramBreakdownURL: (email) => buildURL(API_CONFIG.ENDPOINTS.PROGRAM_BREAKDOWN, { email }),
    buildContractDetailsURL: (email) => buildURL(API_CONFIG.ENDPOINTS.CONTRACT_DETAILS, { email }),
    buildGMDashboardURL: (email) => buildURL(API_CONFIG.ENDPOINTS.GM_DASHBOARD, { email }),
    buildOrganisationProfileURL: (email) => buildURL(API_CONFIG.ENDPOINTS.ORGANISATION_PROFILE, { email }),
    
    // IM Dashboard endpoint builders
    buildMGStatusURL: () => buildURL(API_CONFIG.ENDPOINTS.MG_STATUS),
    buildDGStatusURL: () => buildURL(API_CONFIG.ENDPOINTS.DG_STATUS),
    buildOrganisationApplicationsURL: (email) => buildURL(API_CONFIG.ENDPOINTS.ORGANISATION_APPLICATIONS, { email }),
    buildMGApplicationsDetailsURL: (sdlNo) => buildURL(API_CONFIG.ENDPOINTS.MG_APPLICATIONS_DETAILS, { sdlNo }),
    buildDGApplicationsDetailsURL: (sdlNo) => buildURL(API_CONFIG.ENDPOINTS.DG_APPLICATIONS_DETAILS, { sdlNo }),
    buildDownloadDocumentURL: (applicationNumber, documentType) => 
      buildURL(API_CONFIG.ENDPOINTS.DOWNLOAD_DOCUMENT, { applicationNumber, documentType }),
    
    // Documents
    buildDocumentsStatsURL: (email) => buildURL(API_CONFIG.ENDPOINTS.DOCUMENTS_STATS, { email }),
    
    // Legacy endpoints for compatibility
    buildOrganisationsURL: (email) => buildURL(API_CONFIG.ENDPOINTS.ORGANISATION_APPLICATIONS, { email }),
    
    // New builders for application details
    buildMGApplicationDetailURL: (applicationNumber) => 
      buildURL(API_CONFIG.ENDPOINTS.MG_APPLICATION_DETAIL, { applicationNumber }),
    buildDGApplicationDetailURL: (applicationNumber) => 
      buildURL(API_CONFIG.ENDPOINTS.DG_APPLICATION_DETAIL, { applicationNumber }),
    buildOrgDetailURL: (sdlNo) => 
      buildURL(API_CONFIG.ENDPOINTS.ORG_DETAIL, { sdlNo }),
    
    // Enhanced download builders
    buildDownloadDocumentURL: (applicationNumber, documentType) => 
      buildURL(API_CONFIG.ENDPOINTS.DOCUMENT_DOWNLOAD, { applicationNumber, documentType }),
    buildDirectDownloadURL: (filename) => 
      buildURL(API_CONFIG.ENDPOINTS.DIRECT_DOWNLOAD, { filename })
  };
};

// Export both the config function and individual endpoints for direct access
export const ENDPOINTS = API_CONFIG.ENDPOINTS;
export const TIMEOUT = API_CONFIG.TIMEOUT;
export const RETRY = API_CONFIG.RETRY;

export default getConfig;