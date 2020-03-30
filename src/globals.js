
let equality = function(chain, index) {
	return this.chain(chain.slice(0, index), '') + ' ' + chain[index].name + '= ' + this.chain(chain.slice(index + 1), '')
}
let operator = function(chain, index) {
	return this.chain(chain.slice(0, index), '') + ' ' + chain[index].name + ' ' + this.chain(chain.slice(index + 1), '')
}
let unary = function(chain) {
	return chain[0] + this.chain(chain.slice(1), '')
}

globals = {

	'=':    { code: operator },
	'+=':   { code: operator },
	'-=':   { code: operator },
	'*=':   { code: operator },
	'/=':   { code: operator },
	'%=':   { code: operator },
	'**=':  { code: operator },
	'&=':   { code: operator },
	'|=':   { code: operator },
	'^=':   { code: operator },
	'<<=':  { code: operator },
	'>>=':  { code: operator },
	'>>>=': { code: operator },

	'||':   { code: operator },
	'&&':   { code: operator },

	'>':    { code: operator },
	'<':    { code: operator },
	'>=':   { code: operator },
	'<=':   { code: operator },
	'==':   { code: equality },
	'!=':   { code: equality },

	'!':    { code: unary },
	'~':    { code: unary },

	'+':    { code: operator },
	'-':    { code: operator },
	'*':    { code: operator },
	'/':    { code: operator },
	'%':    { code: operator },
	'**':   { code: operator },
	'&':    { code: operator },
	'|':    { code: operator },
	'^':    { code: operator },
	'<<':   { code: operator },
	'>>':   { code: operator },
	'>>>':  { code: operator },

	'do': {
		args: [],
		code: function() {
			return 'do {'
		},
		stop: '',
		vars: {
			'while': {
				code: function(chain) {
					return '} while (' + this.chain(chain.slice(1), '') + ')'
				}
			}
		}
	},

	'if': {
		code: function(chain) {
			return 'if (' + this.chain(chain.slice(1), '') + ')'
		},
		stop: '}',
		vars: {
			'then': {
				args:   [],
				breaks: true,
				code:   function() {
					delete this.locals.then
					return '{'
				}
			},
			'else': {
				args:   [],
				breaks: true,
				code:   function() {
					delete this.locals.then
					delete this.locals.else
					return '}\nelse {'
				}
			},
		}
	},

	'print': {
		code: function(chain) {
			return 'console.log(' + this.chain(chain.slice(1), '') + ')'
		}
	},

	'repeat': {
		args: [],
		code: function() {
			return 'do {'
		},
		stop: '',
		vars: {
			'until': {
				code: function(chain) {
					return '} while (!(' + this.chain(chain.slice(1), '') + '))'
				}
			}
		}
	},

	'while': {
		code: function(chain) {
			return 'while (' + this.chain(chain.slice(1), '') + ')'
		},
		stop: '}',
		vars: {
			'do': {
				args:   [],
				breaks: true,
				code:   function() {
					delete this.locals.do
					return '{'
				}
			}
		}
	}

}

let setNames = function(locals)
{
	for (let name in locals) if (locals.hasOwnProperty(name)) {
		let local = locals[name]
		local.name = name
		if (local.vars) setNames(local.vars)
	}
}
setNames(globals)

module.exports = globals
