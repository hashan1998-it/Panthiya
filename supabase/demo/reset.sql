truncate
  public.payments,
  public.dues,
  public.attendance,
  public.enrollments,
  public.students,
  public.classes
restart identity;

with removed as (
  delete from public.profiles
  where role = 'student' or id in (select id from auth.users where email like '%@panthiya.test')
  returning id
)
delete from auth.users
where id in (select id from removed) or email like '%@panthiya.test';
