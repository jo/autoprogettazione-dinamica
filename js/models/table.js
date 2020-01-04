const getDRotation = (config, initialAlpha, steps = 3) => {
  const dh = Math.sin(initialAlpha) * config.q2
  const dx = dh / Math.asin(initialAlpha)
  const alpha = Math.atan((config.width/2 - config.q1/2 - config.q2 - dx)/(config.height - dh))

  return steps > 0 ? getDRotation(config, alpha, steps-1) : { alpha, dh, dx }
}


export class Table {
  constructor (config) {
    this.length = config.length
    this.height = config.height
    this.q1 = config.q1
    this.q2 = config.q2

    this.an = Math.round(config.width/this.q2)
    this.width = this.an * this.q2

    this.krag = 2 * this.q2


    const sidePartLeft = new SidePart(this)
    const sidePartRight = new SidePart(this)
    const keelPart = new KeelPart(this)
    const boardPart = new BoardPart(this)


    const sideRight = {
      id: 'side-right',
      x: -this.width/2,
      y: 0,
      z: -this.length/2 + this.krag,
      laths: sidePartLeft.laths
    }
    const sideLeft = {
      id: 'side-left',
      x: this.width/2,
      y: 0,
      z: this.length/2 - this.krag,
      laths: sidePartLeft.laths,
      rotation: {
        y: Math.PI
      }
    }
    const keel = {
      id: 'keel',
      x: -this.q1/2,
      y: 0,
      z: this.length/2,
      laths: keelPart.laths,
      rotation: {
        y: Math.PI/2
      }
    }
    const board = {
      id: 'board',
      rebuild: true,
      x: this.width/2,
      y: this.height,
      z: -this.length/2,
      rotation: {
        x: Math.PI/2,
        z: Math.PI/2
      },
      laths: boardPart.laths
    }

    this.parts = {
      'side-left': sideLeft,
      'side-right': sideRight,
      'keel': keel,
      'board': board
    }

    this.laths = Object.values(this.parts)
      .reduce((memo, part) => memo.concat(part.laths), [])

    this.lengths = this.laths
      .reduce((memo, lath) => {
        const key = lath.name
        memo[key] = memo[key] || { length: lath.length, count: 0 }
        memo[key].count += 1
        return memo
      }, {})

    this.totalLength = this.laths
      .reduce((memo, lath) => memo + lath.length, 0)
  }
}


// Side

//  ===//||C||\\===
//    D/ F| F| \D
//   //====E====\\
//  //           \\

class SidePart {
  constructor (table) {
    this.height = table.height
    this.width = table.width
    this.q1 = table.q1
    this.q2 = table.q2

    const rotation = getDRotation(this, 15*Math.PI/180)
    const dxe = Math.tan(rotation.alpha) * (5*this.q2 - this.q2)
    const el = 2*(this.q1/2 + this.q2 + rotation.dx + dxe)

    const dxc = Math.tan(rotation.alpha) * (this.height/2 - rotation.dh/2)
    const dx = this.q1/2 + rotation.dx/4 + dxc
    const dl = (this.height - this.q1) / Math.cos(rotation.alpha) - rotation.dh
    
    this.c = {
      id: 'c',
      name: 'C',
      length: this.width,
      x: 0,
      y: this.height - this.q1 - this.q2,
      z: 0,
      rotation: 0
    }
    const ddx = this.q2 - Math.sin(rotation.alpha) * this.q2
    const ddy = Math.tan(rotation.alpha) * this.q2
    this.dl = {
      id: 'dl',
      name: 'D',
      length: dl,
      x: this.width/2 - this.q1/2 - 2*this.q2,
      y: this.height - this.q1,
      z: this.q1,
      rotation: -Math.PI/2 - rotation.alpha
    }
    this.dr = {
      id: 'dr',
      name: 'D',
      length: dl,
      x: this.width/2 + this.q1/2 + this.q2,
      y: this.height - this.q1 - rotation.dh,
      z: this.q1,
      rotation: -Math.PI/2 + rotation.alpha
    }

    this.e = {
      id: 'e',
      name: 'E',
      length: el,
      x: (this.width - el)/2,
      y: this.height - this.q1 - 5*this.q2,
      z: 0,
      rotation: 0
    }

    this.fl = {
      id: 'fl',
      name: 'F',
      length: 5*this.q2,
      x: this.width/2 - this.q1/2 - this.q2,
      y: this.height - this.q1,
      z: this.q1,
      rotation: -Math.PI/2
    }
    this.fr = {
      id: 'fr',
      name: 'F',
      length: 5*this.q2,
      x: this.width/2 + this.q1/2,
      y: this.height - this.q1,
      z: this.q1,
      rotation: -Math.PI/2
    }


    this.laths = [
      this.c,
      this.dl, this.dr,
      this.fl, this.fr,
      this.e
    ]
  }
}


