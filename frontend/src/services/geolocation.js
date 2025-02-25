// Cache for storing geolocation results
const geoCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getUserLocation() {
    // Check cache first
    const cachedResult = getCachedLocation();
    if (cachedResult) return cachedResult;

    // Set a global timeout for all geolocation attempts
    const globalTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Global timeout')), 10000); // 10 seconds total timeout
    });

    try {
        // Race between geolocation attempts and global timeout
        const result = await Promise.race([
            tryGeolocationServices(),
            globalTimeout
        ]);
        cacheLocation(result);
        return result;
    } catch (error) {
        console.error('Geolocation failed:', error);
        return getDefaultLocation();
    }
}

async function tryGeolocationServices() {
    // Try all services in parallel to speed up the process
    try {
        const result = await Promise.any([
            tryIpapiCo(),
            tryIpapiCom(),
            tryIpApi()
        ]);
        return result;
    } catch (error) {
        throw new Error('All geolocation services failed');
    }
}

async function tryIpapiCo() {
    const response = await fetchWithRetry('https://ipapi.co/json/', {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'BTMCoin/1.0'
        }
    });

    const data = await response.json();
    validateResponse(data);

    return {
        countryCode: data.country_code,
        flag: getCountryFlag(data.country_code),
        ip: data.ip
    };
}

async function tryIpapiCom() {
    const response = await fetchWithRetry('https://api.ipapi.com/check?access_key=YOUR_API_KEY');
    const data = await response.json();
    validateResponse(data);

    return {
        countryCode: data.country_code,
        flag: getCountryFlag(data.country_code),
        ip: data.ip
    };
}

async function tryIpApi() {
    const response = await fetchWithRetry('http://ip-api.com/json/');
    const data = await response.json();

    if (data.status !== 'success') {
        throw new Error('IP-API request failed');
    }

    return {
        countryCode: data.countryCode,
        flag: getCountryFlag(data.countryCode),
        ip: data.query
    };
}

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;
    const timeout = 5000; // 5 seconds timeout

    for (let i = 0; i < maxRetries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status === 429) {
                throw new Error('Rate limit exceeded');
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            lastError = error;
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    }
    throw lastError;
}

function validateResponse(data) {
    if (data.error) {
        throw new Error(data.reason || 'API Error');
    }
    if (!data.country_code || typeof data.country_code !== 'string' || data.country_code.length !== 2) {
        throw new Error('Invalid country code received');
    }
}

function getCachedLocation() {
    const cached = geoCache.get('location');
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function cacheLocation(data) {
    geoCache.set('location', {
        data,
        timestamp: Date.now()
    });
}

function getDefaultLocation() {
    // Use United States as default when location detection fails
    return {
        countryCode: 'US',  // US for United States
        flag: getCountryFlag('US'),  // Get the US flag using our flag generator
        ip: '0.0.0.0',
        isDefault: true     // Flag to identify default location users
    };
}

function getCountryFlag(countryCode) {
    try {
        if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
            throw new Error('Invalid country code')
        }
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt())
        return String.fromCodePoint(...codePoints)
    } catch (error) {
        console.error('Error generating country flag:', error)
        return '🏳️' // Return a neutral flag in case of error
    }
}