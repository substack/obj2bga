var createBGA = require('create-bga-mesh')
var defined = require('defined')
var missing3 = [NaN,NaN,NaN]
var anormals = require('angle-normals')

var alias = {
  position: 'vertex.position',
  positions: 'vertex.position',
  normal: 'vertex.normal',
  normals: 'vertex.normal',
  texcoord: 'vertex.texcoord',
  texcoords: 'vertex.texcoord',
  cell: 'triangle.cell',
  cells: 'triangle.cell'
}

module.exports = function (obj, opts) {
  if (!opts) opts = {}
  var lines = obj.split('\n')
  var mesh = {
    positions: [],
    cells: [],
    normals: [],
    texcoords: []
  }
  var vertices = []
  var normals = []
  var texcoords = []
  var missingNormals = false
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (/^(?:#|$)/.test(line)) continue
    var parts = line.trim().split(/\s+/)
    if (parts[0] === 'v') {
      var v = new Array(3)
      v[0] = 0
      v[1] = 0
      v[2] = 0
      for (var j = 1; j < parts.length; j++) {
        v[j-1] = Number(parts[j])
      }
      vertices.push(v)
    } else if (parts[0] === 'vn') {
      var vn = new Array(3)
      vn[0] = 0
      vn[1] = 0
      vn[2] = 0
      for (var j = 1; j < parts.length; j++) {
        vn[j-1] = Number(parts[j])
      }
      normals.push(vn)
    } else if (parts[0] === 'vt') {
      var vt = new Array(3)
      vt[0] = 0
      vt[1] = 0
      vt[2] = 0
      for (var j = 1; j < parts.length; j++) {
        vt[j-1] = Number(parts[j])
      }
      texcoords.push(vt)
    } else if (parts[0] === 'f') {
      var fv = new Array(parts.length-1)
      var fn = new Array(parts.length-1)
      var ft = new Array(parts.length-1)
      for (var j = 1; j < parts.length; j++) {
        var sp = parts[j].split('/')
        fv[j-1] = Number(sp[0])-1
        fn[j-1] = Number(sp[1])-1
        ft[j-1] = Number(sp[2])-1
      }
      for (var j = 2; j < fv.length; j++) {
        var v0 = defined(vertices[fv[0]],missing3)
        var v1 = defined(vertices[fv[j-1]],missing3)
        var v2 = defined(vertices[fv[j]],missing3)
        var n0 = defined(normals[fv[0]],missing3)
        var n1 = defined(normals[fv[j-1]],missing3)
        var n2 = defined(normals[fv[j]],missing3)
        var t0 = defined(texcoords[ft[0]],missing3)
        var t1 = defined(texcoords[ft[j]],missing3)
        var t2 = defined(texcoords[ft[j-1]],missing3)
        if (n0 === missing3 || n1 === missing3 || n2 === missing3) {
          missingNormals = true
        }
        var k = mesh.positions.length
        mesh.positions.push(v0,v1,v2)
        mesh.normals.push(n0,n1,n2)
        mesh.texcoords.push(t0,t1,t2)
        mesh.cells.push([k+0,k+1,k+2])
      }
    }
  }
  if (missingNormals) {
    var anorms = anormals(mesh.cells, mesh.positions)
    for (var i = 0; i < mesh.normals.length; i++) {
      if (mesh.normals[i] === missing3) {
        mesh.normals[i] = anorms[i]
      }
    }
  }
  var bufnames = opts.buffers && opts.buffers.map(function (bufname) {
    return alias[bufname]
  })
  return createBGA({
    endian: opts.endian || 'little',
    buffers: [
      { type: 'vec3', name: 'vertex.position', data: mesh.positions },
      { type: 'vec3', name: 'vertex.normal', data: mesh.normals },
      { type: 'vec3', name: 'vertex.texcoord', data: mesh.texcoords },
      { type: 'uint32[3]', name: 'triangle.cell', data: mesh.cells }
    ].filter(function (buffer) {
      return bufnames ? bufnames.indexOf(buffer.name) >= 0 : true
    })
  })
}
