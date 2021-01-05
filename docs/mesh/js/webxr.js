window.addEventListener('enter-vr', e => {
  if (AFRAME.utils.device.checkHeadsetConnected()) {
    if (document.getElementById('cursor')) {
      document.getElementById('cursor').remove()
    }
  }
})

/**
 * Specifies an envMap on an entity, without replacing any existing material
 * properties.
 * From: https://github.com/colinfizgig/aframe_Components/blob/master/components/light-map-geometry.js
 */
AFRAME.registerComponent('light-map-geometry', {
  schema: {
    path: { default: '' },
    format: { default: 'RGBFormat' },
    intensity: { default: 1.0 }
  },

  init: function () {
    const data = this.data
    const el = this.el
    this.texture = new THREE.TextureLoader().load(data.path)
    this.texture.encoding = THREE.RGBDEncoding
    this.intensity = data.intensity
    this.applyLightMap()
    this.el.addEventListener('object3dset', this.applyLightMap.bind(this))
  },

  applyLightMap: function () {
    const mesh = this.el.getObject3D('mesh')
    const lightMap = this.texture
    this.texture.flipY = false
    const el = this.el
    const value = this.intensity

    if (!mesh) return
    mesh.traverse(function (node) {
      if (node.material && 'lightMap' in node.material) {
        node.material.lightMap = lightMap
        node.material.lightMapIntensity = value
        node.material.needsUpdate = true
      }
    })
  }
})
