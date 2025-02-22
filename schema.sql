    -- Create the country_clicks table if it doesn't exist
    CREATE TABLE IF NOT EXISTS country_clicks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        country_code TEXT NOT NULL,
        flag TEXT NOT NULL,
        score BIGINT DEFAULT 0,
        pps DECIMAL(10, 8) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );

    -- Create the global_clicks table
    CREATE TABLE IF NOT EXISTS global_clicks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        total_score BIGINT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );

    -- Insert initial global clicks record if not exists
    INSERT INTO global_clicks (total_score)
    SELECT 0
    WHERE NOT EXISTS (SELECT 1 FROM global_clicks);

    -- Create unique constraint on country_code
    ALTER TABLE country_clicks ADD CONSTRAINT unique_country_code UNIQUE (country_code);

    -- Create indexes for better query performance
    CREATE INDEX idx_country_clicks_score ON country_clicks(score DESC);
    CREATE INDEX idx_country_clicks_country_code ON country_clicks(country_code);

    -- Create a function to update the updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create triggers to automatically update the updated_at column
    CREATE TRIGGER update_country_clicks_updated_at
        BEFORE UPDATE ON country_clicks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_global_clicks_updated_at
        BEFORE UPDATE ON global_clicks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Create a function to update global clicks when country clicks change
    CREATE OR REPLACE FUNCTION update_global_clicks()
    RETURNS TRIGGER AS $$
    DECLARE
        total_clicks BIGINT;
    BEGIN
        -- Calculate total clicks from all countries
        SELECT COALESCE(SUM(score), 0) INTO total_clicks FROM country_clicks;
        
        -- Update global clicks
        UPDATE global_clicks
        SET total_score = total_clicks;
        
        -- Update pps for all countries
        IF total_clicks > 0 THEN
            UPDATE country_clicks
            SET pps = CAST(score AS DECIMAL) / total_clicks;
        END IF;
        
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    -- Create a trigger to update global clicks when scores change
    CREATE TRIGGER update_global_clicks_after_score_change
        AFTER INSERT OR UPDATE OF score ON country_clicks
        FOR EACH STATEMENT
        EXECUTE FUNCTION update_global_clicks();

    -- Enable Row Level Security and create policies
    ALTER TABLE country_clicks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE global_clicks ENABLE ROW LEVEL SECURITY;

    -- Policies for country_clicks
    CREATE POLICY "Enable read access for all users" ON country_clicks
        FOR SELECT
        TO authenticated, anon
        USING (true);

    CREATE POLICY "Enable insert for authenticated users only" ON country_clicks
        FOR INSERT
        TO authenticated
        WITH CHECK (true);

    CREATE POLICY "Enable update for authenticated users only" ON country_clicks
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);

    -- Policies for global_clicks
    CREATE POLICY "Enable read access for all users" ON global_clicks
        FOR SELECT
        TO authenticated, anon
        USING (true);

    CREATE POLICY "Enable update for authenticated users only" ON global_clicks
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);