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
	
	console.log(items.length);
	return;
	
	async.eachLimit(
		items, 
		10,
		function(email, callback) {
			if (email) {
				emailExistence.check(email, function (err, res) {
					try {
						if (err) {
							console.error(err);
							fs.appendFileSync('output/error', email + '\r\n');
						} else if (res){
							fs.appendFileSync('output/valid', email + '\r\n');
						} else {
							fs.appendFileSync('output/invalid', email + '\r\n');
						}
					} catch (err) {
						console.error(err);
					}
					
					callback();
				});
			} else {				
				callback();
			}
		},
		function(err) {
			if (err) {
				console.error(err);
				console.log("Failed");
			} else {
				console.log("Done");
			}
		}
	);
}).catch(function (err) {
	console.error(err);
	console.log("Failed");
});
