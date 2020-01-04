import { Config } from './config.js'
import { Presets } from './presets.js'
import { Table } from './models/table.js'
import { Interaction } from './interaction.js'
import { Plan } from './plan.js'
import { Configurator } from './configurator.js'
import * as THREE from './build/three.module.js'

class IntroductionView {
  constructor (config, { article }) {
    this.element = article
    
    const preset = Presets.original
    this.config = new Config(preset)

    this.interaction = new Interaction(this.element, this.config)

    const material = new THREE.MeshBasicMaterial({ color: 0x28274d })
    const geometry = new THREE.PlaneGeometry(1000, 1000)
    const plane = new THREE.Mesh(geometry, material)
    plane.rotation.x = -Math.PI/2
    this.interaction.scene.add(plane)

    this.interaction.lineMaterial = new THREE.LineBasicMaterial( { color: 0x28274d } )
    this.interaction.orbitControl.autoRotate = true

    this.sizes = [
      { length: 201, height: 71, width: 81, q1: 2.1, q2: 10.1 },
      { length: 350, height: 100, width: 120, q1: 4.0, q2: 16.0 },
      { length: 100, height: 150, width: 70, q1: 4.0, q2: 6.0 },
      { length: 120, height: 40, width: 40, q1: 4.0, q2: 4.0 },
      { length: 60, height: 20, width: 30, q1: 0.6, q2: 1.6 }
    ]

    this.currentSize = 0
    this.readyForNext = {}
    
    this.updateCount = 0
    this.variateDiemensions = false

    this.update()
    this.animate()
  }

  update () {
    const model = new Table(this.config)

    const gap = 0.1

    let parts = Object.keys(model.lengths)
        .sort()
        .reverse()
        .reduce((memo, name, i) => {
          memo[name] = {
            id: `${name}-laths`,
            rebuild: true,
            x: model.width/2 + 20 + 7*(model.q2 + gap),
            y: 0,
            z: model.length / 2,
            rotation: {
              x: -Math.PI/2,
              z: Math.PI/2
            },
            laths: model.laths
              .filter(lath => lath.name === name)
              .map((lath, j) => ({
                id: lath.id,
                name: lath.name,
                length: lath.length,
                y: i * (model.q2 + gap),
                x: 0,
                z: j * (model.q1 + gap),
                rotation: null
              }))
            }
          
          return memo
        }, {})

    if (this.updateCount < 50) {
    } else if (this.updateCount < 150) {
      parts = {
        ...parts,
        keel: model.parts.keel,
        'side-left': { id: 'side-left', rebuild: true, laths: [] },
        'side-right': { id: 'side-right', rebuild: true, laths: [] },
        'board': { id: 'board', rebuild: true, laths: [] }
      }
      this.updateCount += 1
    } else if (this.updateCount < 200) {
      parts = {
        ...parts,
        keel: model.parts.keel,
        'side-right': model.parts['side-right'],
        'side-left': model.parts['side-left'],
        'board': { id: 'board', rebuild: true, laths: [] }
      }
      this.updateCount += 1
    } else if (this.updateCount < 250) {
      parts = {
        ...parts,
        ...model.parts
      }
      this.updateCount += 1
    } else {
      this.variateDiemensions = true
      parts = {
        ...parts,
        ...model.parts
      }
    }

    this.interaction.update(model, parts)
    
    this.updateCount += 1
  }

  get nextSize () {
    return (this.currentSize === (this.sizes.length - 1)) ? 0 : (this.currentSize + 1)
  }

  animate () {
    const step = 1
    requestAnimationFrame(this.animate.bind(this))

    if (this.variateDiemensions) {
      const currentSize = this.sizes[this.currentSize]

      if (currentSize.length === this.config.length) {
        this.readyForNext.length = true
      } else if (currentSize.length > this.config.length) {
        this.config.length += step
      } else {
        this.config.length -= step
      }

      if (currentSize.height === this.config.height) {
        this.readyForNext.height = true
      } else if (currentSize.height > this.config.height) {
        this.config.height += step
      } else {
        this.config.height -= step
      }
      
      if (currentSize.width === this.config.width) {
        this.readyForNext.width = true
      } else if (currentSize.width > this.config.width) {
        this.config.width += step
      } else {
        this.config.width -= step
      }
      
      if (Math.round(currentSize.q1*100) === Math.round(this.config.q1*100)) {
        this.readyForNext.q1 = true
      } else if (currentSize.q1 > this.config.q1) {
        this.config.q1 += step/10
      } else {
        this.config.q1 -= step/10
      }
      
      if (Math.round(currentSize.q2*100) === Math.round(this.config.q2*100)) {
        this.readyForNext.q2 = true
      } else if (currentSize.q2 > this.config.q2) {
        this.config.q2 += step/10
      } else {
        this.config.q2 -= step/10
      }
      
      if (this.readyForNext.width && this.readyForNext.height && this.readyForNext.length && this.readyForNext.q1 && this.readyForNext.q2 ) {
        this.currentSize = this.nextSize
        this.readyForNext = {}
      }
    }

    this.update()

    this.interaction.render()
  }

  destroy () {
    this.interaction.destroy()
  }
}

class InteractionView {
  constructor (config, { article, aside }) {
    this.config = config
    this.element = article
    this.aside = aside
    
    this.configurator = new Configurator(this.aside, this.config, this.update.bind(this))
    this.interaction = new Interaction(this.element, this.config, {
      showGrid: true,
      showOutlines: true,
      editMode: true,
      onchange: () => {
        this.update()
        this.configurator.update()
      }
    })

    this.update()
    this.animate()
  }

  update () {
    const model = new Table(this.config)

    this.interaction.update(model)
  }

  animate () {
    requestAnimationFrame(this.animate.bind(this))

    this.interaction.render()
  }

  destroy () {
    this.interaction.destroy()
    this.aside.innerHTML = ''
  }
}

class ConstructionView {
  constructor (config, { article }) {
    this.config = config
    this.element = article

    const div = document.createElement('div')
    div.className = 'frame'
    const planDiv = document.createElement('div')
    planDiv.id = 'plan-div'
    div.appendChild(planDiv)
    const tableDiv = document.createElement('div')
    tableDiv.id = 'table-div'
    div.appendChild(tableDiv)
    this.element.appendChild(div)
    
    this.plan = new Plan(this.config, this.element)
  }

  destroy () {
    this.element.innerHTML = ''
  }
}

class AbstractView {
  constructor (config, { article, thoughtsTemplate }) {
    this.element = article
    this.element.innerHTML = thoughtsTemplate.innerHTML
  }

  destroy () {
    this.element.innerHTML = ''
  }
}

class HelpView {
  constructor (config, { article, helpTemplate }) {
    this.element = article
    this.element.innerHTML = helpTemplate.innerHTML
  }

  destroy () {
    this.element.innerHTML = ''
  }
}

const Views = {
  'introduction': IntroductionView,
  'interaction': InteractionView,
  'construction': ConstructionView,
  'abstract': AbstractView,
  'help': HelpView
}

export class App {
  constructor (elements) {
    this.elements = elements

    const preset = Presets.original
    this.config = new Config(preset)

    window.Config = Config
    
    window.onhashchange = this.onhashchange.bind(this)
    this.onhashchange()
  }

  setView (value) {
    if (this.view && typeof this.view.destroy === 'function') this.view.destroy()
    const name = value in Views ? value : 'introduction'
    this.elements.article.className = name
    const View = Views[name]
    this.view = new View(this.config, this.elements)
  }

  onhashchange () {
    this.setView(location.hash.slice(1))
  }
}
