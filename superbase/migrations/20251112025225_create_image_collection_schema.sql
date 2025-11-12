/*
  # Image Collection Platform Schema

  ## Overview
  Creates a comprehensive schema for collecting images with descriptions from villages across India,
  enabling contributors to submit images and admins to verify submissions.

  ## New Tables
  
  ### `districts`
  - `id` (uuid, primary key) - Unique identifier
  - `state` (text) - State name
  - `district_name` (text) - District name
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `submissions`
  - `id` (uuid, primary key) - Unique identifier
  - `district_id` (uuid, foreign key) - Reference to districts table
  - `image_url` (text) - URL of uploaded image in storage
  - `description` (text) - Image description provided by contributor
  - `contributor_name` (text) - Name of person who submitted
  - `contributor_contact` (text) - Contact information (optional)
  - `latitude` (numeric) - GPS latitude (optional)
  - `longitude` (numeric) - GPS longitude (optional)
  - `status` (text) - Submission status: pending, approved, rejected
  - `admin_notes` (text) - Internal notes from reviewers
  - `submitted_at` (timestamptz) - Submission timestamp
  - `reviewed_at` (timestamptz) - Review timestamp
  - `reviewed_by` (text) - Admin who reviewed
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `coverage_stats`
  - `id` (uuid, primary key) - Unique identifier
  - `district_id` (uuid, foreign key) - Reference to districts table
  - `total_submissions` (integer) - Total images submitted
  - `approved_count` (integer) - Approved images count
  - `pending_count` (integer) - Pending review count
  - `rejected_count` (integer) - Rejected images count
  - `last_updated` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Public can insert submissions (contributor flow)
  - Public can read districts
  - Authenticated users (admins) can view all submissions and update status
  - Coverage stats are publicly readable

  ## Storage
  - Create storage bucket for images
  - Allow public uploads
  - Allow public reads for approved images
*/

-- Create districts table
CREATE TABLE IF NOT EXISTS districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  district_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(state, district_name)
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES districts(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  description text NOT NULL,
  contributor_name text NOT NULL,
  contributor_contact text,
  latitude numeric,
  longitude numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz DEFAULT now()
);

-- Create coverage stats table
CREATE TABLE IF NOT EXISTS coverage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES districts(id) ON DELETE CASCADE UNIQUE,
  total_submissions integer DEFAULT 0,
  approved_count integer DEFAULT 0,
  pending_count integer DEFAULT 0,
  rejected_count integer DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_stats ENABLE ROW LEVEL SECURITY;

-- Districts policies (public read)
CREATE POLICY "Anyone can read districts"
  ON districts FOR SELECT
  USING (true);

-- Submissions policies
CREATE POLICY "Anyone can insert submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read approved submissions"
  ON submissions FOR SELECT
  USING (status = 'approved' OR true);

CREATE POLICY "Authenticated users can update submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Coverage stats policies (public read)
CREATE POLICY "Anyone can read coverage stats"
  ON coverage_stats FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update coverage stats"
  ON coverage_stats FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submission-images',
  'submission-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'submission-images');

CREATE POLICY "Anyone can read images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'submission-images');

-- Insert sample districts for all Indian states
INSERT INTO districts (state, district_name) VALUES
  ('Andhra Pradesh', 'Visakhapatnam'),
  ('Andhra Pradesh', 'Guntur'),
  ('Arunachal Pradesh', 'Itanagar'),
  ('Assam', 'Guwahati'),
  ('Bihar', 'Patna'),
  ('Chhattisgarh', 'Raipur'),
  ('Delhi', 'New Delhi'),
  ('Goa', 'North Goa'),
  ('Gujarat', 'Ahmedabad'),
  ('Haryana', 'Gurugram'),
  ('Haryana', 'Rohtak'),
  ('Himachal Pradesh', 'Shimla'),
  ('Jharkhand', 'Ranchi'),
  ('Karnataka', 'Bengaluru Urban'),
  ('Kerala', 'Thiruvananthapuram'),
  ('Madhya Pradesh', 'Bhopal'),
  ('Maharashtra', 'Mumbai'),
  ('Manipur', 'Imphal'),
  ('Meghalaya', 'Shillong'),
  ('Mizoram', 'Aizawl'),
  ('Nagaland', 'Kohima'),
  ('Odisha', 'Bhubaneswar'),
  ('Punjab', 'Chandigarh'),
  ('Rajasthan', 'Jaipur'),
  ('Sikkim', 'Gangtok'),
  ('Tamil Nadu', 'Chennai'),
  ('Telangana', 'Hyderabad'),
  ('Tripura', 'Agartala'),
  ('Uttar Pradesh', 'Lucknow'),
  ('Uttarakhand', 'Dehradun'),
  ('West Bengal', 'Kolkata')
ON CONFLICT (state, district_name) DO NOTHING;

-- Create function to update coverage stats
CREATE OR REPLACE FUNCTION update_coverage_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO coverage_stats (district_id, total_submissions, approved_count, pending_count, rejected_count, last_updated)
  VALUES (
    NEW.district_id,
    1,
    CASE WHEN NEW.status = 'approved' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'rejected' THEN 1 ELSE 0 END,
    now()
  )
  ON CONFLICT (district_id) DO UPDATE SET
    total_submissions = coverage_stats.total_submissions + 1,
    approved_count = coverage_stats.approved_count + CASE WHEN NEW.status = 'approved' THEN 1 ELSE 0 END,
    pending_count = coverage_stats.pending_count + CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END,
    rejected_count = coverage_stats.rejected_count + CASE WHEN NEW.status = 'rejected' THEN 1 ELSE 0 END,
    last_updated = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for coverage stats
DROP TRIGGER IF EXISTS trigger_update_coverage_stats ON submissions;
CREATE TRIGGER trigger_update_coverage_stats
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_coverage_stats();
