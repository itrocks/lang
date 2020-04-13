
const fs         = require('fs')
const transpiler = require('./transpiler.js')

class Tests
{

	firstDiff(string1, string2)
	{
		let char
		let column = 1
		let length = Math.min(string1.length, string2.length)
		let row    = 1
		for (let index = 0 ; index < length ; index++) {
			char = string1[index]
			if (char !== string2[index]) return { column: column, index: index, row: row }
			if (char === '\n') { column = 1 ; row ++ } else column ++
		}
		if (string1.length !== string2.length) return { column: column, index: length, row: row }
	}

	linesCount(string)
	{
		let count = 0
		let index = 0
		while ((index = string.indexOf('\n', index)) > -1) {
			count ++
			index ++
		}
		return count
	}

	run()
	{
		let self = this
		console.log('it.rocks unit test session')
		fs.readdir('tests', function(err, filenames) {
			for (let filename of filenames) {
				if (!filename.endsWith('.tst')) continue
				fs.readFile('tests/' + filename, 'utf8', function(err, data) {
					let await_javascript, await_output, itrocks, javascript
					[itrocks, await_javascript, await_output] = data.split('\n-----\n')
					let console_debug = console.debug
					console.debug = function() {}
					javascript    = new transpiler.File(filename, itrocks).transpile()
					console.debug = console_debug
					if (javascript.trim() === await_javascript.trim()) {
						let console_log = console.log
						let output      = ''
						console.log     = function(...args) { output += args.join(' ') + '\n' }
						;(function() { eval(javascript) })()
						console.log = console_log
						if (output.trim() === await_output.trim()) {
							console.log(' ', filename, 'OK')
						}
						else {
							let diff      = self.firstDiff(output.trim(), await_output.trim())
							let first_row = self.linesCount(itrocks) + self.linesCount(await_javascript) + 4
							console.error('!', filename + ':' + (first_row + diff.row) + ':' + diff.column, 'bad output')
							console.error('[\n' + output + '\n]')
						}
					}
					else {
						let diff      = self.firstDiff(javascript.trim(), await_javascript.trim())
						let first_row = self.linesCount(itrocks) + 2
						console.error('!', filename + ':' + (first_row + diff.row) + ':' + diff.column, 'bad javascript')
						console.error('[\n' + javascript + '\n]')
					}
				})
			}
		})
	}

}

module.exports = new Tests