// Keel

//   ||==//==B==\\==||
//   |G /G       \G |G
//   ||//====B====\\||

class KeelPart {
  constructor (table) {
    this.krag = table.krag
    this.length = table.length
    this.height = table.height
    this.width = table.width
    this.q1 = table.q1
    this.q2 = table.q2

    const dx = this.krag - this.q2
    
    this.bt = {
      id: 'bt',
      name: 'B',
      length: this.length - 2*dx,
      x: dx,
      y: this.height - this.q1 - 2*this.q2,
      z: 0,
      rotation: 0
    }
    this.bb = {
      id: 'bb',
      name: 'B',
      length: this.length - 2*dx,
      x: dx,
      y: this.height - this.q1 - 4*this.q2,
      z: 0,
      rotation: 0
    }
    this.gl = {
      id: 'gl',
      name: 'G',
      length: 3*this.q2,
      x: this.krag + 2*this.q1 + this.q2,
      y: this.height - this.q1 - 4*this.q2,
      z: this.q1,
      rotation: Math.PI/2
    }
    
    const gdx = this.q2 - Math.sin(Math.PI/4) * this.q2
    const gdy = this.q2 - Math.cos(Math.PI/4) * this.q2
    this.gsl = {
      id: 'gsl',
      name: 'G',
      length: 3*this.q2,
      x: this.krag + 2*this.q1 + 2*this.q2,
      y: this.height - this.q1 - 4*this.q2,
      z: this.q1,
      rotation: Math.PI/4
    }
    this.gsr = {
      id: 'gsr',
      name: 'G',
      length: 3*this.q2,
      // FIXME
      x: this.length - this.krag - 2*this.q1 - 1.2*this.q2,
      y: this.height - this.q1 - 3.2*this.q2,
      z: this.q1,
      rotation: 3*Math.PI/4
    }
    this.gr = {
      id: 'gr',
      name: 'G',
      length: 3*this.q2,
      x: this.length - this.krag - 2*this.q1,
      y: this.height - this.q1 - 4*this.q2,
      z: this.q1,
      rotation: Math.PI/2
    }


    this.laths = [
      this.bt, this.bb,
      this.gl, this.gsl, this.gsr, this.gr
    ]
  }
}


// Board

//  =||======A======||=
//  =|C======A======|C=
//  =||======A======||=

class BoardPart {
  constructor (table) {
    this.krag = table.krag
    this.length = table.length
    this.height = table.height
    this.width = table.width
    this.q1 = table.q1
    this.q2 = table.q2
    
    const n = Math.round(this.width / this.q2)

    this.cl = {
      id: 'cl',
      name: 'C',
      length: this.width,
      x: this.krag,
      y: 0,
      z: this.q1,
      rotation: Math.PI/2
    }
    this.cr = {
      id: 'cr',
      name: 'C',
      length: this.width,
      x: this.length - this.krag + this.q2,
      y: 0,
      z: this.q1,
      rotation: Math.PI/2
    }
    this.as = []
    for (let i = 0; i < n; i++) {
      this.as.push({
        id: `a${i+1}`,
        name: 'A',
        length: this.length,
        x: 0,
        y: i*this.q2,
        z: 0,
        rotation: 0
      })
    }


    this.laths = [
      this.cl, this.cr,
      ...this.as
    ]
  }
}
