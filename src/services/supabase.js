import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const clicksService = {
  _localBuffer: new Map(),
  _flushInterval: null,

  async increment(countryCode, flag) {
    // Optimistic local update
    this._updateLocalBuffer(countryCode, flag);
    this._ensureFlushInterval();

    return { success: true, clicks: this._getLocalClicks(countryCode) };
  },

  _updateLocalBuffer(countryCode, flag) {
    const current = this._localBuffer.get(countryCode) || { count: 0, flag };
    current.count++;
    this._localBuffer.set(countryCode, current);
  },

  _getLocalClicks(countryCode) {
    return (this._localBuffer.get(countryCode)?.count || 0);
  },

  _ensureFlushInterval() {
    if (!this._flushInterval) {
      this._flushInterval = setInterval(() => this._flushBuffer(), 2000);
    }
  },

  async _flushBuffer() {
    if (this._localBuffer.size === 0) return;

    const buffer = new Map(this._localBuffer);
    this._localBuffer.clear();

    try {
      const promises = Array.from(buffer.entries()).map(async ([countryCode, data]) => {
        try {
          const { data: current } = await supabase
            .from('country_clicks')
            .select('clicks')
            .eq('country_code', countryCode)
            .single();

          const newClicks = (current?.clicks || 0) + data.count;

          await supabase
            .from('country_clicks')
            .upsert([{
              country_code: countryCode,
              flag: data.flag,
              clicks: newClicks
            }], {
              onConflict: 'country_code'
            });
        } catch (error) {
          console.error(`Error updating clicks for ${countryCode}:`, error);
          // Restore failed updates back to buffer
          const existing = this._localBuffer.get(countryCode) || { count: 0, flag: data.flag };
          existing.count += data.count;
          this._localBuffer.set(countryCode, existing);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error in flush operation:', error);
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

  async getTotalClicks() {
    try {
      const { data, error } = await supabase
        .from('country_clicks')
        .select('clicks')

      if (error) throw error

      return data.reduce((total, item) => total + item.clicks, 0)
    } catch (error) {
      console.error('Error fetching total clicks:', error)
      return 0
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