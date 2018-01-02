#!/usr/bin/env node
var obj2bga = require('../')
var fs = require('fs')
var concat = require('concat-stream')

var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  alias: { i: 'infile' },
  default: { infile: '-' }
})
var infile = argv._[0] ? argv._[0] : argv.infile

var instream = infile === '-'
  ? process.stdin
  : fs.createReadStream(infile)

instream.pipe(concat({ encoding: 'string' }, function (body) {
  process.stdout.write(Buffer.from(obj2bga(body)))
}))
