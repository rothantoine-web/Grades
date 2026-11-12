# Koompa companion prototype

Open `companion-test.html` through a local HTTP server. For example, from the
`site` directory run `python -m http.server 8765 --bind 127.0.0.1`, then open
http://127.0.0.1:8765/companion-test.html. The page uses browser ES modules.

Two characters: Mochi (white and grey cat with blue eyes), Pipo (platypus / ornithorynque). Eight facial
expressions: neutral, happy, laugh, thinking, surprised, sad, talking, sleeping.
Five additional reactions: waving, celebrating, proud, encouraging, waiting.
All ten original Roundimals app poses are represented by these states.

Click a card to select it, replay it, change animation speed, pause, or run
the complete gallery tour. Sample results trigger celebration, pride at
improvement, or encouragement. The demo does not load grades or change the
children's saved companion choices. Animal/state selections are shareable
through `?animal=platypus&state=celebrating`. Reduced-motion preferences show
the complete expressive pose without animation. Everything loads locally.

## Credits

Roundimals drawing kit and cat geometry by rofldark, MIT license:
https://github.com/rofldark/roundimals

Vendored, unmodified `roundimals-kit.mjs`, source commit:
`c73d220ce445b4bc0148c385118d419f72ad5d37`.
Original path: `roundimals/reference/kit.mjs`.
License: `ROUNDIMALS-LICENSE.txt`.

Platypus artwork, semantic SVG rig, native Web Animations API motion,
interaction design and demo page are authored for Koompa.
Arms, paws and digits use 70% of the kit's original size, scaled around
their fixed shoulder pivots for more balanced companion proportions.
No hosted animation service or additional production package is needed.

## Dashboard integration

`kid_app.html` imports the same renderer and shared articulation stylesheet.
The cat's existing saved `cat` key uses the approved artwork; `platypus` is
an additional choice. Penguin, squirrel, fox and boar keep their existing keys.
The picker and hero interaction work with keyboards, and animation follows
the system reduced-motion preference.

Grade reveals use expressive celebration for top scores, pride for personal
records or improvement, happiness for other successes, and encouragement
after difficult results. Existing grade, XP and badge calculations are kept.
The service worker caches all three runtime files for offline use.
