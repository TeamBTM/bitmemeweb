const IPIFY_API_KEY = 'at_your_api_key_here' // Replace with your actual ipify API key

export async function getUserLocation() {
    try {
        // First, get the IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        
        // Then, get the location data using the IP
        const geoResponse = await fetch(`https://geo.ipify.org/api/v2/country?apiKey=${IPIFY_API_KEY}&ipAddress=${ipData.ip}`)
        const geoData = await geoResponse.json()
        
        return {
            countryCode: geoData.location.country,
            ip: ipData.ip
        }
    } catch (error) {
        console.error('Error fetching location:', error)
        return null
    }
}