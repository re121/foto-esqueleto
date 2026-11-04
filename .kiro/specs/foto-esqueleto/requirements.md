# Requirements — foto-esqueleto

## R1 Single file
WHEN an app is built THE SYSTEM SHALL produce one self-contained HTML file with no external requests.

## R2 Declarative apps
WHEN a developer creates an app THE SYSTEM SHALL require only an id, title, inputs, controls and a render function.

## R3 Inputs
WHEN an app enables files THE SYSTEM SHALL accept images via file picker and drag & drop, respecting EXIF orientation.
WHEN an app enables `multiple` THE SYSTEM SHALL accumulate several images.
WHEN an app enables camera THE SYSTEM SHALL show a live preview rendered every frame, and stop the camera when a file is loaded.

## R4 Controls
THE SYSTEM SHALL support range, select, color and checkbox controls, re-render on every change and persist values per app.

## R5 Export
WHEN the user presses Save THE SYSTEM SHALL download the canvas as PNG or JPEG, as declared by the app.

## R6 Privacy
THE SYSTEM SHALL never upload images.

## R7 Two applications
THE SYSTEM SHALL ship at least two functionally different apps built on the same skeleton.
