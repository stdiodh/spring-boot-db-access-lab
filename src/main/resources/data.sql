UPDATE users
SET auth_provider = 'LOCAL'
WHERE auth_provider = ''
  AND provider_id IS NULL;
