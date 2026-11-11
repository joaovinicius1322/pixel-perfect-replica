-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Resumes
CREATE TABLE public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  extracted_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX resumes_user_idx ON public.resumes(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own resumes select" ON public.resumes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own resumes insert" ON public.resumes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own resumes update" ON public.resumes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own resumes delete" ON public.resumes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Analyses
CREATE TABLE public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  resume_id uuid REFERENCES public.resumes(id) ON DELETE SET NULL,
  job_title text NOT NULL DEFAULT 'Vaga sem título',
  company text,
  job_description text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  score integer,
  keyword_score integer,
  skills_score integer,
  experience_score integer,
  education_score integer,
  summary text,
  matched_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  details jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  optimization jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analyses_user_idx ON public.analyses(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analyses TO authenticated;
GRANT ALL ON public.analyses TO service_role;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own analyses select" ON public.analyses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own analyses insert" ON public.analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own analyses update" ON public.analyses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own analyses delete" ON public.analyses FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER analyses_touch BEFORE UPDATE ON public.analyses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage policies for private resumes bucket
CREATE POLICY "Own resume files read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own resume files insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Own resume files delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);