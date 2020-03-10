// it.rocks.lang to js transpiler
// Copyright (c) 2020 Baptiste Pillot

const VERSION = '0.0.0'
const VERSION_DATE = '2020-03-09'

console.debug = function(){}

console.log('it.rocks.lang to js transpiler version ' + VERSION + ' (' + VERSION_DATE + ')')
console.log('Copyright (c) 2020 Baptiste Pillot')
console.log('https://github.com/itrocks/lang')
console.log()

//--------------------------------------------------------------------------------------------------

const process    = require('process')
const transpiler = require('./src/transpiler.js')

transpiler.files(process.argv.slice(2));
