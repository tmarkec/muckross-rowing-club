UPDATE auth.users
SET encrypted_password = crypt('TempPass123!', gen_salt('bf'))
WHERE email = 'totmarko1@yahoo.com';