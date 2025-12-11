--Add columns for real - time traffic tracking
ALTER TABLE tunnels 
ADD COLUMN IF NOT EXISTS total_requests BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS bandwidth_bytes BIGINT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

--Create a function to increment stats safely(atomic increment)
CREATE OR REPLACE FUNCTION increment_tunnel_stats(
    row_id UUID,
    requests_added INT,
    bytes_added INT
)
RETURNS VOID AS $$
BEGIN
    UPDATE tunnels
SET
total_requests = total_requests + requests_added,
    bandwidth_bytes = bandwidth_bytes + bytes_added,
    last_active_at = NOW()
    WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
