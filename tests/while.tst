var: 0
repeat
  var = 1
until var
while var do
  var = 0
condition: 5
while condition do
  print 'dec' condition
  condition -= 1
condition = -5
do
  print 'inc' condition
  condition += 1
while condition
-----
let $var = 0
do {
$var = 1
} while (!($var))

while ($var)
{
$var = 0
}
let $condition = 5
while ($condition)
{
console.log('dec', $condition)
$condition -= 1
}
$condition =  - 5
do {
console.log('inc', $condition)
$condition += 1
} while ($condition)
-----
dec 5
dec 4
dec 3
dec 2
dec 1
inc -5
inc -4
inc -3
inc -2
inc -1
