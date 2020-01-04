import * as THREE from './build/three.module.js'
import { OrbitControls } from './three/jsm/controls/OrbitControls.js'
import { TransformControls } from './three/jsm/controls/TransformControls.js'

// https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

export class Interaction {
  constructor (element, config, { showGrid, showOutlines, editMode, onchange } = {}) {
    this.element = element
    this.onchange = onchange
    this.config = config
    this.showOutlines = false //; showOutlines
    this.showGrid = showGrid
    this.editMode = editMode
    
    this.camera = new THREE.PerspectiveCamera(60, this.element.clientWidth / this.element.clientHeight, 1, 1000)
    this.camera.position.set(200, 200, 200)
    this.scene = new THREE.Scene()

    // color and fog
    this.scene.background = new THREE.Color(0xffffff)
    // this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002)

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.element.clientWidth, this.element.clientHeight)

    this.element.appendChild(this.renderer.domElement)

    // lights
    let light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1)
    this.scene.add(light)

    light = new THREE.DirectionalLight(0x002288)
    light.position.set(-1, -1, -1)
    this.scene.add(light)

    light = new THREE.AmbientLight(0x222222)
    this.scene.add(light)

    // axes
    // var axes = new THREE.AxesHelper(100)
    // this.scene.add(axes)

    // grid
    if (showGrid) {
      const gridXZ = new THREE.GridHelper(1000, 10, 0xff3a6b, 0x28274d)
      this.scene.add(gridXZ)
    }

    // controls
    this.orbitControl = new OrbitControls(this.camera, this.renderer.domElement)
    this.orbitControl.enableDamping = true
    this.orbitControl.dampingFactor = 0.05
    this.orbitControl.screenSpacePanning = false
    this.orbitControl.enableZoom = true

    // materials
    this.surfaceMaterial = new THREE.MeshBasicMaterial({ color: 0xffe700 })
    this.lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } )
    this.outlineMaterial = new THREE.LineBasicMaterial( { color: 0x28274d } )

    // base group
    this.group = new THREE.Group()
    this.scene.add(this.group)


    if (this.editMode) {
      this.transformControl = new TransformControls(this.camera, this.renderer.domElement)
      if (this.orbitControl) {
        this.transformControl.addEventListener('dragging-changed', (event) => {
          this.orbitControl.enabled = ! event.value
        })
      }
      this.scene.add(this.transformControl)
      this.transformControl.setMode("scale")
      this.transformControl.size = 1

      const debouncedUpdateConfig = debounce(() => this.updateConfig(), 300)
      this.transformControl.addEventListener('objectChange', debouncedUpdateConfig)
    }


    window.addEventListener('resize', () => this.updateSize(), false)

    this.updateSize()
  }

  updateConfig () {
    const center = new THREE.Vector3()
    const box = new THREE.Box3().setFromObject(this.shape)
    const size = box.getSize(center)

    this.config.height = size.y
    this.config.length = size.z
    this.config.width = size.x

    this.onchange()
  }

  buildShape (model) {
    const geometry = new THREE.BoxGeometry(model.width, model.height, model.length)

    const edges = new THREE.EdgesGeometry(geometry)
    const line = new THREE.LineSegments(edges, this.outlineMaterial)
    line.position.y = model.height/2

    return line
  }

  updateOutline (model) {
    const oldLine = this.group.getObjectByName('overall-outline')
    if (oldLine) {
      this.group.remove(oldLine)
    }

    const geometry = new THREE.BoxGeometry(model.width, model.height, model.length)

    const edges = new THREE.EdgesGeometry(geometry)
    const line = new THREE.LineSegments(edges, this.outlineMaterial)
    line.position.y = model.height/2
    line.name = 'overall-outline'

    this.group.add(line)
  }

  updatePart (model, part) {
    let oldPartGroup = this.group.getObjectByName(part.id)
    if (part.rebuild && oldPartGroup) {
      this.group.remove(oldPartGroup)
      oldPartGroup = new THREE.Group()
      this.group.add(oldPartGroup)
    }
    if (part.laths.length > 0) {
      const partGroup = oldPartGroup || new THREE.Group()
      partGroup.name = part.id
    
      partGroup.position.x = part.x
      partGroup.position.y = part.y
      partGroup.position.z = part.z
      if (part.rotation && part.rotation.x) partGroup.rotation.x = part.rotation.x
      if (part.rotation && part.rotation.y) partGroup.rotation.y = part.rotation.y
      if (part.rotation && part.rotation.z) partGroup.rotation.z = part.rotation.z

      part.laths.map(lath => this.updateLath(model, lath, partGroup))
      
      if (!oldPartGroup) this.group.add(partGroup)
    }
  }

  updateLath (model, lath, partGroup) {
    const oldGroup = partGroup.getObjectByName(lath.id)
    const group = oldGroup || new THREE.Group()
    group.name = lath.id

    group.position.x = lath.x
    group.position.y = lath.y
    group.position.z = lath.z
    group.rotation.z = lath.rotation

    // line
    // const lineGeometry = new THREE.Geometry()
    // lineGeometry.vertices.push(
    //   new THREE.Vector3(0, 0, 0),
    //   new THREE.Vector3(lath.length, 0, 0)
    // )
    // const line = new THREE.Line(lineGeometry, this.lineMaterial)
    // line.position.y = model.q2/2
    // group.add(line)

    const geometry = new THREE.BoxGeometry(lath.length, model.q2, model.q1)
    
    // surface
    const oldMesh = group.getObjectByName('surface')
    const surfaceMaterial = this.surfaceMaterial
    const mesh = oldMesh || new THREE.Mesh(geometry, this.surfaceMaterial)
    if (oldMesh) {
      mesh.geometry = geometry
    } else {
      mesh.name = 'surface'
    }
    mesh.position.x = lath.length/2
    mesh.position.y = model.q2/2
    mesh.position.z = model.q1/2
    if (!oldMesh) group.add(mesh)

    // outlines
    const outlineGeometry = new THREE.EdgesGeometry(geometry)
    const oldOutline = group.getObjectByName('outline')
    const outline = oldOutline || new THREE.LineSegments(outlineGeometry, this.lineMaterial)
    if (oldOutline) {
      outline.geometry = outlineGeometry
    } else {
      outline.name = 'outline'
    }
    outline.position.x = lath.length/2
    outline.position.y = model.q2/2
    outline.position.z = model.q1/2
    if (!oldOutline) group.add(outline)

    if (!oldGroup) partGroup.add(group)
  }

  update (model, parts = model.parts) {
    if (this.showOutlines) this.updateOutline(model)
    Object.values(parts).map(part => this.updatePart(model, part))

    if (this.editMode) {
      if (this.shape) {
        this.scene.remove(this.shape)
        this.transformControl.detach(this.shape)
      }
      this.shape = this.buildShape(model)
      this.scene.add(this.shape)
      this.transformControl.attach(this.shape)
    }
    
    // model.parts.board.laths.map(lath => this.updateLath(model, lath, this.group))
    // model.parts.keel.laths.map(lath => this.updateLath(model, lath, this.group))
    // model.parts['side-left'].laths.map(lath => this.updateLath(model, lath, this.group))
  }

  render () {
    this.renderer.render(this.scene, this.camera)
    if (this.orbitControl) {
      this.orbitControl.update()
    }
  }

  updateSize () {
    this.camera.aspect = this.element.clientWidth / this.element.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.element.clientWidth, this.element.clientHeight)
  }
  
  destroy () {
    // TODO check if three cleans up itself :D when element is removed from dom
    this.element.innerHTML = ''
  }
}
