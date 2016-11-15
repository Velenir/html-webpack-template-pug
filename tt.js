"use strict";
//
// let test = "strict";

function template(locals) {
	// 'use strict';
	var pug_html = "", pug_mixins = {}, pug_interp;
	var pug_debug_filename, pug_debug_line;
	'use strict';

	try {
		'use strict';
		pug_debug_line = 1;
		'use strict';
		let h = 's';
	} catch (err) {
		console.log("Caught", err);
	pug.rethrow(err, pug_debug_filename, pug_debug_line);
	}

	return pug_html;
}

try {
	"use strict";
	let i = 7;
} catch(e) {
	
}


var pug = require('pug');
// var html = pug.renderFile("ttp.pug");
console.log(pug.compileFile("ttp.pug").toString());

// var html = pug.render("- 'use strict'; let h = 's';");
var html = pug.compile("- 'use strict'; var h = 's';");

// console.log(test);
console.log(html.toString());

// Promise.resolve()
// .then(function() {
// 	describe('description 1', function () {
// 		it('1should also work', function () {
//
// 		});
// 	});
//
// 	run();
//
// 	describe('description 2', function () {
// 		it('should also work', function () {
//
// 		});
// 	});
// });
//
// describe('description', function () {
// 	it('should work', function () {
//
// 	});
// });
