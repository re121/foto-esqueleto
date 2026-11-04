# Structure

skeleton/core.js     shared runtime: layout, inputs, controls, render loop, export, utils
skeleton/core.css    shared darkroom styling
apps/<name>/app.html one app = config + render() only
apps/_vorlage/       template for a new app (ignored by the build)
build.mjs            builds dist/<name>.html
dist/                single-file apps, ready to deploy

Rules:
- An app must not touch the DOM outside the canvas; everything else is the skeleton's job.
- New shared helpers go into `util` in core.js, not into an app.
