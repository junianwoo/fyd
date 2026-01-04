-- Create enum for doctor accepting status
CREATE TYPE public.accepting_status AS ENUM ('accepting', 'not_accepting', 'waitlist', 'unknown');

-- Create enum for status verification source
CREATE TYPE public.verification_source AS ENUM ('doctor', 'community');

-- Create enum for user subscription status
CREATE TYPE public.user_status AS ENUM ('free', 'alert_service', 'assisted_access');

-- Create doctors table
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    clinic_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL DEFAULT 'ON',
    postal_code TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    accepting_status accepting_status NOT NULL DEFAULT 'unknown',
    status_last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status_verified_by verification_source DEFAULT 'community',
    profile_last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    languages TEXT[] DEFAULT ARRAY['English']::TEXT[],
    accessibility_features TEXT[] DEFAULT ARRAY[]::TEXT[],
    age_groups_served TEXT[] DEFAULT ARRAY['Adults']::TEXT[],
    virtual_appointments BOOLEAN DEFAULT false,
    community_report_count INTEGER DEFAULT 0,
    claimed_by_doctor BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    status user_status NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create community_reports table for status updates
CREATE TABLE public.community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    reported_status accepting_status NOT NULL,
    reporter_ip TEXT,
    details TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create alert_settings table for monitoring preferences
CREATE TABLE public.alert_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    city_postal TEXT NOT NULL,
    radius_km INTEGER DEFAULT 25,
    languages TEXT[],
    accessibility_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;

-- Doctors policies (publicly readable)
CREATE POLICY "Doctors are publicly readable"
    ON public.doctors FOR SELECT
    USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Community reports policies (anyone can submit, publicly readable)
CREATE POLICY "Community reports are publicly readable"
    ON public.community_reports FOR SELECT
    USING (true);

CREATE POLICY "Anyone can submit community reports"
    ON public.community_reports FOR INSERT
    WITH CHECK (true);

-- Alert settings policies
CREATE POLICY "Users can view their own alert settings"
    ON public.alert_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alert settings"
    ON public.alert_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert settings"
    ON public.alert_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alert settings"
    ON public.alert_settings FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for doctor searches
CREATE INDEX idx_doctors_city ON public.doctors(city);
CREATE INDEX idx_doctors_postal_code ON public.doctors(postal_code);
CREATE INDEX idx_doctors_accepting_status ON public.doctors(accepting_status);
CREATE INDEX idx_doctors_location ON public.doctors(latitude, longitude);

-- Create index for alert settings
CREATE INDEX idx_alert_settings_user_id ON public.alert_settings(user_id);
CREATE INDEX idx_alert_settings_active ON public.alert_settings(is_active);