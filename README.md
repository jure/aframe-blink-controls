<img src="https://github.com/jure/aframe-blink-controls/raw/main/blink-logo.png" alt="Blink controls" width="337">

# aframe-blink-controls

## [Live examples](https://jure.github.io/aframe-blink-controls)

## [Video demo](https://twitter.com/JureTriglav/status/1346502092282847234?s=20)

This component adds teleport with rotation to A-Frame applications! It's a modified version of the [`aframe-teleport-controls`](https://github.com/fernandojsg/aframe-teleport-controls) component by @fernandojsg, and the main changes are: 
* added support for rotation, 
* removed line teleport option, 
* added support for thumbsticks,
* added snap turn support, 
* calculation of parabolic roots for accurate longer teleport rays. 

This is a work in progress to support an experimental project and currently only tested on: Oculus Quest, Oculus Quest 2. 
Support for HTC Vive/Valve Index/HP Reverb G2 etc. controllers is only theoretical/untested, as I don't have a way of testing on these devices yet. PRs welcome!

<img src="https://github.com/jure/aframe-blink-controls/raw/main/docs/shots/mesh.jpg" width="500" alt="Screenshot">

## Properties

| Property    | Description                     | Default Value    |
| --------    | -----------                     | -------------    |
| cameraRig       | Selector of the camera Rig to teleport         |    |
| teleportOrigin | Selector of the child of cameraRig to use as the center point for teleporting, typically the camera. If set, teleporting will position the cameraRig such that this element ends up above the teleport location (rather than the center of the cameraRig) |    |
| collisionEntities | Selector of the meshes used to check the collisions. If no value provided a plane y = 0 is used |  |
| startEvents | Alternative to `button`, list of events to start teleporting.| [] |
| endEvents | Paired with `startEvents`, list of events to end teleporting.| []            |
| cancelEvents | Events to cancel teleporting. | []            |
| button       | Button used to launch the teleport: trackpad, trigger, grip, menu, thumbstick         |  |
| hitEntity | Entity used to show at the hitting position. If no value provided a cylinder will be used as default. |           |
| hitCylinderColor | Color used for the default `hitEntity` primitives | #4d93fd          |
| hitCylinderRadius | Radius used for the default `hitEntity` primitives | 0.25          |
| hitCylinderHeight | Height used for the default `hitEntity` primitives | 0.3 |
| curveHitColor | Color used for the curve when hit the mesh | #4d93fd          |
| curveMissColor | Color used for the curve when it doesn't hit anything | #ff0000          |
| curveNumberPoints | Number of points used in the curve | 50          |
| curveLineWidth | Line width of the curve | 0.025          |
| curveShootingSpeed | Curve shooting speed, as bigger value, farther distance. | 8          |
| interval            | Number of milliseconds to wait in between each intersection test. Lower number is better for faster updates. Higher number is better for performance.              | 0           |
| defaultPlaneSize | Default plane size | 100 |
| landingNormal | Normal vector to detect collisions with the `collisionEntity` | (0, 1, 0)          |
| landingMaxAngle | Angle threshold (in degrees) used together with `landingNormal` to detect if the mesh is too steep to jump to it. | 45          |
| drawIncrementally | If the ray should be drawn as an animation | true |
| incrementalDrawMs | How long the ray animation should be | 500 |
| snapTurn | If left/right thumbstick axis performs a 45 deg rotation | true |
| rotateOnTeleport | Will rotate player on teleport, facing the direction where the arrow is pointing | true |
| teleportationMethod | Set value to `position-warp` to enable this teleportation option. |  |
| positionWarpDuration | How long the position warp animation should be. | 1000 |

### Usage

#### Directly in the browser

Use the script files directly, for example:

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/aframe-blink-controls/dist/aframe-blink-controls.min.js"></script>
</head>

<body>
  <a-scene>
    <!-- camera rig -->
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

By default, this uses the **forward thumbstick axis to activate** the teleport, as that seems to be a familiar way across different applications and platforms, in addition to being pratical (as it does not require pressing buttons while also e.g. moving axes). When the teleport is active, you can also choose the direction you want to be facing (rotation) after teleporting, by using the thumbstick.

You can also use e.g. the trigger button instead of the thumbstick by adding `button: trigger` (or `trackpad`, `trigger`, `grip`, `menu`, `thumbstick`). Or specify `startEvents` and `endEvents` for specific use cases, though give the default bindings a try first!

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

### Development

Use `npm run dev` to run a development build with a number of provided examples on https://localhost:8080 (or alternatively your computer's IP on your network, e.g. for testing on standalone devices).

### Events

| Event      | Properties of `event.detail`             | Description                      |
|------------|------------------------------------------|----------------------------------|
| `teleported` | `oldPosition`, `newPosition`, `hitPoint`, `rotationQuaternion` | Fires when teleportation begins. |
