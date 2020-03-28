a var: 'value'
It's a "wild" world: 'Wild'
0th: 28
1th: 29
traditional_var: 101
@crazy things: "crazy"
A variable
  on multiple lines: "A value
on multiple lines"
an \antislashed\n variable name: "an \\antislashed \\nvalue"
var: "An \"antislashed\" string"

print It's a "wild" world
print 0th
print 1th
print traditional_var
print @crazy things
print A variable on multiple lines
print an \antislashed\n variable name
print var
-----
let $itr$ = {}
$itr$['a var'] = 'value'
$itr$['It\'s a "wild" world'] = 'Wild'
let $0th = 28
let $1th = 29
let $traditional_var = 101
$itr$['@crazy things'] = "crazy"
$itr$['A variable on multiple lines'] = "A value\non multiple lines"
$itr$['an \\antislashed\\n variable name'] = "an \\antislashed \\nvalue"
let $var = "An \"antislashed\" string"
console.log($itr$['It\'s a "wild" world'])
console.log($0th)
console.log($1th)
console.log($traditional_var)
console.log($itr$['@crazy things'])
console.log($itr$['A variable on multiple lines'])
console.log($itr$['an \\antislashed\\n variable name'])
console.log($var)
-----
Wild
28
29
101
crazy
A value
on multiple lines
an \antislashed \nvalue
An "antislashed" string