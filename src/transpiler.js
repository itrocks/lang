
const fs      = require('fs')
const globals = require('./globals.js')

class File
{

	constructor(source_file, source)
	{
		this.chain_column = 1
		this.dest         = ''
		this.indent       = 0
		this.indents      = []
		this.locals       = Object.create(globals)
		this.source       = source
		this.source_file  = source_file
	}

	chain(chain, inside)
	{
		let chain_indent = this.chain_column - 1
		let dest         = ''
		let separator    = (inside === undefined) ? '\n' : inside

		while (chain_indent < this.indents.length - 1) {
			let indent = this.indents.pop()
			if (indent) {
				console.debug('! unindent', this.indents.length)
				dest += (typeof indent.stop === 'function') ? indent.stop.call(this) : indent.stop
			}
		}
		if (
			(chain_indent === this.indents.length - 1)
			&& (inside === undefined)
			&& (!chain || chain[0])
			&& (
				!chain
				|| (typeof chain[0] !== 'object')
				|| (
					(this.indents[this.indents.length - 1].name !== chain[0].name)
					&& (
						!this.indents[this.indents.length - 1].vars
						|| !this.indents[this.indents.length - 1].vars.hasOwnProperty(chain[0].name)
					)
				)
			)
		) {
			let indent = this.indents.pop()
			if (indent) {
				console.debug('! unindent', this.indents.length)
				dest += ((typeof indent.stop === 'function') ? indent.stop.call(this) : indent.stop) + separator
			}
		}

		console.debug(':' + this.chain_column, 'chain', chain)
		if (chain) for (let element of chain) {
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
		this.source += '\n'

		let break_chain     = false
		let chain           = []
		let char            = this.source[0]
		let column          = 1
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
					console.debug(':' + line + ':' + keyword_column, 'string', keyword)
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
							if ((index - index_save) <= this.indent) {
								next_indent = index - index_save
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
							console.debug(':' + line + ':' + keyword_column, 'set', keyword)
							let normalized = this.normalize(keyword)
							if (!normalized_init[this.indent] && normalized.startsWith('$itr$[')) {
								normalized_init[this.indent] = true
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
						console.debug(':' + line + ':' + keyword_column, 'keyword', keyword)
					}
				}

				// next keyword
				if (keyword !== '') {
					if (this.locals[keyword]) {
						let name = keyword
						keyword  = this.locals[keyword]
						if (keyword.args === false) {
							break_chain = true
						}
						if (keyword.breaks) {
							console.debug('breaks')
							this.dest += this.chain(chain)
							chain      = []
							this.chain_column = column
						}

						if (keyword.code) {
							keyword.name = name
						}
						if (keyword.stop) {
							console.debug('! indent', this.indent, 'stop', keyword)
							this.indents[this.indent] = keyword
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
						if ((index - index_save) <= this.indent) {
							next_indent = index - index_save
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
				this.chain_column = column
				chain = []
			}
			if ((next_indent > -1) && (next_indent < this.indent)) {
				console.debug('indent-', next_indent)
				this.indent = next_indent
			}
			else if (next_indent > this.indent) {
				console.debug('indent+', next_indent)
				this.indent = next_indent
			}
		}
		//:file
		this.dest += this.chain()

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
