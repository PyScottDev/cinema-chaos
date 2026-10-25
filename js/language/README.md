# Cinema Chaos language resources

`elementary.js` is loaded by `index.html` **before** `campaigns/the-first-week.js`.
It contains the existing Elementary text extracted from the campaign and the
procedural customer dialogues extracted from `engine.js`.

`FIRST_WEEK_ELEMENTARY.text` maps to fields in the existing campaign schema.
Story encounters, notices and endings use stable `@id` selectors in these paths
where IDs exist. `applyFirstWeekElementary()` restores the text to those fields
before the campaign is registered. It also attaches the Elementary procedural
and vocabulary data to `campaign.languagePacks.elementary`.

The game still uses the same screening schedule, identity rules, ticket decisions,
character triggers, story conditions and UI. In particular, **do not change film
IDs, timings, capacities, age ratings, or story keys as a way to change CEFR
level**. Those values determine gameplay, not reading level. The legacy
`languagePack` schema still includes factual film data; separating those shared
facts from the linguistic overlays is a follow-on architectural task.

The Elementary extraction does not enable Intermediate or Advanced. The game also
still has common interface and rules-engine feedback strings, which are **not**
level-specific speech. Removing textbook hints and classroom terminology is a
separate cleanup change.

Tests from project root:

```sh
node tests/language-pack-integrity.js
node tests/run-tests.js
```

The supplied October 25 baseline has an unrelated existing failure in portrait
asset test 38 (a count of 10 versus an expected 9). Do not adjust the portrait
assets in a language-only patch.
