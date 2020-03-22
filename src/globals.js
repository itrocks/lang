
globals = {

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
			return 'if (' + this.chain(chain, '') + ')'
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
		return 'console.log(' + chain.join(', ') + ')'
	},

	'while': {
		code: function(chain) {
			return 'while (' + this.chain(chain, '') + ')'
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
