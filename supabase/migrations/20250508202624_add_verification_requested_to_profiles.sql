-- add_verification_requested_to_profiles.sql

alter table public.profiles
add column verification_requested boolean default false not null;
