
const fs = require('fs')
const globals = require('./globals.js')

class File
{

	source
	source_file

	constructor(source_file, source)
	{
		this.dest        = ''
		this.source      = source
		this.source_file = source_file
	}

	transpile()
	{
		if (!this.source.length) return

		let char           = this.source[0]
		let column         = 1
		let indent         = 0
		let index          = 0
		let locals         = globals
		let keywords       = []
		let keyword        = ''
		let keyword_column = 1
		let keyword_line   = 1
		let length         = this.source.length
		let line           = 1

		//file:
		while (index < length) {
			chain:
			while (true) {
				keyword_column = column
				keyword_line   = line

				// numeric constant
				if ('+-.0123456789'.indexOf(char) >= 0) {
					let dots = 0
					do {
						if (char === '.') {
							dots ++
							if (dots > 1) {
								console.error('! syntax error at ' + this.source_file + ':' + line + ':' + (column + keyword.length))
							}
						}
						keyword += char
						index ++ ; if (index === length) break chain ; char = this.source[index]
					} while ('.0123456789'.indexOf(char) >= 0)
					column += keyword.length + 1
					console.debug('numeric', keyword)
				}

				// string constant
				else if ((char === '"') || (char === "'")) {
					let quote = char
					do {
						column ++
						if (char === '\n') { column = 0 ; line ++ }
						keyword += char
						index ++ ; if (index === length) break chain ; char = this.source[index]
						if (char === '\\') {
							index ++ ; if (index >= length) break chain ; char = ''
							keyword += this.source[index]
							column ++
						}
					} while (char !== quote)
					column ++
					keyword += char
					console.debug('string', keyword)
				}

				// keyword
				else {
					keyword:
					while (!locals.hasOwnProperty(keyword)) {
						if (char === ';') {
							break chain
						}
						column ++
						if (char === '\n') {
							column = 0 ; line ++
							let index_save = index + 1
							do {
								column ++
								index ++ ; if (index === length) break chain ; char = this.source[index]
							} while (' \t'.indexOf(char) >= 0)
							if ((index - index_save) <= indent) {
								break chain
							}
							keyword += ' '
						}
						if (char !== '\r') keyword += char
						index ++ ; if (index === length) break chain ; char = this.source[index]
						// define keyword
						if (char === ':') {
							locals[keyword] = {}
							break keyword
						}
					}
					//:keyword
					index --
					console.debug('keyword', keyword)
				}

				// next keyword
				keywords.push(keyword)
				keyword = ''

				index ++ ; if (index === length) break chain ; char = this.source[index]
				while (' \n\r\t'.indexOf(char) >= 0) {
					column ++
					if (char === '\n') {
						column = 0 ; line ++
						let index_save = index + 1
						do {
							column ++
							index ++ ; if (index === length) break chain ; char = this.source[index]
						} while (' \t'.indexOf(char) >= 0)
						if ((index - index_save) <= indent) {
							break chain
						}
						index --
						if (keyword.length) keyword += ' '
					}
					index ++ ; if (index === length) break chain ; char = this.source[index]
				}
			}
			//:chain
			if (keyword.length) {
				console.error('! unknown keyword \'' + keyword + '\' at ' + this.source_file + ':' + keyword_line + ':' + keyword_column)
				keywords.push(keyword)
				keyword = '';
			}
			if (keywords.length) {
				console.debug('chain', keywords)
				keywords = []
			}
		}
		//:file
	}

}

class Instruction
{
	constructor(source)
	{
		this.source = source
	}
}

class Transpiler
{

	file(source_file)
	{
		fs.readFile(source_file, 'utf8', function(err, source) {
			const start = new Date
			new File(source_file, source).transpile()
			console.log('+', source_file, '(' + (new Date - start).toString() + 'ms)')
		})
	}

	files(source_files)
	{
		for (let source_file of source_files) {
			fs.access(source_file, fs.F_OK, (err) => {
				if (err) {
					console.error('! could not access source file', source_file)
					return
				}
				this.file(source_file)
			})
		}
	}

}

module.exports = new Transpiler
