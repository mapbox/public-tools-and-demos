# Map pin assets

**`label-tail.svg` is in use.** It is the pointer under a price label. Note the
exported asset points *up* — Figma flips it with `scaleY(-1)`, and so does
`ListingMarker`.

**`pin-house.svg`, `pin-condo.svg` and `pin-townhouse.svg` are currently unused.**

They were the 46px type-coloured circles that sat beneath every price label,
from the Figma `pin` component. They went out of use when markers became
*either* a circle *or* a price label rather than both: at King County density
the paired circle-plus-label was too noisy, and an unlabelled listing is now a
small CSS dot instead.

They are kept deliberately in case a future marker treatment wants them back.
If they are revived, note that `pin-condo.svg` predates the rename of that
property type to `multi-family` — the colour is right, the filename is stale.
