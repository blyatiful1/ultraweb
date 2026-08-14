## Composes with

- ultraweb:server-actions — owns the mutation side: 'use server' conventions, optimistic updates, error-as-data shape this wiring targets
- ultraweb:buttons — submit CTA hierarchy and loading state
- ultraweb:ui-states — success/error/empty surfaces beyond the form itself
- ultraweb:copywriting — labels, hints, and error voice in the brief's tone
- ultraweb:micro-interactions — focus ring and error-appear motion, 150–250ms
- ultraweb:email — where the contact payload lands (Resend: check `{ data, error }`, it never throws)
- ultraweb:auth — sign-in/sign-up forms built here hand the credential check and session mutation off to auth
- ultraweb:i18n — owns locale switching and translated label/error strings; forms owns field order and the DACH payment-method priority
- ultraweb:payments — wires the Stripe/provider integration behind the DACH payment methods forms orders (Klarna/PayPal/SEPA/Rechnung)
- ultraweb:gate-accessibility — audits the label association, `aria-describedby`, and error-announcement contract this skill builds (its item 7)
- ultraweb:storage — when a form field is a file upload the bytes hand off here, while the dropzone's label and error placement still follow this skill's rules
