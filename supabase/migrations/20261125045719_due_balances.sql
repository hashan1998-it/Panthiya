create type public.due_status as enum ('paid', 'partial', 'unpaid');

create view public.due_balances
with (security_invoker = true)
as
select
  d.id,
  d.enrollment_id,
  d.month,
  d.amount_due,
  e.class_id,
  e.student_id,
  s.admission_no,
  s.full_name,
  c.subject,
  c.grade,
  p.paid_amount,
  greatest(d.amount_due - p.paid_amount, 0)::numeric(10, 2) as balance,
  case
    when p.paid_amount >= d.amount_due then 'paid'
    when p.paid_amount > 0 then 'partial'
    else 'unpaid'
  end::public.due_status as status
from public.dues d
join public.enrollments e on e.id = d.enrollment_id
join public.students s on s.id = e.student_id
join public.classes c on c.id = e.class_id
cross join lateral (
  select coalesce(sum(pay.amount), 0)::numeric(10, 2) as paid_amount
  from public.payments pay
  where pay.due_id = d.id
    and pay.voided_at is null
) p;

revoke all on public.due_balances from anon, authenticated;
grant select on public.due_balances to authenticated;
