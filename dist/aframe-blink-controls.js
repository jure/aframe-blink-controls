/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

/* global THREE, AFRAME  */

// Adapted from https://github.com/fernandojsg/aframe-teleport-controls
// Additions: Teleport rotation, parabolic root calculation, bindings, fix for triangle strip draw mode
// Removals: Line teleport
// WARNING: Super early! Currently only tested with Oculus Touch controllers

AFRAME.registerGeometry('prism', {
  schema: {
    depth: { default: 1, min: 0 },
    height: { default: 1, min: 0 },
    width: { default: 1, min: 0 }
  },

  init: function (data) {
    const shape = new THREE.Shape()
    shape.moveTo(data.width / 2, 0)
    shape.lineTo(0, data.height)
    shape.lineTo(-data.width / 2, 0)
    shape.lineTo(data.width / 2, 0)

    const extrudeSettings = {
      steps: 2,
      depth: data.depth,
      bevelEnabled: false
    }
    this.geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }
})

// WIP: Controller bindings cheat sheet
// For HTC Vive: trackpaddown and trackpadup with axismove
// For Oculus Touch: thumbstickdown and thumbstickup, with thumbstick event and evt.detail.y and evt.detail.x
// For Valve Index (maybe): touchstart, touchend, axismove?

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.')
}

