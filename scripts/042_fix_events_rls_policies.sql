-- ============================================================================
-- MIGRATION: Fix Events Table and RLS Policies
-- ============================================================================
-- Fecha: 2024-11-24
-- Descripción: Configura la tabla events con RLS policies correctas
--              para permitir que los eventos sean visibles en la aplicación
-- ============================================================================

-- ============================================================================
-- PASO 1: Asegurar que RLS está habilitado
-- ============================================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 2: Limpiar policies viejas que podrían estar bloqueando
-- ============================================================================
DROP POLICY IF EXISTS "events_select_all" ON public.events;
DROP POLICY IF EXISTS "events_insert_own" ON public.events;
DROP POLICY IF EXISTS "events_update_own" ON public.events;
DROP POLICY IF EXISTS "events_delete_own" ON public.events;
DROP POLICY IF EXISTS "events_admin_select" ON public.events;
DROP POLICY IF EXISTS "events_admin_insert" ON public.events;
DROP POLICY IF EXISTS "events_admin_update" ON public.events;
DROP POLICY IF EXISTS "events_admin_delete" ON public.events;

-- ============================================================================
-- PASO 3: Crear RLS Policies para la tabla events
-- ============================================================================

-- IMPORTANTE: Esta policy permite que CUALQUIERA vea los eventos
-- Sin esta policy, los eventos no aparecen en el frontend
CREATE POLICY "events_select_all"
  ON public.events FOR SELECT
  USING (true);

-- Permitir que cada usuario inserte solo sus propios eventos
CREATE POLICY "events_insert_own"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

-- Permitir que cada usuario actualice solo sus propios eventos
CREATE POLICY "events_update_own"
  ON public.events FOR UPDATE
  USING (auth.uid() = organizer_id);

-- Permitir que cada usuario elimine solo sus propios eventos
CREATE POLICY "events_delete_own"
  ON public.events FOR DELETE
  USING (auth.uid() = organizer_id);

-- ============================================================================
-- PASO 4: Crear RLS Policies para admins
-- ============================================================================

-- Permitir que admins vean todos los eventos
CREATE POLICY "events_admin_select"
  ON public.events FOR SELECT
  USING (is_admin(auth.uid()));

-- Permitir que admins creen eventos
CREATE POLICY "events_admin_insert"
  ON public.events FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Permitir que admins actualicen cualquier evento
CREATE POLICY "events_admin_update"
  ON public.events FOR UPDATE
  USING (is_admin(auth.uid()));

-- Permitir que admins eliminen cualquier evento
CREATE POLICY "events_admin_delete"
  ON public.events FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================================
-- PASO 5: Verificación
-- ============================================================================
-- Descomenta esta sección para verificar que todo se creó correctamente:
/*
SELECT 
  policyname,
  cmd,
  permissive,
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'events'
ORDER BY policyname;

-- Deberías ver estas 8 policies:
-- - events_admin_delete (DELETE, permissive)
-- - events_admin_insert (INSERT, permissive)
-- - events_admin_select (SELECT, permissive)
-- - events_admin_update (UPDATE, permissive)
-- - events_delete_own (DELETE, permissive)
-- - events_insert_own (INSERT, permissive)
-- - events_select_all (SELECT, permissive)
-- - events_update_own (UPDATE, permissive)
*/

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. La policy "events_select_all" es CRÍTICA - sin ella, el frontend no ve eventos
-- 2. Las policies de "own" permiten que usuarios editen solo sus eventos
-- 3. Las policies de "admin" permiten que admins gestionen todos los eventos
-- 4. Este script es idempotente: se puede ejecutar múltiples veces sin problemas
-- 5. Si cambias la estructura de la tabla events, revisa estas policies
-- ============================================================================
