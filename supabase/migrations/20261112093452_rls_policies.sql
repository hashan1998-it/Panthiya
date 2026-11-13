create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.students
  where profile_id = (select auth.uid());
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.current_student_id() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_student_id() to authenticated;

create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from authenticated;
grant update (locale) on public.profiles to authenticated;

create policy "students: admin full access" on public.students
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "students: student reads own" on public.students
  for select to authenticated
  using (id = (select public.current_student_id()));

  create policy "enrollments: admin full access" on public.enrollments
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "enrollments: student reads own" on public.enrollments
  for select to authenticated
  using (student_id = (select public.current_student_id()));

create policy "attendance: admin full access" on public.attendance
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "attendance: student reads own" on public.attendance
  for select to authenticated
  using (student_id = (select public.current_student_id()));

  create policy "classes: admin full access" on public.classes
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "classes: student reads enrolled" on public.classes
  for select to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.class_id = classes.id
        and e.student_id = (select public.current_student_id())
    )
  );

  create policy "dues: admin full access" on public.dues
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "dues: student reads own" on public.dues
  for select to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = dues.enrollment_id
        and e.student_id = (select public.current_student_id())
    )
  );

  create policy "payments: admin full access" on public.payments
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "payments: student reads own" on public.payments
  for select to authenticated
  using (
    exists (
      select 1
      from public.dues d
      join public.enrollments e on e.id = d.enrollment_id
      where d.id = payments.due_id
        and e.student_id = (select public.current_student_id())
    )
  );