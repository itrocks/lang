
fs = require('fs')

class Launcher
{

	build(file)
	{
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

}

module.exports = new Launcher