AFRAME.registerComponent('blink-controls', {
  schema: {
    button: { default: 'thumbstick', oneOf: ['trackpad', 'trigger', 'grip', 'menu', 'thumbstick'] },
    startEvents: { type: 'array', default: ['thumbstickdown', 'trackpaddown'] },
    endEvents: { type: 'array', default: ['thumbstickup', 'trackpadup'] },
    collisionEntities: { default: '' },
    hitEntity: { type: 'selector' },
    cameraRig: { type: 'selector', default: '#player' },
    teleportOrigin: { type: 'selector', default: '#camera' },
    hitCylinderColor: { type: 'color', default: '#4d93fd' },
    hitCylinderRadius: { default: 0.25, min: 0 },
    hitCylinderHeight: { default: 0.3, min: 0 },
    interval: { default: 0 },
    curveNumberPoints: { default: 50, min: 2 },
    curveLineWidth: { default: 0.025 },
    curveHitColor: { type: 'color', default: '#4d93fd' },
    curveMissColor: { type: 'color', default: '#ff0000' },
    curveShootingSpeed: { default: 10, min: 0 },
    defaultPlaneSize: { default: 100 },
    landingNormal: { type: 'vec3', default: { x: 0, y: 1, z: 0 } },
    landingMaxAngle: { default: '45', min: 0, max: 360 },
    drawIncrementally: { default: true },
    incrementalDrawMs: { default: 500 },
    missOpacity: { default: 0.8 },
    hitOpacity: { default: 0.8 }
  },

  init: function () {
    const data = this.data
    const el = this.el
    let i

    this.active = false
    this.obj = el.object3D
    this.controllerPosition = new THREE.Vector3()
    this.hitEntityQuaternion = new THREE.Quaternion()
    this.hitPoint = new THREE.Vector3()
    this.rigWorldPosition = new THREE.Vector3()
    this.newRigWorldPosition = new THREE.Vector3()
    this.teleportEventDetail = {
      oldPosition: this.rigWorldPosition,
      newPosition: this.newRigWorldPosition,
      hitPoint: this.hitPoint,
      rotationQuaternion: this.hitEntityQuaternion
    }

    this.hit = false
    this.prevCheckTime = undefined
    this.prevHitHeight = 0
    this.referenceNormal = new THREE.Vector3()
    this.curveMissColor = new THREE.Color()
    this.curveHitColor = new THREE.Color()
    this.raycaster = new THREE.Raycaster()

    this.defaultPlane = this.createDefaultPlane(this.data.defaultPlaneSize)
    this.defaultCollisionMeshes = [this.defaultPlane]

    const teleportEntity = this.teleportEntity = document.createElement('a-entity')
    teleportEntity.classList.add('teleportRay')
    teleportEntity.setAttribute('visible', false)
    el.sceneEl.appendChild(this.teleportEntity)

    this.onButtonDown = this.onButtonDown.bind(this)
    this.onButtonUp = this.onButtonUp.bind(this)
    this.updateDirection = this.updateDirection.bind(this)

    this.teleportOrigin = this.data.teleportOrigin
    this.cameraRig = this.data.cameraRig

    if (this.data.startEvents.length && this.data.endEvents.length) {
      for (i = 0; i < this.data.startEvents.length; i++) {
        el.addEventListener(this.data.startEvents[i], this.onButtonDown)
      }
      for (i = 0; i < this.data.endEvents.length; i++) {
        el.addEventListener(this.data.endEvents[i], this.onButtonUp)
      }
    } else {
      el.addEventListener(data.button + 'down', this.onButtonDown)
      el.addEventListener(data.button + 'up', this.onButtonUp)
    }

    // Special case for thumbstickmoved (on Oculus Touch)
    if (this.data.startEvents && this.data.startEvents.includes('thumbstickdown')) {
      el.addEventListener('thumbstickmoved', this.updateDirection)
    }

    this.queryCollisionEntities()
  },

  updateDirection: function (evt) {
    // console.log('Y (up is -):', evt.detail.y)
    // console.log('X (left is -):', evt.detail.x)

    if (evt.detail.x && evt.detail.y) {
      const rotation = Math.atan2(evt.detail.x, evt.detail.y) + Math.PI
      this.obj.getWorldPosition(this.controllerPosition)
      this.controllerPosition.setComponent(1, this.hitEntity.object3D.position.y)
      this.hitEntity.object3D.lookAt(this.controllerPosition)
      this.hitEntity.object3D.rotateY(rotation)
      this.hitEntity.object3D.getWorldQuaternion(this.hitEntityQuaternion)
    }
  },
  update: function (oldData) {
    const data = this.data
    const diff = AFRAME.utils.diff(data, oldData)

    // Update normal.
    this.referenceNormal.copy(data.landingNormal)

    // Update colors.
    this.curveMissColor.set(data.curveMissColor)
    this.curveHitColor.set(data.curveHitColor)

    // Create or update line mesh.
    if (!this.line ||
        'curveLineWidth' in diff || 'curveNumberPoints' in diff || 'type' in diff) {
      this.line = this.createLine(data)
      this.line.material.opacity = this.data.hitOpacity
      this.line.material.transparent = this.data.hitOpacity < 1
      this.numActivePoints = data.curveNumberPoints
      this.teleportEntity.setObject3D('mesh', this.line.mesh)
    }

    // Create or update hit entity.
    if (data.hitEntity) {
      this.hitEntity = data.hitEntity
    } else if (!this.hitEntity || 'hitCylinderColor' in diff || 'hitCylinderHeight' in diff ||
               'hitCylinderRadius' in diff) {
      // Remove previous entity, create new entity (could be more performant).
      if (this.hitEntity) { this.hitEntity.parentNode.removeChild(this.hitEntity) }
      this.hitEntity = this.createHitEntity(data)
      this.el.sceneEl.appendChild(this.hitEntity)
    }
    this.hitEntity.setAttribute('visible', false)

    if ('collisionEntities' in diff) { this.queryCollisionEntities() }
  },

  remove: function () {
    const el = this.el
    const hitEntity = this.hitEntity
    const teleportEntity = this.teleportEntity

    if (hitEntity) { hitEntity.parentNode.removeChild(hitEntity) }
    if (teleportEntity) { teleportEntity.parentNode.removeChild(teleportEntity) }

    el.sceneEl.removeEventListener('child-attached', this.childAttachHandler)
    el.sceneEl.removeEventListener('child-detached', this.childDetachHandler)
  },

  tick: (function () {
    const p0 = new THREE.Vector3()
    const v0 = new THREE.Vector3()
    const g = -9.8
    const a = new THREE.Vector3(0, g, 0)
    const next = new THREE.Vector3()
    const last = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const translation = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const shootAngle = new THREE.Vector3()
    const lastNext = new THREE.Vector3()
    const auxDirection = new THREE.Vector3()
    let timeSinceDrawStart = 0

    return function (time, delta) {
      if (!this.active) { return }
      if (this.data.drawIncrementally && this.redrawLine) {
        this.redrawLine = false
        timeSinceDrawStart = 0
      }
      timeSinceDrawStart += delta
      this.numActivePoints = this.data.curveNumberPoints * timeSinceDrawStart / this.data.incrementalDrawMs
      if (this.numActivePoints > this.data.curveNumberPoints) {
        this.numActivePoints = this.data.curveNumberPoints
      }

      // Only check for intersection if interval time has passed.
      if (this.prevCheckTime && (time - this.prevCheckTime < this.data.interval)) { return }
      // Update check time.
      this.prevCheckTime = time

      const matrixWorld = this.obj.matrixWorld
      matrixWorld.decompose(translation, quaternion, scale)

      const direction = shootAngle.set(0, 0, -1)
        .applyQuaternion(quaternion).normalize()
      this.line.setDirection(auxDirection.copy(direction))
      this.obj.getWorldPosition(p0)

      last.copy(p0)

      // Set default status as non-hit
      this.teleportEntity.setAttribute('visible', true)
      this.line.material.color.set(this.curveMissColor)
      this.line.material.opacity = this.data.missOpacity
      this.line.material.transparent = this.data.missOpacity < 1
      this.hitEntity.setAttribute('visible', false)
      this.hit = false

      v0.copy(direction).multiplyScalar(this.data.curveShootingSpeed)

      this.lastDrawnIndex = 0
      const numPoints = this.data.drawIncrementally ? this.numActivePoints : this.line.numPoints
      for (let i = 0; i < numPoints + 1; i++) {
        let t
        if (i === Math.floor(numPoints + 1)) {
          t = numPoints / (this.line.numPoints - 1)
        } else {
          t = i / (this.line.numPoints - 1)
        }
        const timeToReach0 = this.parabolicCurveMaxRoot(p0, v0, a)
        t = t * Math.max(1, 1.5 * timeToReach0)

        this.parabolicCurve(p0, v0, a, t, next)
        // Update the raycaster with the length of the current segment last->next
        const dirLastNext = lastNext.copy(next).sub(last).normalize()
        this.raycaster.far = dirLastNext.length()
        this.raycaster.set(last, dirLastNext)

        this.lastDrawnPoint = next
        this.lastDrawnIndex = i
        if (this.checkMeshCollisions(i, last, next)) { break }

        last.copy(next)
      }
      for (let j = this.lastDrawnIndex + 1; j < this.line.numPoints; j++) {
        this.line.setPoint(j, this.lastDrawnPoint, this.lastDrawnPoint)
      }
    }
  })(),

  /**
   * Run `querySelectorAll` for `collisionEntities` and maintain it with `child-attached`
   * and `child-detached` events.
   */
  queryCollisionEntities: function () {
    const data = this.data
    const el = this.el

    if (!data.collisionEntities) {
      this.collisionEntities = []
      return
    }

    const collisionEntities = [].slice.call(el.sceneEl.querySelectorAll(data.collisionEntities))
    this.collisionEntities = collisionEntities

    // Update entity list on attach.
    this.childAttachHandler = function childAttachHandler (evt) {
      if (!evt.detail.el.matches(data.collisionEntities)) { return }
      collisionEntities.push(evt.detail.el)
    }
    el.sceneEl.addEventListener('child-attached', this.childAttachHandler)

    // Update entity list on detach.
    this.childDetachHandler = function childDetachHandler (evt) {
      if (!evt.detail.el.matches(data.collisionEntities)) { return }
      const index = collisionEntities.indexOf(evt.detail.el)
      if (index === -1) { return }
      collisionEntities.splice(index, 1)
    }
    el.sceneEl.addEventListener('child-detached', this.childDetachHandler)
  },

  onButtonDown: function () {
    this.active = true
    this.redrawLine = true
  },

  /**
   * Jump!
   */
  onButtonUp: (function () {
    const teleportOriginWorldPosition = new THREE.Vector3()
    const newRigLocalPosition = new THREE.Vector3()
    const newHandPosition = [new THREE.Vector3(), new THREE.Vector3()] // Left and right
    const handPosition = new THREE.Vector3()

    return function (evt) {
      if (!this.active) { return }

      // Hide the hit point and the curve
      this.active = false
      this.hitEntity.setAttribute('visible', false)
      this.teleportEntity.setAttribute('visible', false)

      if (!this.hit) {
        // Button released but not hit point
        return
      }

      const rig = this.data.cameraRig || this.el.sceneEl.camera.el
      rig.object3D.getWorldPosition(this.rigWorldPosition)
      this.newRigWorldPosition.copy(this.hitPoint)

      // If a teleportOrigin exists, offset the rig such that the teleportOrigin is above the hitPoint
      if (this.teleportOrigin) {
        this.teleportOrigin.object3D.getWorldPosition(teleportOriginWorldPosition)
        this.newRigWorldPosition.sub(teleportOriginWorldPosition).add(this.rigWorldPosition)
      }

      // Always keep the rig at the same offset off the ground after teleporting
      this.newRigWorldPosition.y = this.rigWorldPosition.y + this.hitPoint.y - this.prevHitHeight
      this.prevHitHeight = this.hitPoint.y

      // Finally update the rigs position
      newRigLocalPosition.copy(this.newRigWorldPosition)
      if (rig.object3D.parent) {
        rig.object3D.parent.worldToLocal(newRigLocalPosition)
      }
      rig.setAttribute('position', newRigLocalPosition)

      // Rotate the rig based on teleport rotation (which is equal to the hitEntity rotation)
      this.cameraRig.object3D.setRotationFromQuaternion(this.hitEntityQuaternion)

      // If a rig was not explicitly declared, look for hands and move them proportionally as well
      if (!this.data.cameraRig) {
        const hands = document.querySelectorAll('a-entity[tracked-controls]')
        for (let i = 0; i < hands.length; i++) {
          hands[i].object3D.getWorldPosition(handPosition)

          // diff = rigWorldPosition - handPosition
          // newPos = newRigWorldPosition - diff
          newHandPosition[i].copy(this.newRigWorldPosition).sub(this.rigWorldPosition).add(handPosition)
          hands[i].setAttribute('position', newHandPosition[i])
        }
      }

      this.el.emit('teleported', this.teleportEventDetail)
    }
  })(),

  /**
   * Check for raycaster intersection.
   *
   * @param {number} Line fragment point index.
   * @param {number} Last line fragment point index.
   * @param {number} Next line fragment point index.
   * @returns {boolean} true if there's an intersection.
   */
  checkMeshCollisions: function (i, last, next) {
    // @todo We should add a property to define if the collisionEntity is dynamic or static
    // If static we should do the map just once, otherwise we're recreating the array in every
    // loop when aiming.
    let meshes
    if (!this.data.collisionEntities) {
      meshes = this.defaultCollisionMeshes
    } else {
      meshes = this.collisionEntities.map(function (entity) {
        return entity.getObject3D('mesh')
      }).filter(function (n) { return n })
      meshes = meshes.length ? meshes : this.defaultCollisionMeshes
    }

    const intersects = this.raycaster.intersectObjects(meshes, true)
    if (intersects.length > 0 && !this.hit &&
        this.isValidNormalsAngle(intersects[0].face.normal)) {
      const point = intersects[0].point

      this.line.material.color.set(this.curveHitColor)
      this.line.material.opacity = this.data.hitOpacity
      this.line.material.transparent = this.data.hitOpacity < 1
      this.hitEntity.setAttribute('position', point)
      this.hitEntity.setAttribute('visible', true)

      this.hit = true
      this.hitPoint.copy(intersects[0].point)

      // If hit, just fill the rest of the points with the hit point and break the loop
      for (let j = i; j < this.line.numPoints; j++) {
        this.line.setPoint(j, last, this.hitPoint)
      }
      return true
    } else {
      this.line.setPoint(i, last, next)
      return false
    }
  },

  isValidNormalsAngle: function (collisionNormal) {
    const angleNormals = this.referenceNormal.angleTo(collisionNormal)
    return (THREE.Math.RAD2DEG * angleNormals <= this.data.landingMaxAngle)
  },

  // Utils
  // Parabolic motion equation, y = p0 + v0*t + 1/2at^2
  parabolicCurveScalar: function (p0, v0, a, t) {
    return p0 + v0 * t + 0.5 * a * t * t
  },

  // Parabolic motion equation applied to 3 dimensions
  parabolicCurve: function (p0, v0, a, t, out) {
    out.x = this.parabolicCurveScalar(p0.x, v0.x, a.x, t)
    out.y = this.parabolicCurveScalar(p0.y, v0.y, a.y, t)
    out.z = this.parabolicCurveScalar(p0.z, v0.z, a.z, t)
    return out
  },

  // To determine how long in terms of t we need to calculate
  parabolicCurveMaxRoot: function (p0, v0, a) {
    const root = (-v0.y - Math.sqrt(v0.y ** 2 - 4 * (0.5 * a.y) * p0.y)) / (2 * 0.5 * a.y)
    return root
  },

  createLine: function (data) {
    const numPoints = data.type === 'line' ? 2 : data.curveNumberPoints
    return new AFRAME.utils.RayCurve(numPoints, data.curveLineWidth)
  },

  /**
 * Create mesh to represent the area of intersection.
 * Default to a combination of torus and cylinder.
 */
  createHitEntity: function (data) {
    // Parent.
    const hitEntity = document.createElement('a-entity')
    hitEntity.className = 'hitEntity'

    // Torus.
    const torus = document.createElement('a-entity')
    torus.setAttribute('geometry', {
      primitive: 'torus',
      radius: data.hitCylinderRadius,
      radiusTubular: 0.01
    })
    torus.setAttribute('rotation', { x: 90, y: 0, z: 0 })
    torus.setAttribute('material', {
      shader: 'flat',
      color: data.hitCylinderColor,
      side: 'double',
      depthTest: false
    })
    hitEntity.appendChild(torus)

    // Cylinder.
    const cylinder = document.createElement('a-entity')
    cylinder.setAttribute('position', { x: 0, y: data.hitCylinderHeight / 2, z: 0 })
    cylinder.setAttribute('geometry', {
      primitive: 'cylinder',
      segmentsHeight: 1,
      radius: data.hitCylinderRadius,
      height: data.hitCylinderHeight,
      openEnded: true
    })
    cylinder.setAttribute('material', {
      shader: 'flat',
      color: data.hitCylinderColor,
      side: 'double',
      src: this.cylinderTexture,
      transparent: true,
      depthTest: false
    })
    hitEntity.appendChild(cylinder)

    const pointer = document.createElement('a-entity')
    pointer.setAttribute('position', { x: 0, y: 0.05, z: data.hitCylinderRadius * -1.5 })
    pointer.setAttribute('rotation', { x: 90, y: 180, z: 0 })
    pointer.setAttribute('geometry', {
      primitive: 'prism',
      height: 0.2,
      width: 0.2,
      depth: 0.05
    })
    pointer.setAttribute('material', {
      shader: 'flat',
      color: data.hitCylinderColor,
      side: 'double',
      transparent: true,
      opacity: 0.3,
      depthTest: false
    })
    hitEntity.appendChild(pointer)

    return hitEntity
  },
  createDefaultPlane: function (size) {
    const geometry = new THREE.PlaneBufferGeometry(100, 100)
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    return new THREE.Mesh(geometry, material)
  },
  cylinderTexture: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAQCAYAAADXnxW3AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAADJJREFUeNpEx7ENgDAAAzArK0JA6f8X9oewlcWStU1wBGdwB08wgjeYm79jc2nbYH0DAC/+CORJxO5fAAAAAElFTkSuQmCC)'
})

