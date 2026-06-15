@echo off
echo.
echo ============================================
echo  RoomLynk - Migraciones SQL
echo ============================================
echo.
echo Si YA ejecutaste 002_roomlynk_schema.sql:
echo   Ejecuta en Supabase SQL Editor: scripts\setup-003-only.sql
echo.
echo Si NO has ejecutado nada aun:
echo   1. supabase\migrations\002_roomlynk_schema.sql
echo   2. supabase\migrations\003_invitation_rpc.sql
echo.
echo NO ejecutes 001_initial_schema.sql ni scripts\setup-all.sql
echo.
echo SQL Editor:
echo https://supabase.com/dashboard/project/swifgilmkpktxwcfmuea/sql/new
echo.
pause
