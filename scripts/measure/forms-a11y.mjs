// forms-a11y.mjs — every form on the page field by field: the name a screen reader
// announces, whether required is communicated visually as well as programmatically, whether
// an invalid field points at its error text, and whether a known autofill field declares its
// autocomplete token. Fields outside any <form> are collected under a synthetic "(orphan)" form.
// 'required-unmarked' judges the VISIBLE marking only: the field is required (the attribute or
// aria-required) and its accessible name carries no *, "required" or "Pflicht". aria-required
// never silences it — that attribute is the programmatic half, and this check is the other half.
// 'missing-autocomplete' matches WHOLE WORDS of the field's name/id/accessible name, split on
// non-letters and camelCase: "Sortieren nach", "Support", "report" and "landing" are not address
// fields; "postal code", "PLZ", "Straße", "city", "country" are.
// 'no-error-binding' fires when aria-invalid="true" and the described-by target is missing OR
// invisible — an error message nobody is pointed at is not bound.
// Config keys read: none (theme is echoed from the config when present).
// Returns: { url, viewport, theme,
//            forms:[{selector, fields:[{selector,name,type,labelled,required,ariaInvalid,describedBy,
//                                       describedByResolved:{exists,visible,role,ariaLive,text},autocomplete}],
//                    submit:{text,disabled}|null}],
//            issues:[{kind:'unlabelled'|'required-unmarked'|'no-error-binding'|'missing-autocomplete', selector, detail}],
//            counts:{forms,fields,issues}, truncated,
//            error: string, only when a measurement could not run — the runner treats it as UNVERIFIED }.
// The gate asserts: issues.length === 0.
async (page) => {
  const config =
    (await page
      .evaluate(() => {
        try {
          return window.__ultraweb && typeof window.__ultraweb === 'object' ? window.__ultraweb : {};
        } catch (e) {
          return {};
        }
      })
      .catch(() => ({}))) || {};

  const data = await page
    .evaluate(() => {
      const cap = 500;
      let truncated = false;
      const sel = (n0) => {
        const step = (n) => {
          if (n.id && /^[A-Za-z][\w-]*$/.test(n.id)) return '#' + n.id;
          const slot = n.getAttribute ? n.getAttribute('data-slot') : null;
          if (slot && /^[\w-]+$/.test(slot)) return n.tagName.toLowerCase() + '[data-slot="' + slot + '"]';
          const tag = n.tagName.toLowerCase();
          const p = n.parentElement;
          if (!p) return tag;
          const sibs = Array.prototype.filter.call(p.children, (c) => c.tagName === n.tagName);
          return sibs.length > 1 ? tag + ':nth-of-type(' + (sibs.indexOf(n) + 1) + ')' : tag;
        };
        const parts = [];
        let n = n0;
        for (let i = 0; n && n.nodeType === 1 && i < 5; i++) {
          const s = step(n);
          parts.unshift(s);
          if (s.charAt(0) === '#') break;
          n = n.parentElement;
        }
        return parts.join(' > ');
      };
      const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
      const byId = (el) =>
        (el.getAttribute('aria-labelledby') || '')
          .split(/\s+/)
          .filter(Boolean)
          .map((id) => {
            const t = document.getElementById(id);
            return t ? t.textContent : '';
          })
          .join(' ');
      const nameOf = (el) => {
        const labels = el.labels && el.labels.length ? Array.prototype.map.call(el.labels, (l) => l.textContent).join(' ') : '';
        return clean(el.getAttribute('aria-label') || byId(el) || labels || el.getAttribute('title')).slice(0, 80);
      };
      // whole words only: "Sortieren nach" is not an Ort field, "landing" is not a Land field
      const AUTOFILL = new Set(
        ('name vorname nachname firstname lastname fullname username email mail tel telefon phone mobile handy ' +
          'street strasse straße address adresse zip postal postcode plz city stadt ort town country land staat ' +
          'company firma organisation organization password passwort birth birthday geburt geburtstag card iban').split(' ')
      );
      const TOKEN_TYPES = { email: 1, tel: 1, url: 1, password: 1 };
      const words = (s) =>
        String(s)
          .split(/[^A-Za-zÀ-ÿ]+/)
          .reduce((acc, w) => acc.concat(w.split(/(?<=[a-zà-ÿ])(?=[A-ZÀ-Þ])/)), [])
          .map((w) => w.toLowerCase())
          .filter(Boolean);
      const looksAutofill = (key) => words(key).some((w) => AUTOFILL.has(w));
      const resolveDescribedBy = (el) => {
        const ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
        const out = { exists: false, visible: false, role: null, ariaLive: null, text: '' };
        for (const id of ids) {
          const t = document.getElementById(id);
          if (!t) continue;
          out.exists = true;
          const s = getComputedStyle(t);
          if (s.display !== 'none' && s.visibility !== 'hidden' && !t.hasAttribute('hidden') && t.getClientRects().length)
            out.visible = true;
          out.role = out.role || t.getAttribute('role') || (t.parentElement && t.parentElement.getAttribute('role')) || null;
          const live = t.closest('[aria-live]');
          out.ariaLive = out.ariaLive || (live ? live.getAttribute('aria-live') : null);
          out.text = clean(out.text + ' ' + (t.textContent || '')).slice(0, 120);
        }
        return out;
      };

      const forms = [];
      const issues = [];
      const scopes = Array.prototype.slice.call(document.querySelectorAll('form'));
      const orphans = Array.prototype.filter.call(
        document.querySelectorAll('input:not([type="hidden"]), select, textarea'),
        (el) => !el.closest('form')
      );
      let fieldCount = 0;

      const describe = (scope, scopeSelector, list) => {
        const fields = [];
        for (const el of list) {
          if (fieldCount >= cap) {
            truncated = true;
            break;
          }
          try {
            const s = getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden') continue;
            const tag = el.tagName.toLowerCase();
            const type = tag === 'input' ? (el.getAttribute('type') || 'text').toLowerCase() : tag;
            if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'image' || type === 'reset') continue;
            const selector = sel(el);
            const name = nameOf(el);
            const labelled = name.length > 0;
            const required = el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';
            const ariaInvalid = el.getAttribute('aria-invalid') === 'true';
            const describedBy = el.getAttribute('aria-describedby');
            const describedByResolved = resolveDescribedBy(el);
            const autocomplete = el.getAttribute('autocomplete');
            const key = (el.getAttribute('name') || '') + ' ' + (el.getAttribute('id') || '') + ' ' + name;
            fields.push({ selector, name, type, labelled, required, ariaInvalid, describedBy, describedByResolved, autocomplete });
            fieldCount++;
            if (!labelled) issues.push({ kind: 'unlabelled', selector, detail: tag + '[type=' + type + ']' });
            if (required && labelled && !/[*✱]|required|pflicht|obligator/i.test(name))
              issues.push({ kind: 'required-unmarked', selector, detail: 'required but nothing visible marks it: "' + name + '"' });
            if (ariaInvalid && (!describedBy || !describedByResolved.exists || !describedByResolved.visible))
              issues.push({
                kind: 'no-error-binding',
                selector,
                detail: describedByResolved.exists
                  ? 'aria-describedby target renders nothing'
                  : 'aria-invalid="true" with no resolvable aria-describedby: ' + (describedBy || '(none)'),
              });
            if (!autocomplete && (TOKEN_TYPES[type] || looksAutofill(key)))
              issues.push({ kind: 'missing-autocomplete', selector, detail: 'looks like an autofill field: ' + clean(key).slice(0, 40) });
          } catch (e) {
            /* one unreadable field never stops the sweep */
          }
        }
        let submit = null;
        try {
          const b = scope
            ? scope.querySelector('button[type="submit"], input[type="submit"], button:not([type])')
            : null;
          if (b) submit = { text: clean(b.textContent || b.value).slice(0, 60), disabled: !!b.disabled };
        } catch (e) {
          submit = null;
        }
        forms.push({ selector: scopeSelector, fields, submit });
      };

      for (const f of scopes) {
        if (forms.length >= cap) {
          truncated = true;
          break;
        }
        describe(f, sel(f), f.querySelectorAll('input:not([type="hidden"]), select, textarea'));
      }
      if (orphans.length) describe(null, '(orphan)', orphans);

      return { forms, issues, counts: { forms: forms.length, fields: fieldCount, issues: issues.length }, truncated };
    })
    .catch(() => ({ forms: [], issues: [], counts: { forms: 0, fields: 0, issues: 0 }, truncated: false, error: 'evaluate failed' }));

  const viewport =
    page.viewportSize() ||
    (await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })).catch(() => null));
  return { url: page.url(), viewport, theme: config.theme || null, ...data };
}
