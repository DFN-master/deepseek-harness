# Agent Note: pt-BR ships as a third web GUI locale

Status: implemented

English | [中文](2026-08-20-pt-br-web-gui-locale.zh.md)

## Problem

The web GUI shipped exactly two languages, `zh` and `en`, and that count was load-bearing in more places than the locale package: `LOCALE_IDS` fixed the `LocaleId` union, every plugin registered its dictionaries as a `{ zh, en }` pair, the AST-based parity gate compared only those two sides, and unit specs asserted two-element option lists. A Brazilian Portuguese reader could use the product only through English. Adding a third locale therefore meant touching every dictionary owner at once — doing it surface-by-surface would have left the type checker, the gate, and the tests each reporting a different subset of the remaining work.

## Decision

**`pt` joins `LOCALE_IDS`, and every shipped namespace gains a pt-BR dictionary in the same change.** `LOCALE_IDS` in `packages/client/locale/src/locale-settings.ts` remains the single source of the `LocaleId` union, so the typed `register(ns, { zh, en, pt })` signature made the compiler enumerate every incomplete site: a plugin whose dictionary set was not yet extended failed to build until its `pt` export existed and declared every key of the namespace's key union. All shipped namespaces are covered — the common and settings dictionaries plus every plugin namespace (`feedback`, `skill`, `plan`, `workflow`, `conversation`, settings sections, commands, trajectory, presets, permissions, directory picker, and the rest).

**The parity gate compares N locales, not a pair.** `scripts/locale-dictionary-parity.spec.ts` groups discovered dictionaries by namespace-derived pair key into per-locale slots, requires every shipped locale to be present, and checks each non-`zh` dictionary against the `zh` key set as the source of truth. Its pre-filter, name-suffix table (`Zh`/`En`/`Pt`), and inline-registration tag checks all admit `pt`, so a future fourth locale is a one-row addition to `SHIPPED_LOCALES` plus its suffix.

**Locale identity follows the existing rules.** The locale id is `pt` (the primary subtag `detectBrowserLocale()` matches on), while `<html lang>` carries the region-qualified `pt-BR`; the label is self-described as `Português (Brasil)`. `FALLBACK_LOCALE` stays `en`: a pt dictionary miss falls through the same ns → common → en → key chain as before, and the [browser-derived initial locale](2026-07-31-browser-derived-initial-locale.md) decision owns resolution and fallback semantics unchanged. Browsers advertising `pt-BR` or `pt-PT` now open in Portuguese without any stored preference.

**Translation choices follow one glossary.** Product nouns keep their English form where they are product names (`workspace`, `skill`, `Full access`) and translate where they are concepts (`agent` → agente, `session` → sessão, `plan mode` → Modo de plano). Date templates use day/month/year order and `time.ago` reads `há {t}`. Placeholders, interpolation syntax, and key sets are byte-identical across locales, which the parity gate and the typed dictionaries enforce together.

## Alternatives considered

- **Translating only high-traffic surfaces first**: the typed `register` signature rejects a partial `{ zh, en }` object the moment `LOCALE_IDS` grows, so partial coverage was not actually cheaper — it just spread the same mandatory work across many PRs while the gate and tests reported an inconsistent subset each time.
- **A runtime i18n framework instead of the dictionary registry**: the registry already provides namespacing, typed lookup, live switching, and Host persistence; an additional framework would duplicate all of it behind a second API. The gap was content (a third column of translations), not mechanism.
- **Locale id `pt-BR`**: the id is a dictionary-registry key and a settings enum value, and primary-subtag matching already routes every Portuguese variant to one entry; a region-qualified id would split the dictionary into variants the product does not write.
- **Extending the documentation localization (en ↔ zh file pairing) to pt-BR in the same change**: docs and GUI copy are separate systems with separate verification; bundling them would have made this change unreviewable. Docs translation is deferred until there is a consumer for it.

## Consequences

- The Settings Language row offers three self-described options, and a fresh browser asking for Portuguese opens in Portuguese; explicit preferences persist as before.
- Every new UI string must ship in three dictionaries from its introducing PR; the parity gate fails the asymmetry by name, and TypeScript fails a missing dictionary at build time.
- Unit specs that pinned the two-option list were updated to three; the assembled-output snapshot lane is the arbiter for rendered copy.
- The two-language phrasing in earlier prose (package READMEs, `packages/client/AGENTS.md`) now says "every shipped locale" so it does not go stale again at locale four.
