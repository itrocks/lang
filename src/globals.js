
globals = {

	'print': {
		'*': {
			code: function(args) { return 'console.log(' + args.join(', ') + ')' }
		}
	},

	'tell me': {}

}

module.exports = globals
