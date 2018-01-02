var obj2bga = require('../')
var fs = require('fs')

var objdata = fs.readFileSync(process.argv[2], 'utf8')
process.stdout.write(Buffer.from(obj2bga(objdata)))
