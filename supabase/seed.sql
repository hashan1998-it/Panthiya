create temporary table seed_dates as
select
  today,
  date_trunc('month', today)::date as this_month,
  (date_trunc('month', today) - interval '1 month')::date as last_month
from (select (now() at time zone 'Asia/Colombo')::date as today) as t;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  extensions.crypt('Demo-Pass-2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', ''
from (values
  ('00000000-0000-0000-0000-0000000000a1'::uuid, 'admin@panthiya.test'),
  ('00000000-0000-0000-0000-0000000000b1'::uuid, 'nimal@panthiya.test'),
  ('00000000-0000-0000-0000-0000000000c1'::uuid, 'kamal@panthiya.test')
) as u (id, email);

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select id::text, id, jsonb_build_object('sub', id::text, 'email', email), 'email', now(), now(), now()
from auth.users
where email like '%@panthiya.test';

insert into public.profiles (id, role, full_name) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin', 'Demo Admin'),
  ('00000000-0000-0000-0000-0000000000b1', 'student', 'Nimal Perera'),
  ('00000000-0000-0000-0000-0000000000c1', 'student', 'Kamal Silva');

insert into public.students (id, profile_id, admission_no, full_name, grade, phone, parent_name, parent_phone, joined_on, is_active)
select
  md5('student-' || i)::uuid,
  case i when 1 then '00000000-0000-0000-0000-0000000000b1'::uuid
         when 16 then '00000000-0000-0000-0000-0000000000c1'::uuid end,
  'ADM-' || lpad(i::text, 4, '0'),
  case i when 1 then 'Nimal Perera' when 16 then 'Kamal Silva'
    else (array['Sachini','Tharindu','Dilini','Kasun','Hiruni','Ravindu','Nethmi','Chamod','Ishara','Pasindu'])[1 + i % 10]
         || ' ' ||
         (array['Fernando','Jayasinghe','Wickramasinghe','Bandara','Rathnayake','Gunawardena','Herath','Dissanayake'])[1 + i % 8]
  end,
  case when i <= 15 then 10 else 11 end,
  case when i % 4 = 0 then null else '07' || lpad((70000000 + i * 1234)::text, 8, '0') end,
  'Parent of ADM-' || lpad(i::text, 4, '0'),
  '07' || lpad((71000000 + i * 4321)::text, 8, '0'),
  (select last_month from seed_dates) - 30 + (i % 20),
  i <> 30
from generate_series(1, 30) as i;

insert into public.classes (id, subject, grade, day_of_week, start_time, end_time, monthly_fee) values
  (md5('class-1')::uuid, 'Maths',   10, 6, '08:00', '10:00', 2500),
  (md5('class-2')::uuid, 'Science', 10, 0, '08:00', '10:00', 2200),
  (md5('class-3')::uuid, 'English', 10, 3, '15:00', '16:30', 1800),
  (md5('class-4')::uuid, 'Maths',   11, 6, '10:30', '12:30', 2800),
  (md5('class-5')::uuid, 'Science', 11, 0, '10:30', '12:30', 2500),
  (md5('class-6')::uuid, 'ICT',     11, 2, '15:00', '17:00', 2000);

insert into public.enrollments (student_id, class_id, discount_type, discount_percent, enrolled_on, ended_on)
select
  md5('student-' || s.i)::uuid,
  md5('class-' || c.n)::uuid,
  d.discount_type::public.discount_type,
  d.discount_percent,
  (select last_month from seed_dates),
  case when s.i = 5 and c.n = 3 then (select this_month from seed_dates) - 1 end
from generate_series(1, 30) as s (i)
cross join lateral (
  select n from unnest(case when s.i <= 15 then array[1, 2, 3] else array[4, 5, 6] end) as n
) as c
cross join lateral (
  select
    case when s.i % 10 = 0 then 'free' when s.i % 7 = 0 then 'half' when s.i % 9 = 0 then 'custom' else 'none' end as discount_type,
    case when s.i % 10 = 0 then 100 when s.i % 7 = 0 then 50 when s.i % 9 = 0 then 20 else 0 end as discount_percent
) as d
where c.n in (1, 2, 4, 5) or s.i % 3 = 0 or (s.i = 5 and c.n = 3);

insert into public.attendance (class_id, student_id, session_date, status)
select
  e.class_id, e.student_id, day::date,
  case abs(hashtext(e.student_id::text || day::date::text)) % 10
    when 0 then 'absent' when 1 then 'late' else 'present'
  end::public.attendance_status
from public.enrollments e
join public.classes c on c.id = e.class_id
cross join generate_series(
  (select last_month from seed_dates),
  (select today from seed_dates) - 1,
  interval '1 day'
) as day
where extract(dow from day) = c.day_of_week
  and day::date >= e.enrolled_on
  and (e.ended_on is null or day::date <= e.ended_on);

insert into public.dues (enrollment_id, month, amount_due)
select e.id, m.month, round(c.monthly_fee * (100 - e.discount_percent) / 100, 2)
from public.enrollments e
join public.classes c on c.id = e.class_id
cross join (select last_month as month from seed_dates union all select this_month from seed_dates) as m
where e.ended_on is null or e.ended_on >= m.month;

insert into public.payments (due_id, amount, paid_on, method)
select
  d.id,
  case when s.admission_no = 'ADM-0003' then round(d.amount_due / 2, 2) else d.amount_due end,
  least(d.month + (s.grade + 3), (select today from seed_dates)),
  case when right(s.admission_no, 1) in ('2', '5', '8') then 'bank_transfer' else 'cash' end::public.payment_method
from public.dues d
join public.enrollments e on e.id = d.enrollment_id
join public.students s on s.id = e.student_id
where d.amount_due > 0
  and (
    (d.month = (select last_month from seed_dates) and right(s.admission_no, 2)::int % 8 <> 0)
    or (d.month = (select this_month from seed_dates) and right(s.admission_no, 2)::int % 2 = 1)
  )
order by s.admission_no, d.month, e.class_id;

drop table seed_dates;
