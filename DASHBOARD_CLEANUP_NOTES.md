# Dashboard cleanup carried back to Claude/site — 17 November 2026

The user explicitly requested updating this original app with the main-page
cleanup already tried in Claude-FamilyApp. This supersedes the earlier instruction
to leave Claude/site untouched for this dashboard cleanup only.

Reload your usual original dashboard with **Ctrl+F5**. The original app's
service-worker shell is now **grades-v61-dashboard-cleanup**. This app serves
static files; it does not use Claude-FamilyApp's npm build or authenticated server.
The initial port was reviewed locally before publication. On 17 November 2026,
the user requested publishing this version to the existing GitHub Pages site:
https://rothantoine-web.github.io/Grades/.

## What was carried over

- French Koompa title, chart controls, captions, dates and summary labels on the
  main page.
- The repaired **Radar par matière**, calculated from stored raw grades and
  each year's method/coefficients, with explicit handling of missing class bounds.
- Closed-by-default **Évolution par semaine**, last 12 calendar weeks by default,
  blank weeks when there is no grade, touch/keyboard details and sticky subject labels.
- The existing class-position timeline is retained in a closed section.
- National-estimation/context, Horizon/brevet/school-ladder panels are removed
  from the active dashboard. Valid observed 6e assessment scores remain optional.
- The lycée comparison is in **Planifier le futur → Comparer les lycées**:
  three-year results, name/city filtering, value-added/mention/success metrics,
  department selection and an action to keep a lycée as a project.
- The same public 2023–2025 Alpes-Maritimes snapshot and public IVAL loader,
  including typed date filters and labelled failure/fallback behaviour.

The original data loading, login/Settings code, planning child selector,
planning storage conventions and Koompa game files were retained. FamilyApp
authentication, school connectors and session/storage bridges were not copied
into this app. The comparison's lifecycle check was adapted to this app's current
planning profile and is cleared when the planning page closes or changes child.

The dashboard renderer contains its own small text-escaping helper because the
FamilyApp helper does not exist in the original app's global scope. The planning
comparison reuses the pinned Chart.js CDN dependency already used by this app;
its service-worker shell includes that dependency and the new comparison module.

## Future planning work

**PLANNING_IMPROVEMENTS.md** is the feature brief for Comparer deux projets,
starting with two saved lycée choices for collège profiles, then an interests
questionnaire and project-linked deadlines/actions. This future feature is
documented only; it has not been implemented by this port. The Edumapper sources
and findings are in **EDUMAPPER_RESEARCH.md**.

## Rollback and consolidation record

The pre-port source files, their hashes and the Git source commit are preserved
in **../../Claude-FamilyApp/.local/claude-dashboard-cleanup-20261117-before/**
relative to this site directory.
The companion **after** snapshot records this edited source for future comparison.
The source Git base remains **2a26681c683bb75756f8bcd7efeb2bf9ba9d0dfe**;
the dated after snapshot records the cleanup applied on top of that base.

To restore one removed panel, take its markup and renderer from the backed-up
grades_dashboard.html and merge that panel back into the current template/renderer.
To roll back this port entirely, copy the backed-up modified source files to
their matching paths here. Bump the service-worker cache before reviewing a rollback.
If further app improvements have been made, prefer a selective restoration so
those improvements remain. No grade files or progress storage need restoring.

Future consolidation should compare with this dated before/after record. Keep
the original child-switching lifecycle and FamilyApp's authenticated lifecycle
in their respective apps rather than replacing whole files across the two.

## Verification

The original app was tested with synthetic children and blocked real school/data
requests. Checks covered syntax, raw-year radar, heatmap gaps/touch detail,
planning launch/back and retained year, lycée comparison/fallback, child-specific
projects, switching children from both the dashboard and planning selector,
cancelling a public-data request during a child switch, and mobile layout.
Screenshots and the preservation
record are in Claude-FamilyApp's **.local/claude-dashboard-cleanup-20261117-review/**.
The original Koompa game, profile adapter, catalogue, statistics and demo files
retain their pre-port hashes; JavaScript outside the dashboard renderer is unchanged.
The FamilyApp application itself was not modified by this source port.
