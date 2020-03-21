@echo off
echo.
echo ---------- TRANSPILE %1
echo.
node itr.js %1

echo ---------- RUN %1
echo.
node %1.js
