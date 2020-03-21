
const fs = require('fs')
const globals = require('./globals.js')

class File
{

	constructor(source_file, source)
	{
		this.dest        = ''
		this.source      = source
		this.source_file = source_file
	}

	chain(chain, locals)
	{
		keyword:
		for (let keyword of chain) {
			for (let variant in locals[keyword]) if (locals[keyword].hasOwnProperty(variant)) {
				if (variant === '*') {
					this.dest += locals[keyword][variant].code(chain.slice(1)) + '\n'
					break keyword
				}
			}
			this.dest += keyword + '\n'
		}
	}

	normalize(keyword)
	{
		return (
				('@+-.0123456789'.indexOf(keyword[0]) < 0)
				&& (keyword.indexOf(' ') < 0)
				&& (keyword.indexOf('"') < 0)
				&& (keyword.indexOf("'") < 0)
			)
			? keyword
			: ('$itr$[\'' + keyword.replace("'", "\\'") + '\']')
	}

	transpile()
	{
		if (this.source === '') return
		this.source = this.source + '\n'

		let char            = this.source[0]
		let column          = 1
		let indent          = 0
		let index           = 0
		let locals          = globals
		let keywords        = []
		let keyword         = ''
		let keyword_column  = 1
		let keyword_line    = 1
		let length          = this.source.length
		let line            = 1
		let normalized_init = []

		//file:
		while (index < length) {
			chain:
			while (true) {
				keyword_column = column
				keyword_line   = line

				// string constant
				if ((char === '"') || (char === "'")) {
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
					do {
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
						if ((' \t'.indexOf(char) >= 0) && !isNaN(keyword)) {
							index ++ ; if (index === length) break chain ; char = this.source[index]
							break keyword
						}
						else if (char !== '\r') keyword += char
						index ++ ; if (index === length) break chain ; char = this.source[index]
						// define keyword
						if (char === ':') {
							console.debug('set', keyword)
							let normalized = this.normalize(keyword)
							if ((normalized_init[indent] === undefined) && normalized.startsWith('$itr$[')) {
								normalized_init[indent] = true
								this.dest += 'let $itr$ = {}\n'
							}
							this.dest += normalized + ' = '
							locals[keyword] = {}
							keyword = '';
							index ++
							break keyword
						}
					}
					while (!locals.hasOwnProperty(keyword))
					//:keyword
					index --
					if (keyword.length) {
						console.debug('keyword', keyword)
					}
				}

				// next keyword
				if (keyword !== '') {
					keywords.push(locals.hasOwnProperty(keyword) ? this.normalize(keyword) : keyword)
					keyword = ''
				}

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
						if (keyword !== '') keyword += ' '
					}
					index ++ ; if (index === length) break chain ; char = this.source[index]
				}
			}
			//:chain
			if (keyword !== '') {
				console.error('! unknown keyword \'' + keyword + '\' at ' + this.source_file + ':' + keyword_line + ':' + keyword_column)
				keywords.push(keyword)
				keyword = '';
			}
			if (keywords !== '') {
				console.debug('chain', keywords)
				this.chain(keywords, locals)
				keywords = []
			}
		}
		//:file
		let dest_file = this.source_file + '.js'
		fs.writeFile(dest_file, this.dest, (err) => { if (err) console.error('! could not save destination file', dest_file) })
		console.debug('transpiled code = [\n' + this.dest + ']')
	}

}

class Transpiler
{

	constructor()
	{
		this.files_count = 0
	}

	file(source_file)
	{
		this.files_count ++
		fs.readFile(source_file, 'utf8', (err, source) => {
			const start = new Date
			new File(source_file, source).transpile()
			console.info('+', source_file, '(' + (new Date - start).toString() + 'ms)')
			if (!--this.files_count) {
				console.info()
			}
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
