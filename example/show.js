var regl = require('regl')({ extensions: [ 'oes_element_index_uint' ] })
var camera = require('regl-camera')(regl, { distance: 5 })
var resl = require('resl')
var parseBGA = require('parse-bga-mesh')

resl({
  manifest: {
    test: { src: 'test.bga', type: 'binary', parser: parser }
  },
  onDone: ready
})

function parser (abuf) {
  return Object.assign(parseBGA(abuf), {
    arrayBuffer: abuf,
    reglBuffer: regl.buffer({
      data: abuf,
      usage: 'static',
      type: 'float32'
    })
  })
}

function ready (assets) {
  var draw = regl({
    frag: `
      precision highp float;
      varying vec3 vnorm;
      void main () {
        vec3 N = normalize(vnorm);
        vec3 L0 = normalize(vec3(0.2,1,-0.2));
        vec3 L1 = normalize(vec3(0.8,0.2,0.5));
        vec3 L2 = normalize(vec3(-0.3,-0.5,-0.8));
        float d = max(0.0,max(dot(N,L0),max(dot(N,L1),dot(N,L2))));
        vec3 color = vec3(d);
        gl_FragColor = vec4(color,1);
      }
    `,
    vert: `
      precision highp float;
      uniform mat4 projection, view;
      attribute vec3 position, normal;
      varying vec3 vnorm;
      void main () {
        vnorm = normal;
        vec3 vpos = (position+vec3(0,18,0))*0.01;
        gl_Position = projection * view * vec4(vpos,1);
      }
    `,
    attributes: {
      position: regl.prop('positions'),
      normal: regl.prop('normals')
    },
    elements: regl.prop('cells'),
    count: regl.prop('count')
  })
  var props = {
    positions: {
      buffer: assets.test.reglBuffer,
      offset: assets.test.data.vertex.position.offset,
      stride: assets.test.data.vertex.position.stride
    },
    normals: {
      buffer: assets.test.reglBuffer,
      offset: assets.test.data.vertex.normal.offset,
      stride: assets.test.data.vertex.normal.stride
    },
    cells: new Uint32Array(
      assets.test.arrayBuffer,
      assets.test.data.triangle.cell.offset,
      assets.test.data.triangle.cell.count
        * assets.test.data.triangle.cell.quantity
    ),
    count: assets.test.data.triangle.cell.count
      * assets.test.data.triangle.cell.quantity
  }
  regl.frame(function () {
    camera(function () {
      draw(props)
    })
  })
}
