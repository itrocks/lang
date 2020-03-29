
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

		if ((inside === undefined) && (chain_indent <= this.indents.length -1)) {
			let indent
			while (chain_indent < (this.indents.length - 1)) {
				indent = this.indents.pop()
				if (!indent) continue
				if (indent.vars) {
					console.debug('! unindent', this.indents.length)
					dest += (typeof indent.stop === 'function') ? indent.stop.call(this) : indent.stop
				}
				if (indent.locals) {
					this.locals = Object.getPrototypeOf(this.locals)
				}
			}
			indent = this.indents[this.indents.length - 1]
			if (indent) {
				if (
					(!chain || chain[0])
					&& (
						!chain
						|| (typeof chain[0] !== 'object')
						|| !indent.vars.includes(chain[0].name)
					)
				) {
					let indent = this.indents.pop()
					if (indent.vars) {
						console.debug('! unindent', this.indents.length)
						dest += ((typeof indent.stop === 'function') ? indent.stop.call(this) : indent.stop) + '\n'
					}
					if (indent.locals) {
						this.locals = Object.getPrototypeOf(this.locals)
					}
				}
				else if (chain && (typeof chain[0] === 'object')) {
					console.debug('- REMOVE', chain[0].name)
					indent.vars[indent.vars.indexOf(chain[0].name)] = undefined
				}
			}
		}

		console.debug(':' + this.chain_column, 'chain', chain)
		if (!chain || !chain.length) return dest
		let element_priority
		let index           = 0
		let lowest_element  = chain[0]
		let lowest_index    = 0
		let lowest_priority = Number.MAX_SAFE_INTEGER
		for (let element of chain) {
			element_priority = element.priority ? element.priority : 1000
			if (element.code && (element_priority < lowest_priority)) {
				lowest_element  = element
				lowest_index    = index
				lowest_priority = element_priority
			}
			index ++
		}

		if (lowest_element.code) {
			return dest + lowest_element.code.call(this, chain, lowest_index) + separator
		}
		if (chain.length === 1) {
			return dest + ((lowest_element.name === undefined) ? lowest_element : lowest_element.name) + separator
		}

		let result = (dest === '' ? [] : [dest])
		for (let element of chain) {
			result.push((element.name === undefined) ? element : element.name)
		}
		return dest + result.join(', ') + separator
	}

	normalize(keyword)
	{
		for (let char of keyword) {
			if ('.@-+ "\'\\'.includes(char)) {
				return '$itr$[\'' + keyword.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\']'
			}
		}
		return '$' + keyword
	}

	transpile()
	{
		if (this.source === '') return
		this.source = this.source.replace(/\r/g, '') + '\n'

		let break_chain     = false
		let chain           = []
		let char            = this.source[0]
		let column          = 1
		let index           = 0
		let keyword         = ''
		let keyword_column  = 1
		let keyword_line    = 1
		let last_keyword    = ''
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
							if ((index - index_save) <= this.indent) { next_indent = index - index_save ; break chain }
							keyword += ' '
						}
						if (' \t'.includes(char) && !isNaN(keyword)) {
							index ++ ; if (index === length) break chain ; char = this.source[index]
							break keyword
						}
						else {
							keyword += char
						}
						index ++ ; if (index === length) break chain ; char = this.source[index]
						// define keyword
						if (char === ':') {
							console.debug(':' + line + ':' + keyword_column, 'set', keyword)
							let normalized = this.normalize(keyword)
							if (normalized.startsWith('$itr$[')) {
								if (!normalized_init[this.indent]) {
									normalized_init[this.indent] = true
									this.dest += 'let $itr$ = {}\n'
								}
							}
							else {
								this.dest += 'let '
							}
							this.dest += normalized + ' = '
							this.locals[keyword] = {
								name: normalized
							}
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
					if (this.locals[last_keyword + keyword]) {
						keyword = last_keyword + keyword
						chain.pop()
					}
					last_keyword = keyword
					if (this.locals[keyword]) {
						let name = keyword
						keyword  = this.locals[keyword]
						if (keyword.args && !keyword.args.length) {
							break_chain = true
						}
						if (keyword.breaks) {
							console.debug('breaks')
							this.dest += this.chain(chain)
							chain      = []
							this.chain_column = column
						}

						if (keyword.stop !== undefined) {
							console.debug('! indent', this.indent, 'stop', keyword)
							if (this.indents[this.indent]) {
								let indent = this.indents[this.indent]
								this.dest += ((typeof indent.stop === 'function') ? indent.stop.call(this) : indent.stop) + '\n'
							}
							this.indents[this.indent] = {
								stop: keyword.stop,
								vars: keyword.vars ? [name].concat(Object.keys(keyword.vars)) : [name]
							}
						}
						if (keyword.vars) {
							if (!this.indents[this.indent]) this.indents[this.indent] = {}
							if (this.indents[this.indent].locals) {
								this.locals = Object.getPrototypeOf(this.locals)
							}
							this.locals = Object.assign(Object.create(this.locals), keyword.vars)
							this.indents[this.indent].locals = this.locals
						}
					}
					chain.push(keyword)
					keyword = ''
				}

				index ++ ; if (index === length) break chain ; char = this.source[index]
				while (' \n\t'.includes(char)) {
					column ++
					if (char === '\n') {
						column = 0 ; line ++
						let index_save = index + 1
						do {
							column ++
							index ++ ; if (index === length) break chain ; char = this.source[index]
						} while (' \t'.includes(char))
						next_indent = column - 1
						if ((index - index_save) <= this.indent) { next_indent = index - index_save ; break chain }
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
		console.debug('transpiled code = [\n' + this.dest + ']')

		return this.dest
	}

}

class Transpiler
{

	constructor()
	{
		this.files_count = 0
		this.File        = File
	}

	file(source_file)
	{
		this.files_count ++
		fs.readFile(source_file, 'utf8', (err, source) => {
			const start = new Date

			let dest_file = source_file + '.js'
			fs.writeFile(dest_file, new File(source_file, source).transpile(), (err) => {
				if (err) console.error('! could not save destination file', dest_file)
			})

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
