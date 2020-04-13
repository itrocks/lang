a: 1
b: a == 1 ? 2 : 3
c: a == 2 ? 3 : 4
d: c ?: b ?: a
print b c d
-----
let $a = 1
let $b = $a === 1 ? 2 : 3
let $c = $a === 2 ? 3 : 4
let $d = $c ? $c : $b ? $b : $a
console.log($b, $c, $d)
-----
2 4 4