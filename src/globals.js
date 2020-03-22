
globals = {

	'if': {
		code: function(args) {
			return 'if (' + this.chain(args, '') + ')'
		},
		stop: '}',
		vars: {
			'then': {
				args:   false,
				breaks: true,
				code:   function() {
					delete this.locals.then
					return '{'
				}
			},
			'else': {
				args:   false,
				breaks: true,
				code:   function() {
					delete this.locals.then
					delete this.locals.else
					return '}\nelse {'
				}
			},
		}
	},

	'print': function(args) {
		return 'console.log(' + args.join(', ') + ')'
	},

	'while': {
		code: function(args) {
			return 'while (' + this.chain(args, '') + ')'
		},
		stop: '}',
		vars: {
			'do': {
				args:   false,
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
