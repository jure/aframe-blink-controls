<img src="https://github.com/jure/aframe-blink-controls/raw/main/blink-logo.png" alt="Blink controls" width="337">

# aframe-blink-controls

This component adds teleport with rotation to A-Frame applications! It's a modified version of the [`aframe-teleport-controls`](https://github.com/fernandojsg/aframe-teleport-controls) component by @fernandojsg, and the main changes are: added support for rotation, removed line teleport option, added support for thumbsticks, calculation of parabolic roots for accurate longer teleport rays. This is a work in progress to support an experimental project and currently the only tested device is a first generation Oculus Quest. It should work on the second generation Oculus Quest as well, as the events are the same, though support for HTC Vive or Valve Index controllers is only theoretical/untested, as I don't have a way of testing it. PRs welcome!

![Screenshot](https://github.com/jure/aframe-blink-controls/raw/docs/shots/mesh.jpg)

## Properties

| Property    | Description                     | Default Value    |
| --------    | -----------                     | -------------    |
| cameraRig       | Selector of the camera Rig to teleport         |    |
| teleportOrigin | Selector of the child of cameraRig to use as the center point for teleporting, typically the camera. If set, teleporting will position the cameraRig such that this element ends up above the teleport location (rather than the center of the cameraRig) |    |
| collisionEntities | Selector of the meshes used to check the collisions. If no value provided a plane y = 0 is used |  |
| startEvents | Alternative to `button`, list of events to listen to start teleporting.| [] |
| endEvents | Paired with `startEvents`, list of events to listen for to finish teleporting.| []            |
| button       | Button used to launch the teleport: trackpad, trigger, grip, menu, thumbstick         | thumbstick   |
| hitEntity | Entity used to show at the hitting position. If no value provided a cylinder will be used as default. |           |
| hitCylinderColor | Color used for the default `hitEntity` primitives | #4d93fd          |
| hitCylinderRadius | Radius used for the default `hitEntity` primitives | 0.25          |
| hitCylinderHeight | Height used for the default `hitEntity` primitives | 0.3 |
| curveHitColor | Color used for the curve when hit the mesh | #4d93fd          |
| curveMissColor | Color used for the curve when it doesn't hit anything | #ff0000          |
| curveNumberPoints | Number of points used in the curve | 30          |
| curveLineWidth | Line width of the curve | 0.025          |
| curveShootingSpeed | Curve shooting speed, as bigger value, farther distance. | 8          |
| interval            | Number of milliseconds to wait in between each intersection test. Lower number is better for faster updates. Higher number is better for performance.              | 0           |
| defaultPlaneSize | Default plane size | 100 |
| landingNormal | Normal vector to detect collisions with the `collisionEntity` | (0, 1, 0)          |
| landingMaxAngle | Angle threshold (in degrees) used together with `landingNormal` to detect if the mesh is too steep to jump to it. | 45          |


### Usage

#### Directly in the browser

Use the script files directly, for example:

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/1.1.0/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/aframe-blink-controls/dist/aframe-blink-controls.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity id="player">
      <!-- camera -->
      <a-entity id="camera" camera wasd-controls look-controls></a-entity>
      <!-- hand controls -->
      <a-entity id="left-hand" oculus-touch-controls="hand: left" blink-controls></a-entity>
      <a-entity id="right-hand" oculus-touch-controls="hand: right"></a-entity>
    </a-entity>
  </a-scene>
</body>
```

You can also use e.g. the trigger button instead of trackpad button by adding `button: trigger` (or `trackpad`, `trigger`, `grip`, `menu`, `thumbstick`).

For `collisionEntities`, you specify a selector for the objects that you want to calculate collisions with. By default this is a 100x100 plane at y = 0.

#### Installing via npm

Install via npm:

```bash
npm install aframe-blink-controls
```

Then require it: this will register the component globally.

```js
require('aframe-blink-controls');
```

### Events

| Event      | Properties of `event.detail`             | Description                      |
|------------|------------------------------------------|----------------------------------|
| `teleported` | `oldPosition`, `newPosition`, `hitPoint`, `rotationQuaternion` | Fires when teleportation begins. |
