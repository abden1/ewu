-- Check enum type names
SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;
