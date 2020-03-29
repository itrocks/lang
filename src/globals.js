
globals = {

	'=': {
		code: function(chain, index) {
			return this.chain(chain.slice(0, index), '') + ' = ' + this.chain(chain.slice(index + 1), '')
		},
		priority: 100
	},

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

	'print': function(chain) {
		return 'console.log(' + chain.slice(1).join(', ') + ')'
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

module.exports = globals
