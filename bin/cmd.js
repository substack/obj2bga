#!/usr/bin/env node
var obj2bga = require('../')
var fs = require('fs')
var concat = require('concat-stream')

var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    i: 'infile',
    e: 'endian',
    positions: 'position',
    normals: 'normal',
    texcoords: 'texcoord',
    cells: 'cell'
  },
  boolean: [ 'positions', 'normals', 'texcoords', 'cells' ],
  default: {
    infile: '-',
    endian: 'little',
    positions: true,
    normals: true,
    texcoords: true,
    cells: true
  }
})
if (argv.help) {
  fs.createReadStream(path.join(__dirname,'usage.txt'))
    .pipe(process.stdout)
  return
}

var infile = argv._[0] ? argv._[0] : argv.infile
var instream = infile === '-'
  ? process.stdin
  : fs.createReadStream(infile)

var opts = {
  buffers: argv.buffers
    ? argv.buffers.split(',')
    : [ 'position', 'normal', 'texcoord', 'cell' ]
      .filter(function (x) { return argv[x] })
}
instream.pipe(concat({ encoding: 'string' }, function (body) {
  process.stdout.write(Buffer.from(obj2bga(body, opts)))
}))
