// it.rocks.lang to js transpiler
// Copyright (c) 2020 Baptiste Pillot

const VERSION = '0.0.0'
const VERSION_DATE = '2020-03-09'

console.log('it.rocks.lang to js transpiler version ' + VERSION + ' (' + VERSION_DATE + ')')
console.log('Copyright (c) 2020 Baptiste Pillot')
console.log('https://github.com/itrocks/lang')
console.log()

const process    = require('process')
const launcher   = require('./launcher.js')
const transpiler = require('./transpiler.js')

// run unit tests
if (process.argv.indexOf('test') > -1) {
	const test = require('./test.js')
	test.run()
	return
}

// transpile
transpiler.files(process.argv.slice(2));

// create launchers for both Linux and Windows
for (let file of process.argv.slice(2)) {
	launcher.build(file)
}
