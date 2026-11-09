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

## R8 Valores — value scale
WHEN the value-scale mode is active THE SYSTEM SHALL posterize the loaded image to 3, 5, or 9 grey levels so the painter can read the tonal structure.

## R9 Valores — Notan
WHEN the Notan mode is active THE SYSTEM SHALL render the image in pure black and white using an adjustable threshold so the painter can study the dark/light pattern.

## R10 Valores — Squint
WHEN the squint slider is moved THE SYSTEM SHALL apply a Gaussian-like blur to the rendered image so large shapes become visible and detail disappears.

## R11 Valores — Zone map
WHEN the zone-map mode is active THE SYSTEM SHALL colour-code each pixel into one of Ansel Adams' eleven zones (0–10) and display a legend with the zone numbers and their painter names in German and English.

## R12 Valores — Temperature
WHEN the temperature mode is active THE SYSTEM SHALL tint warm-luminance areas orange and cool-luminance areas blue so the painter can see the colour temperature structure.

## R13 Valores — Grid overlay
WHEN the grid overlay is enabled THE SYSTEM SHALL draw a grid of 3×3, 4×4 or a custom number of cells over the image to assist transferring proportions to canvas.

## R14 Valores — Eyedropper
WHEN the user clicks on the canvas THE SYSTEM SHALL display the Adams zone (1–9) and the hex colour of the clicked pixel in the status bar.

## R15 Valores — bilingual
THE SYSTEM SHALL display all Valores controls and labels in German with English subtitles, matching the pattern of the other apps.