AFRAME.utils.RayCurve = function (numPoints, width) {
  this.geometry = new THREE.BufferGeometry()
  this.vertices = new Float32Array(numPoints * 3 * 6) // 6 vertices (2 triangles) * 3 dimensions
  this.uvs = new Float32Array(numPoints * 2 * 6) // 2 uvs per vertex
  this.width = width

  this.geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setDynamic(true))

  this.material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: 0xff0000
  })

  this.mesh = new THREE.Mesh(this.geometry, this.material)

  this.mesh.frustumCulled = false
  this.mesh.vertices = this.vertices

  this.direction = new THREE.Vector3()
  this.numPoints = numPoints
}

AFRAME.utils.RayCurve.prototype = {
  setDirection: function (direction) {
    const UP = new THREE.Vector3(0, 1, 0)
    this.direction
      .copy(direction)
      .cross(UP)
      .normalize()
      .multiplyScalar(this.width / 2)
  },

  setWidth: function (width) {
    this.width = width
  },

  setPoint: (function () {
    const posA = new THREE.Vector3()
    const posB = new THREE.Vector3()
    const posC = new THREE.Vector3()
    const posD = new THREE.Vector3()

    return function (i, last, next) {
      posA.copy(last).add(this.direction)
      posB.copy(last).sub(this.direction)

      posC.copy(next).add(this.direction)
      posD.copy(next).sub(this.direction)

      let idx = 6 * 3 * i // 6 vertices per point

      this.vertices[idx++] = posA.x
      this.vertices[idx++] = posA.y
      this.vertices[idx++] = posA.z

      this.vertices[idx++] = posB.x
      this.vertices[idx++] = posB.y
      this.vertices[idx++] = posB.z

      this.vertices[idx++] = posC.x
      this.vertices[idx++] = posC.y
      this.vertices[idx++] = posC.z

      this.vertices[idx++] = posC.x
      this.vertices[idx++] = posC.y
      this.vertices[idx++] = posC.z

      this.vertices[idx++] = posB.x
      this.vertices[idx++] = posB.y
      this.vertices[idx++] = posB.z

      this.vertices[idx++] = posD.x
      this.vertices[idx++] = posD.y
      this.vertices[idx++] = posD.z

      this.geometry.attributes.position.needsUpdate = true
    }
  })()
}


/***/ })

/******/ });
//# sourceMappingURL=aframe-blink-controls.js.map