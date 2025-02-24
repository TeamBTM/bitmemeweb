-- Create the country_clicks table to store click counts per country
CREATE TABLE country_clicks (
  country_code TEXT PRIMARY KEY,
  flag TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_country_clicks_updated_at
    BEFORE UPDATE ON country_clicks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create an index on the clicks column for faster sorting
CREATE INDEX country_clicks_clicks_idx ON country_clicks(clicks DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE country_clicks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous users to view all records
CREATE POLICY "Allow anonymous select" ON country_clicks
    FOR SELECT
    TO anon
    USING (true);

-- Create a policy that allows authenticated users to update records
CREATE POLICY "Allow anonymous insert/update" ON country_clicks
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);