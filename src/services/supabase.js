import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const clicksService = {
  async increment(countryCode, flag) {
    try {
      const { data, error } = await supabase
        .from('country_clicks')
        .select('clicks')
        .eq('country_code', countryCode)
        .single()

      const newClicks = (data?.clicks || 0) + 1

      const { error: upsertError } = await supabase
        .from('country_clicks')
        .upsert([
          { country_code: countryCode, flag, clicks: newClicks }
        ], {
          onConflict: 'country_code'
        })

      if (upsertError) throw upsertError
      return { success: true, clicks: newClicks }
    } catch (error) {
      console.error('Error incrementing clicks:', error)
      return { success: false, error: error.message }
    }
  },

  async getTop10() {
    try {
      const { data, error } = await supabase
        .from('country_clicks')
        .select('country_code, flag, clicks')
        .order('clicks', { ascending: false })
        .limit(10)

      if (error) throw error

      return data.map((item, index) => ({
        position: index + 1,
        code: item.country_code,
        flag: item.flag,
        score: item.clicks,
        highlight: false
      }))
    } catch (error) {
      console.error('Error fetching top 10:', error)
      return []
    }
  },

  onUpdate(callback) {
    return supabase
      .channel('clicks_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'country_clicks'
      }, callback)
      .subscribe()
  }
}