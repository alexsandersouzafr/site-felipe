# Architecture

The website uses Next.js on Vercel. Supabase provides Postgres, authentication, and Storage. Resend delivers emails sent from the contact form.

## Boundaries

- Public pages use anonymous reads only for published records.
- The panel uses a Supabase session and protected routes.
- Service keys, Resend credentials, and the contact recipient exist only on the server.
- Private media URLs must be signed; public photos may use a public bucket and optimized URLs.

## Rendering

Public content should be rendered on the server whenever possible. TanStack Query is reserved for client-side interactions in the panel.
