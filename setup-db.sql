-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE warmup_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "users_own" ON users;
DROP POLICY IF EXISTS "subs_own" ON subscriptions;
DROP POLICY IF EXISTS "accounts_own" ON email_accounts;
DROP POLICY IF EXISTS "campaigns_own" ON warmup_campaigns;
DROP POLICY IF EXISTS "logs_own" ON email_logs;
DROP POLICY IF EXISTS "reputation_own" ON reputation_snapshots;
DROP POLICY IF EXISTS "domain_own" ON domain_records;
DROP POLICY IF EXISTS "notifs_own" ON notifications;

-- RLS policies (columns are camelCase, auth.uid() is uuid -> cast to text)
CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid()::text = id);
CREATE POLICY "subs_own" ON subscriptions FOR ALL USING (auth.uid()::text = "userId");
CREATE POLICY "accounts_own" ON email_accounts FOR ALL USING (auth.uid()::text = "userId");
CREATE POLICY "campaigns_own" ON warmup_campaigns FOR ALL USING (auth.uid()::text = "userId");
CREATE POLICY "logs_own" ON email_logs FOR ALL USING (
  "campaignId" IN (SELECT id FROM warmup_campaigns WHERE "userId" = auth.uid()::text)
);
CREATE POLICY "reputation_own" ON reputation_snapshots FOR ALL USING (
  "emailAccountId" IN (SELECT id FROM email_accounts WHERE "userId" = auth.uid()::text)
);
CREATE POLICY "domain_own" ON domain_records FOR ALL USING (
  "emailAccountId" IN (SELECT id FROM email_accounts WHERE "userId" = auth.uid()::text)
);
CREATE POLICY "notifs_own" ON notifications FOR ALL USING (auth.uid()::text = "userId");

-- Auth trigger: auto-create user + subscription on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id::text, NEW.email, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (id, "userId", plan, status, "trialEndsAt")
  VALUES (
    gen_random_uuid()::text,
    NEW.id::text,
    'FREE_TRIAL',
    'TRIALING',
    NOW() + INTERVAL '14 days'
  )
  ON CONFLICT ("userId") DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
