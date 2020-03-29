
let equality = function(chain, index) {
	return this.chain(chain.slice(0, index), '') + ' ' + chain[index].name + '= ' + this.chain(chain.slice(index + 1), '')
}
let operator = function(chain, index) {
	return this.chain(chain.slice(0, index), '') + ' ' + chain[index].name + ' ' + this.chain(chain.slice(index + 1), '')
}

globals = {

	'=':  { code: operator, priority: 100 },
	'>':  { code: operator, priority: 500 },
	'<':  { code: operator, priority: 500 },
	'>=': { code: operator, priority: 500 },
	'<=': { code: operator, priority: 500 },
	'==': { code: equality, priority: 500 },
	'!=': { code: equality, priority: 500 },

	'do': {
		args: [],
		code: function() {
			return 'do {'
		},
		stop: '',
		vars: {
			'while': function(chain) {
				return '}\nwhile (' + this.chain(chain, '') + ')'
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

for (let name in globals) globals[name].name = name

module.exports = globals
