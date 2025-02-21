export async function getUserLocation() {
    try {
        // Using ipapi.co which provides geolocation data without requiring an API key
        const response = await fetch('https://ipapi.co/json/')
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        
        if (data.error) {
            console.error('Error from ipapi:', data.reason)
            return null
        }
        
        // Convert country code to flag emoji
        const countryFlag = getCountryFlag(data.country_code)
        
        return {
            countryCode: data.country_code,
            flag: countryFlag,
            ip: data.ip
        }
    } catch (error) {
        console.error('Error fetching location:', error)
        return null
    }
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