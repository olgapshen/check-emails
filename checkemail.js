const	emailExistence = require('email-existence'),
		fs = require('fs'),
		readable = require('co-readable'),
		co = require('co'),
		async = require('async');

const read = readable(fs.createReadStream('addresses'));

co(function* () {
	let data;
	//let size = 0;
	var remaining = '';
	var items = [];
	
	while (data = yield read(1024)) {
		remaining += data;
		var index = remaining.indexOf('\n');
		
		while (index > -1) {
			var line = remaining.substring(0, index);
			remaining = remaining.substring(index + 1);
			items.push(line);
			index = remaining.indexOf('\n');
		}
	}
	
	if (remaining.length > 0) {
		items.push(remaining);
	}
	
	//console.log(items);
	
	async.each(
		items, 
		function(email, callback) {
			emailExistence.check(email, function (err, res) {
				if (err) {
					callback(err);
				} else {
					console.log(email + ': ' + res);
					callback();
				}
			});
		},
		function(err) {
			if (err) {
				console.error(err);
			} else {
				console.log("Done");
			}
		}
	);
}).catch(function (err) {
  console.error(err.stack);
});