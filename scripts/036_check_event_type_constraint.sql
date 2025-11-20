-- Check the current constraint on events table for event_type
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'events'::regclass
AND conname LIKE '%event_type%';
