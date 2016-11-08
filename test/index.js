"use strict";

var expect = require('chai').expect;

var fs = require('fs');
var path = require('path');
var pug = require('pug');
var beautify_html = require('js-beautify').html;

var layoutPug = path.join(__dirname, '../src/layout.pug');

var defaultsJSON = path.join(__dirname, 'defaultLocals.json');

var testFilesDir = path.join(__dirname, 'test_cases');
var assetsDir = path.join(__dirname, 'assets');

function promiseFS(fun, arg) {
	return new Promise(function(resolve, reject) {
		fun.call(fs, arg, 'utf8', function(err, data) {
			if(err) return reject(err);

			resolve(data);
		});
	});
}


globalSetup().then(function(setupResults) {
	console.log("SETUP FINISHED");

	var compiledDefaultTemplate = setupResults[0],
		testCases = setupResults[1],
		defaultLocals = setupResults[2];
	// console.log("DEFAULT LOCALS", defaultLocals);

	describe('rendering layout ', function () {

		function prepareInput(jsonFile, htmlFile) {
			var promisedLocals = jsonFile ? promiseFS(fs.readFile, path.join(testFilesDir, jsonFile)).then(function (fileData) {
				var newLocals = JSON.parse(fileData);
				var mergedLocals = {htmlWebpackPlugin: {}};

				// extend each prop in htmlWebpackPlugin
				for (var prop in defaultLocals.htmlWebpackPlugin) {
					mergedLocals.htmlWebpackPlugin[prop] = Object.assign({}, defaultLocals.htmlWebpackPlugin[prop], newLocals.htmlWebpackPlugin[prop]);
				}
				// console.log("\nfor", jsonFile);
				// console.log("newLocals", newLocals);
				// console.log("defaultLocals", defaultLocals);
				// console.log("mergedLocals", mergedLocals);

				return attachCompiledAssets(mergedLocals);
			}) : attachCompiledAssets(Object.assign({}, defaultLocals));

			var promisedHTML = promiseFS(fs.readFile, path.join(testFilesDir, htmlFile));

			return Promise.all([promisedLocals, promisedHTML]);
		}

		testCases.forEach(function(testCase) {

			it((testCase.pug || 'layout.pug') + ', given ' + (testCase.json || 'default.json') +' input, should produce ' + testCase.html, function () {
				return prepareInput(testCase.json, testCase.html).then(function(results) {
					var currentLocals = results[0], expectedHTML = results[1];

					// console.log("currentLocals", currentLocals);
					console.log("COMPILING");
					var compiledTemplate = testCase.pug ? pug.compileFile(path.join(testFilesDir, testCase.pug), {pretty: true}) : compiledDefaultTemplate;
					console.log("APPLYING");

					var rendered = beautify_html(compiledTemplate(currentLocals), {
						indent_with_tabs: true,
						extra_liners: [],
						indent_inner_html: true
					});

					// TODO:10 remove
					fs.writeFileSync('./rendered/'+testCase.html, rendered);

					expect(rendered).to.equal(expectedHTML);
				});
			});
		});

	});

	run();
});

var attachCompiledAssets = (function () {
	var cachedAssets = new Map();

	return function(locals) {
		// console.log("ATTACHING TO", locals);

		var assets = {};

		var compiledAssetsPromises = locals.htmlWebpackPlugin.files.css
		.concat(locals.htmlWebpackPlugin.files.js)
		.reduce(function(promises, fname) {
			if(cachedAssets.has(fname)) {
				assets[fname] = cachedAssets.get(fname);
			} else {
				var promise = promiseFS(fs.readFile, path.join(assetsDir, fname)).then(function(data) {
					cachedAssets.set(fname, assets[fname] = {
						source: function() {
							return data;
						}
					});
				});
				promises.push(promise);
			}

			return promises;
		}, []);

		return Promise.all(compiledAssetsPromises).then(function() {
			locals.compilation = {assets: assets};
			// console.log("AFTER ATTACHMENT", locals);
			return locals;
		});
	};
})();


function globalSetup() {
	var compiledDefaultTemplate = pug.compileFile(layoutPug, {pretty: true});

	var promisedTestCases = promiseFS(fs.readdir, testFilesDir).then(function(testFiles) {
		// console.log("FILES IN ", testFilesDir, testFiles);
		return testFiles.reduce(function(map, cur) {

			var ext = path.extname(cur);

			// console.log("CONSIDERING", cur, ext);

			if(ext === ".json" || ext === ".html" || ext === ".pug") {
				var name = path.basename(cur, ext);
				ext = ext.slice(1);

				if(map.has(name)) {
					map.get(name)[ext] = cur;
				} else {
					map.set(name, {[ext]: cur});
				}
			}

			// console.log("map", map);

			return map;
		}, new Map());
	});

	var promisedDefaultLocals = promiseFS(fs.readFile, defaultsJSON).then(function(data) {
		return JSON.parse(data);
	});

	return Promise.all([compiledDefaultTemplate, promisedTestCases, promisedDefaultLocals]);
}
