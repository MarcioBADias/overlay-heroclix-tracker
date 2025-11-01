-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create saved_teams table
CREATE TABLE public.saved_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own teams"
ON public.saved_teams FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own teams"
ON public.saved_teams FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own teams"
ON public.saved_teams FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own teams"
ON public.saved_teams FOR DELETE
USING (auth.uid() = user_id);

-- Create saved_units table (for saved teams)
CREATE TABLE public.saved_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.saved_teams(id) ON DELETE CASCADE,
  collection TEXT NOT NULL,
  number TEXT NOT NULL,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  attached_to_id UUID REFERENCES public.saved_units(id) ON DELETE SET NULL,
  attachment_type TEXT CHECK (attachment_type IN ('equipment', 'avatar', 'other')),
  is_sideline BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view units of own teams"
ON public.saved_units FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.saved_teams
    WHERE saved_teams.id = saved_units.team_id
    AND saved_teams.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create units in own teams"
ON public.saved_units FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.saved_teams
    WHERE saved_teams.id = saved_units.team_id
    AND saved_teams.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update units in own teams"
ON public.saved_units FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.saved_teams
    WHERE saved_teams.id = saved_units.team_id
    AND saved_teams.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete units in own teams"
ON public.saved_units FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.saved_teams
    WHERE saved_teams.id = saved_units.team_id
    AND saved_teams.user_id = auth.uid()
  )
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  password_hash TEXT,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  timer_duration INTEGER NOT NULL DEFAULT 3000,
  timer_remaining INTEGER NOT NULL DEFAULT 3000,
  timer_state TEXT NOT NULL DEFAULT 'stopped' CHECK (timer_state IN ('stopped', 'playing', 'paused')),
  timer_last_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public matches"
ON public.matches FOR SELECT
USING (is_public = true OR auth.uid() = host_id);

CREATE POLICY "Authenticated users can create matches"
ON public.matches FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update own matches"
ON public.matches FOR UPDATE
USING (auth.uid() = host_id);

-- Create match_players table
CREATE TABLE public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_slot INTEGER NOT NULL CHECK (player_slot IN (1, 2)),
  player_name TEXT NOT NULL,
  victory_points INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, player_slot),
  UNIQUE(match_id, user_id)
);

ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view players in public matches"
ON public.match_players FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = match_players.match_id
    AND (matches.is_public = true OR matches.host_id = auth.uid())
  )
);

CREATE POLICY "Users can join as players"
ON public.match_players FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can update own data"
ON public.match_players FOR UPDATE
USING (auth.uid() = user_id);

-- Create match_units table
CREATE TABLE public.match_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_slot INTEGER NOT NULL CHECK (player_slot IN (1, 2)),
  collection TEXT NOT NULL,
  number TEXT NOT NULL,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  is_ko BOOLEAN NOT NULL DEFAULT false,
  attached_to_id UUID REFERENCES public.match_units(id) ON DELETE SET NULL,
  attachment_type TEXT CHECK (attachment_type IN ('equipment', 'avatar', 'other')),
  is_sideline BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.match_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view units in public matches"
ON public.match_units FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = match_units.match_id
    AND (matches.is_public = true OR matches.host_id = auth.uid())
  )
);

CREATE POLICY "Players can manage units"
ON public.match_units FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.match_players
    WHERE match_players.match_id = match_units.match_id
    AND match_players.user_id = auth.uid()
  )
);

-- Create match_spectators table
CREATE TABLE public.match_spectators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

ALTER TABLE public.match_spectators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spectators in public matches"
ON public.match_spectators FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = match_spectators.match_id
    AND (matches.is_public = true OR matches.host_id = auth.uid())
  )
);

CREATE POLICY "Users can join as spectators"
ON public.match_spectators FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_units;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_spectators;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();