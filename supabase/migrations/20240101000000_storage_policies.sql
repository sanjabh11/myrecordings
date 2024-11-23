-- Enable Row Level Security
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tracks', 'tracks', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access to recordings
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'tracks');

-- Policy for authenticated uploads
CREATE POLICY "Authenticated Users can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'tracks' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for owners to delete their recordings
CREATE POLICY "Users can delete own recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'tracks'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create recordings table if it doesn't exist
CREATE TABLE IF NOT EXISTS recordings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    duration FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_public BOOLEAN DEFAULT true,
    share_token TEXT DEFAULT encode(gen_random_bytes(32), 'hex')
);

-- Policy for public access to recordings
CREATE POLICY "Anyone can view public recordings"
ON recordings FOR SELECT
USING (is_public = true);

-- Policy for owners to manage their recordings
CREATE POLICY "Users can manage own recordings"
ON recordings FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at
CREATE TRIGGER update_recordings_updated_at
    BEFORE UPDATE ON recordings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
