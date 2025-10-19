-- Create function to handle new user in usuarios table
create or replace function public.handle_new_user_usuarios()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (user_id, telefono, plan, usage_count, usage_month)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'telefone', new.phone, ''),
    'free',
    0,
    to_char(now(), 'YYYY-MM')
  );
  return new;
end;
$$;

-- Create trigger to automatically insert into usuarios when user signs up
create trigger on_auth_user_created_usuarios
  after insert on auth.users
  for each row execute procedure public.handle_new_user_usuarios();