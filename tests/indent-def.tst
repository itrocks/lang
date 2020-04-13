a: 1
with space: 'A'
print a with space
if a == 1 then
  b: 2
  other space: 'B'
  print a with space
  print b other space
  while a do
    with space: 'C'
    print a with space
    print b other space
    a = 0
print a with space
-----
let $a = 1
let $itr$ = {}
$itr$['with space'] = 'A'
console.log($a, $itr$['with space'])
if ($a === 1)
{
let $b = 2
$itr$ = Object.create($itr$)
$itr$['other space'] = 'B'
console.log($a, $itr$['with space'])
console.log($b, $itr$['other space'])
while ($a)
{
$itr$ = Object.create($itr$)
$itr$['with space'] = 'C'
console.log($a, $itr$['with space'])
console.log($b, $itr$['other space'])
$a = 0
$itr$ = Object.getPrototypeOf($itr$)
}
$itr$ = Object.getPrototypeOf($itr$)
}
console.log($a, $itr$['with space'])
-----
1 A
1 A
2 B
1 C
2 B
0 A