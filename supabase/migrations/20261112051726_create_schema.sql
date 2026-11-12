create type public.user_role as enum ('admin', 'student');
create type public.app_locale as enum ('en', 'si');
create type public.discount_type as enum ('none', 'half', 'free', 'custom');
create type public.attendance_status as enum ('present', 'absent', 'late');
create type public.payment_method as enum ('cash', 'bank_transfer');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete restrict,
  role public.user_role not null default 'student',
  full_name text not null,
  locale public.app_locale not null default 'en',
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete restrict,
  admission_no text not null unique,
  full_name text not null,
  grade smallint not null check (grade between 1 and 13),
  phone text,
  parent_name text,
  parent_phone text,
  joined_on date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint students_has_contact check (phone is not null or parent_phone is not null)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  grade smallint not null check (grade between 1 and 13),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  monthly_fee numeric(10, 2) not null check (monthly_fee > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint classes_time_order check (end_time > start_time)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete restrict,
  class_id uuid not null references public.classes (id) on delete restrict,
  discount_type public.discount_type not null default 'none',
  discount_percent smallint not null default 0 check (discount_percent between 0 and 100),
  enrolled_on date not null,
  ended_on date,
  created_at timestamptz not null default now(),
  unique (student_id, class_id),
  constraint enrollments_discount_match check (
    (discount_type = 'none' and discount_percent = 0)
    or (discount_type = 'half' and discount_percent = 50)
    or (discount_type = 'free' and discount_percent = 100)
    or (discount_type = 'custom' and discount_percent between 1 and 99)
  ),
  constraint enrollments_date_order check (ended_on is null or ended_on >= enrolled_on)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete restrict,
  student_id uuid not null references public.students (id) on delete restrict,
  session_date date not null,
  status public.attendance_status not null,
  created_at timestamptz not null default now(),
  unique (class_id, student_id, session_date)
);

create table public.dues (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete restrict,
  month date not null check (extract(day from month) = 1),
  amount_due numeric(10, 2) not null check (amount_due >= 0),
  created_at timestamptz not null default now(),
  unique (enrollment_id, month)
);

create sequence public.receipt_no_seq;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  due_id uuid not null references public.dues (id) on delete restrict,
  amount numeric(10, 2) not null check (amount > 0),
  paid_on date not null,
  method public.payment_method not null default 'cash',
  receipt_no text not null unique
    default ('RC-' || lpad(nextval('public.receipt_no_seq')::text, 6, '0')),
  voided_at timestamptz,
  created_at timestamptz not null default now()
);

alter sequence public.receipt_no_seq owned by public.payments.receipt_no;

create index enrollments_class_id_idx on public.enrollments (class_id);
create index attendance_student_id_idx on public.attendance (student_id);
create index dues_month_idx on public.dues (month);
create index payments_due_id_idx on public.payments (due_id);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance enable row level security;
alter table public.dues enable row level security;
alter table public.payments enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on sequence public.receipt_no_seq from anon, authenticated;

alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on sequence public.receipt_no_seq to authenticated;

grant all on all tables in schema public to service_role;
grant usage on sequence public.receipt_no_seq to service_role;