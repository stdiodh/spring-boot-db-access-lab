UPDATE users
SET auth_provider = 'LOCAL'
WHERE auth_provider = ''
  AND provider_id IS NULL;

UPDATE users
SET local_password_enabled = TRUE
WHERE auth_provider = 'LOCAL'
  AND local_password_enabled = FALSE;
