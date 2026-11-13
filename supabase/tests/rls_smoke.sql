begin;

-- Test users (auth accounts, profiles, students)
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin@test.local'),
  ('00000000-0000-0000-0000-0000000000b1', 'nimal@test.local'),
  ('00000000-0000-0000-0000-0000000000c1', 'kamal@test.local');

insert into public.profiles (id, role, full_name) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin', 'Admin'),
  ('00000000-0000-0000-0000-0000000000b1', 'student', 'Nimal'),
  ('00000000-0000-0000-0000-0000000000c1', 'student', 'Kamal');

insert into public.students (profile_id, admission_no, full_name, grade, phone, joined_on) values
  ('00000000-0000-0000-0000-0000000000b1', 'ADM-1', 'Nimal', 10, '0770000001', '2026-11-01'),
  ('00000000-0000-0000-0000-0000000000c1', 'ADM-2', 'Kamal', 10, '0770000002', '2026-11-01');

-- Nimal is in Maths, Kamal is in Science
insert into public.classes (subject, grade, day_of_week, start_time, end_time, monthly_fee) values
  ('Maths', 10, 6, '08:00', '10:00', 2500),
  ('Science', 10, 0, '08:00', '10:00', 2000);

insert into public.enrollments (student_id, class_id, enrolled_on)
select s.id, c.id, '2026-11-01' from public.students s, public.classes c
where (s.admission_no = 'ADM-1' and c.subject = 'Maths')
   or (s.admission_no = 'ADM-2' and c.subject = 'Science');

insert into public.dues (enrollment_id, month, amount_due)
select id, '2026-11-01', 2500 from public.enrollments;

insert into public.payments (due_id, amount, paid_on)
select id, 1000, '2026-11-05' from public.dues;

-- 1. Act as Nimal (student)
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}';

select 'nimal sees students: ' || string_agg(full_name, ',') from public.students;  -- Nimal
select 'nimal sees classes: ' || string_agg(subject, ',') from public.classes;      -- Maths
select 'nimal sees dues: ' || count(*) from public.dues;                            -- 1
select 'nimal sees payments: ' || count(*) from public.payments;                    -- 1

with u as (update public.students set full_name = 'Hacked' returning 1)
select 'nimal updated students: ' || count(*) from u;                               -- 0

with u as (update public.profiles set locale = 'si'
           where id = '00000000-0000-0000-0000-0000000000b1' returning 1)
select 'nimal updated own locale: ' || count(*) from u;                             -- 1

-- 2. Act as admin
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select 'admin sees students: ' || count(*) from public.students;                    -- 2
select 'admin sees payments: ' || count(*) from public.payments;                    -- 2

rollback;