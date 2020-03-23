// it.rocks.lang to js transpiler
// Copyright (c) 2020 Baptiste Pillot

const VERSION = '0.0.0'
const VERSION_DATE = '2020-03-09'

//console.debug = function(){}

console.log('it.rocks.lang to js transpiler version ' + VERSION + ' (' + VERSION_DATE + ')')
console.log('Copyright (c) 2020 Baptiste Pillot')
console.log('https://github.com/itrocks/lang')
console.log()

const process    = require('process')
const transpiler = require('./transpiler.js')

// transpile
transpiler.files(process.argv.slice(2));

// create launchers for both Linux and Windows
let fs = require('fs')
for (let file of process.argv.slice(2)) {
	let dest, script
	// create launcher for Linux
	script = '#!/bin/bash\nnode "$0.itr.js"\n'
	dest   = file.substr(0, file.lastIndexOf('.'))
	fs.writeFile(dest, script, ()=>{ fs.chmod(dest, '777', ()=>{}) })
	// create launcher for Windows
	script = '@echo off\r\nnode "%~pn0.itr.js"\n'
	dest   = file.substr(0, file.lastIndexOf('.')) + '.bat'
	fs.writeFile(dest, script, ()=>{})
}
