-- Check ALL constraints on events table
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'events'::regclass
AND contype = 'c'  -- check constraints only
ORDER BY conname;
