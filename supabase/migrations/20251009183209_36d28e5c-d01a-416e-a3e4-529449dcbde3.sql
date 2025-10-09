-- Update Juan Cova's role to admin
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = 'a540474a-23f6-44e5-9289-f3fa970b0854' AND role = 'user';