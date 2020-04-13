false: 0
true: 1

if true then
  print 'ok'
  if false
  then print 1
  else print 2
else
  print 'no'
  if false then print 'NO' else print 'YES'
print "something"
if true
then
  print "TRUE"
else
  print "FALSE"
if true then print "TRUE"
if false then print "FALSE"
-----
let $false = 0
let $true = 1
if ($true)
{
console.log('ok')
if ($false)
{
console.log(1)
}
else {
console.log(2)
}
}
else {
console.log('no')
if ($false)
{
console.log('NO')
}
else {
console.log('YES')
}
}
console.log("something")
if ($true)
{
console.log("TRUE")
}
else {
console.log("FALSE")
}
if ($true)
{
console.log("TRUE")
}
if ($false)
{
console.log("FALSE")
}
-----
ok
2
something
TRUE
TRUE