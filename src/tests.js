
const fs         = require('fs')
const transpiler = require('./transpiler.js')

class Tests
{

	run()
	{
		console.log('it.rocks unit test session')
		fs.readdir('tests', function(err, filenames) {
			for (let filename of filenames) {
				if (!filename.endsWith('.tst')) continue
				fs.readFile('tests/' + filename, 'utf8', function(err, data) {
					let await_javascript, await_output, itrocks, javascript
					[itrocks, await_javascript, await_output] = data.split('\n-----')
					let console_debug = console.debug
					console.debug = function() {}
					javascript    = new transpiler.File(filename, itrocks).transpile()
					console.debug = console_debug
					if (javascript.trim() === await_javascript.trim()) {
						let console_log = console.log
						let output      = '';
						console.log     = function(...args) { output += args.join(' ') + '\n' }
						;(function() { eval(javascript) })()
						console.log = console_log
						if (output.trim() === await_output.trim()) {
							console.log(' ', filename, 'OK')
						}
						else {
							console.error('!', filename, 'bad output')
							console.error('[\n' + output + '\n]')
						}
					}
					else {
						console.error('!', filename, 'bad javascript')
						console.error('[\n' + javascript + '\n]')
					}
				})
			}
		})
	}

}

module.exports = new Tests
