import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export const clicksTable = {
  async incrementCountry(countryCode, flag) {
    const { data, error } = await supabase
      .from('country_clicks')
      .upsert([
        {
          country_code: countryCode,
          flag,
          clicks: 1
        }
      ], {
        onConflict: 'country_code',
        count: 'exact'
      })
    return { data, error }
  },

  async getLeaderboard() {
    const { data, error } = await supabase
      .from('country_clicks')
      .select('country_code, flag, clicks')
      .order('clicks', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }

    return data.map((item, index) => ({
      position: index + 1,
      code: item.country_code,
      flag: item.flag,
      score: item.clicks
    }))
  },

  async getTotalClicks() {
    const { data, error } = await supabase
      .from('country_clicks')
      .select('clicks')
      .execute()

    if (error) {
      console.error('Error fetching total clicks:', error)
      return 0
    }

    return data.reduce((sum, item) => sum + item.clicks, 0)
  },

  subscribeToChanges(callback) {
    return supabase
      .channel('country_clicks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'country_clicks'
      }, callback)
      .subscribe()
  }
}