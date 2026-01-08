/**
 * Application Parameters - Standalone configuration
 * Replaces Base44-specific parameters with custom app config
 */

const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  if (isNode) {
    return defaultValue;
  }
  const storageKey = `omnimind_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
      }${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    return searchParam;
  }
  if (defaultValue) {
    storage.setItem(storageKey, defaultValue);
    return defaultValue;
  }
  const storedValue = storage.getItem(storageKey);
  if (storedValue) {
    return storedValue;
  }
  return null;
}

const getAppParams = () => {
  // Clear access token if requested
  if (getAppParamValue("clear_access_token") === 'true') {
    storage.removeItem('omnimind_access_token');
    storage.removeItem('auth_token');
  }
  
  return {
    appName: import.meta.env.VITE_APP_NAME || 'OmniMind24',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    appUrl: import.meta.env.VITE_APP_URL || window.location.origin,
    fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
  }
}

export const appParams = {
  ...getAppParams()
}
