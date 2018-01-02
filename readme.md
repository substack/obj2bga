# obj2bga

convert an OBJ file to [BGA][]

[BGA]: https://substack.neocities.org/bga.html

# usage

```
obj2bga OPTIONS < INFILE.obj > OUTFILE.bga

Read an obj file from stdin or a file path and produce a BGA
file as output with these buffers:

  vec3 vertex.position
  vec3 vertex.normal
  vec3 vertex.texcoord
  uint32 triangle.cell[3]

OPTIONS

  -h --help      show this message

  You can omit individual buffers:

  --no-position  omit poition data from output
  --no-normal    omit normal data from output
  --no-texcoord  omit texcoord data from output
  --no-cell      omit triangle elements from output

  Or set the buffer list with a comma-separated list

  --buffers=position,normal,texcoord,cell

```

# api

``` js
var obj2bga = require('obj2bga')
```

## var bgadata = obj2bga(objdata, opts)

Return a Uint8Array `bgadata` of BGA data from a string of `objdata`.

* `opts.endian` - `'big'` or `'little'` (default)
* `opts.buffers` - array of buffer names to include.
  default: `['position','normal','texcoord','cell']`

# install

to get the command-line tool:

```
npm install -g obj2bga
```

to get the library:

```
npm install obj2bga
```

# license

BSD
