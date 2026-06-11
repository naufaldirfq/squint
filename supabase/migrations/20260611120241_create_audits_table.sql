create table public.audits (
  id text primary key,
  url text not null,
  persona text not null,
  timestamp timestamptz not null default now(),
  screenshot text not null,
  five_second_read text not null,
  scores jsonb not null,
  narration text not null,
  top_fixes jsonb not null
);

-- Enable Row Level Security (RLS)
alter table public.audits enable row level security;

-- Create policies for public access
create policy "Allow public read access"
  on public.audits for select
  using (true);

create policy "Allow public insert access"
  on public.audits for insert
  with check (true);
