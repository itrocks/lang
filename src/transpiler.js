
const fs      = require('fs')
const globals = require('./globals.js')

class File
{

	constructor(source_file, source)
	{
		this.dest        = ''
		this.locals      = Object.create(globals)
		this.source      = source
		this.source_file = source_file
	}

	chain(chain, separator = '\n')
	{
		let dest = ''
		console.debug('chain', chain)
		for (let element of chain) {
			if (typeof element === 'function') {
				dest += element(chain.slice(1)) + separator
				break
			}
			else if (element.code) {
				dest += element.code.call(this, chain.slice(1)) + separator
				break
			}
			else {
				dest += element + separator
			}
		}
		return dest
	}

	normalize(keyword)
	{
		for (let c of keyword) {
			if ('.@-+ "\'\\'.includes(c)) {
				return '$itr$[\'' + keyword.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\']'
			}
		}
		return '$' + keyword
	}

	transpile()
	{
		if (this.source === '') return
		this.source = this.source + '\n'

		let break_chain     = false
		let chain           = []
		let char            = this.source[0]
		let column          = 1
		let indent          = 0
		let indents         = []
		let index           = 0
		let keyword         = ''
		let keyword_column  = 1
		let keyword_line    = 1
		let length          = this.source.length
		let line            = 1
		let normalized_init = []

		//file:
		while (index < length) {
			let next_indent = -1
			chain:
			while (true) {
				keyword_column = column
				keyword_line   = line

				// string constant
				if ((char === '"') || (char === "'")) {
					let quote = char
					do {
						column ++
						if (char === '\n') { char = '\\n' ; column = 0 ; line ++ }
						keyword += char
						index ++ ; if (index === length) break chain ; char = this.source[index]
						if (char === '\\') {
							keyword += char
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
							} while (' \t'.includes(char))
							if ((index - index_save) <= indent) {
								next_indent = index - index_save
								console.debug('indent-', next_indent, 'A')
								break chain
							}
							keyword += ' '
						}
						if (' \t'.includes(char) && !isNaN(keyword)) {
							index ++ ; if (index === length) break chain ; char = this.source[index]
							break keyword
						}
						else if (char !== '\r') keyword += char
						index ++ ; if (index === length) break chain ; char = this.source[index]
						// define keyword
						if (char === ':') {
							//console.debug('set', keyword)
							let normalized = this.normalize(keyword)
							if (!normalized_init[indent] && normalized.startsWith('$itr$[')) {
								normalized_init[indent] = true
								this.dest += 'let $itr$ = {}\n'
							}
							this.dest += normalized + ' = '
							this.locals[keyword] = normalized
							keyword = '';
							index ++
							break keyword
						}
					} while (!this.locals[keyword])
					//:keyword
					index --
					if (keyword.length) {
						console.debug('keyword', keyword)
					}
				}

				// next keyword
				if (keyword !== '') {
					if (this.locals[keyword]) {
						keyword = this.locals[keyword]
						if (keyword.args === false) {
							break_chain = true
						}
						if (keyword.breaks) {
							this.dest += this.chain(chain)
							chain      = []
						}
						if (keyword.stop) {
							console.debug('! indent', indent, 'stop', keyword)
							indents[indent] = keyword
						}
						if (keyword.vars) {
							this.locals = Object.assign(Object.create(this.locals), keyword.vars)
						}
					}
					chain.push(keyword)
					keyword = ''
				}

				index ++ ; if (index === length) break chain ; char = this.source[index]
				while (' \n\r\t'.includes(char)) {
					column ++
					if (char === '\n') {
						column = 0 ; line ++
						let index_save = index + 1
						do {
							column ++
							index ++ ; if (index === length) break chain ; char = this.source[index]
						} while (' \t'.includes(char))
						next_indent = column - 1
						if ((index - index_save) <= indent) {
							next_indent = index - index_save
							console.debug('indent-', next_indent, 'B')
							break chain
						}
						index --
						if (keyword !== '') keyword += ' '
					}
					index ++ ; if (index === length) break chain ; char = this.source[index]
				}
				if (break_chain) { break_chain = false ; break chain }
			}
			//:chain
			if (keyword !== '') {
				if (isNaN(keyword)) {
					console.error(
						'! unknown keyword \'' + keyword + '\' at '
						+ this.source_file + ':' + keyword_line + ':' + keyword_column
					)
				}
				chain.push(keyword)
				keyword = ''
			}
			if (chain.length) {
				this.dest += this.chain(chain)
				chain = []
			}
			if ((next_indent > -1) && (next_indent < indent)) {
				console.debug('indent-', next_indent, 'C')
				indent = next_indent
			}
			else if (next_indent > indent) {
				console.debug('indent+', next_indent)
				indent = next_indent
			}
		}
		//:file
		let dest_file = this.source_file + '.js'
		fs.writeFile(dest_file, this.dest, (err) => {
			if (err) console.error('! could not save destination file', dest_file)
		})
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
