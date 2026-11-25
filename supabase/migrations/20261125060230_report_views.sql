create view public.monthly_income
with (security_invoker = true)
as
select
  date_trunc('month', p.paid_on)::date as month,
  sum(p.amount)::numeric(12, 2) as collected,
  count(*)::integer as payment_count
from public.payments p
where p.voided_at is null
group by 1;

create view public.class_attendance_rates
with (security_invoker = true)
as
select
  c.id as class_id,
  c.subject,
  c.grade,
  c.is_active,
  count(a.status) filter (where a.status in ('present', 'late'))::integer as attended,
  count(a.status)::integer as marked,
  round(
    count(a.status) filter (where a.status in ('present', 'late'))::numeric
      / nullif(count(a.status), 0),
    4
  ) as rate
from public.classes c
left join public.attendance a on a.class_id = c.id
group by c.id;

revoke all on public.monthly_income from anon, authenticated;
revoke all on public.class_attendance_rates from anon, authenticated;
grant select on public.monthly_income to authenticated;
grant select on public.class_attendance_rates to authenticated;
