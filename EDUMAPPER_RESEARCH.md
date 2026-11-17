# Edumapper: reference for Planifier le futur

Public website and GitHub research, 17 November 2026. No Edumapper account was
created; no family/child information was submitted. The Koompa app was not changed.

## Verified links

- Official site: https://www.edumapper.com/
- Application home: https://www.edumapper.com/moi/accueil
- Formation search: https://www.edumapper.com/rechercher
- Comparison tool: https://www.edumapper.com/formation/comparaison
- Concrete comparison inspected (PCSI Thiers / MPSI du Parc):
  https://www.edumapper.com/formation/comparaison/thiers-cpge-pcsi-2547/du-parc-cpge-mpsi-8182
- Admission-estimator methodology:
  https://www.edumapper.com/a-propos/methodologie-estimateur/
- Scientific approach: https://www.edumapper.com/a-propos/la-science-chez-edumapper/
- Self-knowledge questionnaire: https://www.edumapper.com/test-mes-forces
- Career outcomes: https://www.edumapper.com/debouches
- Official GitHub organisation: https://github.com/edumapper
- Public repository returned by the organisation's public-repository API:
  https://github.com/edumapper/nuxt-harness

## What the public product shows

Edumapper focuses on post-bac orientation and Parcoursup. Its homepage describes
free access for students/families, a broad formation catalogue, personalised
admission estimates, formation comparisons and career outcomes. Public application
navigation includes saved wishes, a calendar, professions, example wish lists and
guidance articles. Its “Mes forces” questionnaire is presented as taking 5–7 minutes.
The homepage and application expose English-language counterparts.

The actual search page offers profession, formation-type and location filters,
personal admission chances and published Parcoursup access rates. Formation cards
identify the establishment, course, duration and location alongside statistics.

The concrete comparison page inspected shows two formations side by side:
programme type/duration, qualification recognition, bac results of admitted
students, teaching format, apprenticeship/stage information, tuition, application
date and channel, taught subjects and career outcomes. Personal estimates require
completing an authenticated profile. Missing information is identified explicitly.

Their site reports analysis of 27 million LinkedIn profiles for career outcomes.
This is Edumapper's published claim, not an independently verified dataset size.
The comparison's career samples concern the named establishment/programme scope;
they should not automatically be read as the outcomes of the exact compared course.

## What their estimator actually claims

The published methodology describes comparing notes, specialities, academy and
origin lycée with historic applicant/proposal profiles. It mentions predominantly
phase-principale data through mid-July, indicative results, ongoing validation and
a reliability indicator when formation data is limited. It describes the model's
purpose and inputs; it does not provide reproducible equations, source code or
numerical validation results on the page inspected.

Crucially, it states that estimates cannot be calculated for users still at
collège or already in higher education, and for unavailable formations,
apprenticeships or programmes outside Parcoursup. It also distinguishes its wish
planning from submitting actual wishes on Parcoursup.

This supports our current choice for collège profiles: observed subject strengths,
interests, requirements, milestones and next actions, rather than converting
collège grades into distant admission percentages.

## GitHub and possible reuse

The official organisation's public repository listing returned nuxt-harness,
an MIT-licensed architecture/lint/check tool for Nuxt applications. It is not the
orientation platform or its admission model. A general GitHub search also returns
many repositories labelled technical tests for Edumapper; these should not be
mistaken for official product source. No public source for the orientation
platform or documented supported integration API was found in this research.

The organisation also has a public Hugging Face model listing, but no public
datasets were returned by its dataset listing. That does not establish access to
its admission model or career database. These findings describe the public
resources inspected, not private capabilities or possible commercial partnerships.

We can learn from the product's structure, use the official education data already
available to Koompa, and offer optional links to relevant Edumapper pages. An
automatic integration of its estimates/data would need a supported interface.

## Suggested priorities for Koompa

1. **Compare saved projects side by side.** Start with two or three formations:
   content, duration, location/commute, cost, entry requirements and next deadline.
   Reuse the verified catalogue/project information; identify missing values.
2. **Make each project easier to understand.** Explain what the child would study,
   which current subjects support it, the practical constraints and the next action.
3. **Connect interests to professions and study routes.** A small set of useful
   examples is enough for the pilot; retain room for the child's interests to change.
4. **Make the timeline actionable.** Link open days, application milestones and
   family actions to saved projects, keeping official dates separate from estimates.
5. **Treat post-bac estimates as a later capability.** Revisit when a pupil has
   lycée-level data and there is a defensible data/model basis or supported partner.

Koompa's current distinctive value is family-linked grade history and support
across school years, with child-specific projects/actions and its playful view.
The Edumapper pages inspected do not establish an equivalent school-account sync
or multi-child family workflow. Edumapper is therefore a useful reference and
potential complementary resource; this research does not imply replacing Koompa.
