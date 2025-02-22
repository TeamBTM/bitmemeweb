import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Clicks table operations
export const clicksTable = {
  async incrementCountry(countryCode, flag) {
    const { data: existingCountry } = await supabase
      .from('country_clicks')
      .select('score')
      .eq('country_code', countryCode)
      .single()

    if (existingCountry) {
      return await supabase
        .from('country_clicks')
        .update({ 
          score: existingCountry.score + 1,
          pps: (existingCountry.score + 1) / (await this.getTotalClicks())
        })
        .eq('country_code', countryCode)
    } else {
      return await supabase
        .from('country_clicks')
        .insert([
          { 
            country_code: countryCode,
            flag,
            score: 1,
            pps: 1 / (await this.getTotalClicks() || 1)
          }
        ])
    }
  },

  async getLeaderboard() {
    const { data } = await supabase
      .from('country_clicks')
      .select('*')
      .order('score', { ascending: false })
    
    return data?.map((item, index) => ({
      ...item,
      position: index + 1,
      highlight: false
    })) || []
  },

  async getTotalClicks() {
    const { data } = await supabase
      .from('country_clicks')
      .select('score')
    
    return data?.reduce((sum, item) => sum + item.score, 0) || 0
  },

  subscribeToChanges(callback) {
    return supabase
      .channel('country_clicks_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'country_clicks' },
        callback
      )
      .subscribe()
  }
}