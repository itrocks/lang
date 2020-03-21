@echo off
for /f %%f in ('dir /b examples\*.itr') do (
  echo ---------- examples\%%f
  node itr.js examples\%%f
)
