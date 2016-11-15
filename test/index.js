"use strict";

var expect = require('chai').expect;

var fs = require('fs');
var path = require('path');
var pug = require('pug');
var beautify_html = require('js-beautify').html;

var layoutPug = path.join(__dirname, '../layout.pug');

var defaultsJSON = path.join(__dirname, 'defaultLocals.json');

var testFilesDir = path.join(__dirname, 'test_cases');
var assetsDir = path.join(__dirname, 'assets');

function promiseFS() {
	var fun = arguments[0], rest = Array.prototype.slice.call(arguments, 1);
	
	return new Promise(function(resolve, reject) {
		fun.apply(fs, rest.concat(function(err, data) {
			if(err) return reject(err);
			resolve(data);
		}));
	}).catch(function(err){
		console.log("after read",err);
	});
}



globalSetup().then(function(setupResults) {
	var compiledDefaultTemplate = setupResults[0],
		testCases = setupResults[1],
		defaultLocals = setupResults[2];
		

	describe('rendering layout ', function () {
		
		
		this.slow(1000);

		function prepareInput(jsonFile, htmlFile) {
			var promisedLocals = jsonFile ? promiseFS(fs.readFile, path.join(testFilesDir, jsonFile), "utf8").then(function (fileData) {
				var newLocals = JSON.parse(fileData);
				var mergedLocals = {htmlWebpackPlugin: {}};

				// extend each prop in htmlWebpackPlugin
				for (var prop in defaultLocals.htmlWebpackPlugin) {
					mergedLocals.htmlWebpackPlugin[prop] = Object.assign({}, defaultLocals.htmlWebpackPlugin[prop], newLocals.htmlWebpackPlugin[prop]);
				}

				return attachCompiledAssets(mergedLocals);
			}) : attachCompiledAssets(Object.assign({}, defaultLocals));

			var promisedHTML = promiseFS(fs.readFile, path.join(testFilesDir, htmlFile), "utf8");

			return Promise.all([promisedLocals, promisedHTML]);
		}

		testCases.forEach(function(testCase) {
			
			it((testCase.pug || 'layout.pug') + ', given ' + (testCase.json || 'defaultLocals.json') +', should produce ' + testCase.html, function () {
				return prepareInput(testCase.json, testCase.html).then(function(results) {
					var currentLocals = results[0], expectedHTML = results[1];
					
					var compiledTemplate = testCase.pug ? pug.compileFile(path.join(testFilesDir, testCase.pug), {pretty: true}) : compiledDefaultTemplate;

					var rendered = beautify_html(compiledTemplate(currentLocals), {
						indent_with_tabs: true,
						extra_liners: [],
						indent_inner_html: true
					});

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
		var assets = {}, publicPath = locals.htmlWebpackPlugin.files.publicPath,
			substrStart = publicPath ? publicPath.length : 0;

		var compiledAssetsPromises = locals.htmlWebpackPlugin.files.css
		.concat(locals.htmlWebpackPlugin.files.js)
		.reduce(function(promises, fname) {
			if(cachedAssets.has(fname)) {
				assets[fname] = cachedAssets.get(fname);
			} else {
				if(substrStart) fname = fname.substr(substrStart);
				var promise = promiseFS(fs.readFile, path.join(assetsDir, fname), "utf8").then(function(data) {
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
			return locals;
		});
	};
})();


function globalSetup() {
	var compiledDefaultTemplate = pug.compileFile(layoutPug, {pretty: true});
	

	var promisedTestCases = promiseFS(fs.readdir, testFilesDir).then(function(testFiles) {
		return testFiles.reduce(function(map, cur) {
			var ext = path.extname(cur);

			if(ext === ".json" || ext === ".html" || ext === ".pug") {
				var name = path.basename(cur, ext);
				ext = ext.slice(1);

				if(map.has(name)) {
					map.get(name)[ext] = cur;
				} else {
					map.set(name, {[ext]: cur});
				}
			}

			return map;
		}, new Map());
	}).catch(function(err){
		console.log(err);
	});

	var promisedDefaultLocals = promiseFS(fs.readFile, defaultsJSON, "utf8").then(function(data) {
		return JSON.parse(data);
	});

	return Promise.all([compiledDefaultTemplate, promisedTestCases, promisedDefaultLocals]);
}
