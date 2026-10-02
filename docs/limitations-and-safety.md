# Limitations and safety

This project should be treated as a prototype. The current implementation is not suitable for storing real patient, health, or other sensitive personal data.

## Security and privacy gaps

- **No authentication or authorization:** API routes are not protected by a login or role-checking layer.
- **No tenant isolation:** profile, reminders, contacts, alerts, devices, and logs are shared through the same API and database scope.
- **Permissive CORS:** the API currently enables unrestricted cross-origin requests.
- **Sensitive information:** profiles and medication records may contain health data. Use synthetic data until access control, auditability, retention, and deployment security have been reviewed.

## Features that are records, not live services

- Creating an emergency or other alert stores an alert record. It does not call emergency services or notify family members, clinicians, or caregivers.
- Device registration stores a device record. It does not pair with hardware or ingest live IoT readings. The readings endpoint only returns readings already in the database.
- Reports are computed in the browser from current API data and printed by the browser; they are not a clinical report or a separate server-side export.

## Data and metric caveats

- The API's “today” medication-log date is based on UTC, not the user's local timezone.
- The dashboard's medication-compliance figure is a simplified count of today's log entries relative to active reminders. It does not account for reminder schedules or multiple doses per day.
- A default profile is created when no profile exists; this is not a substitute for user onboarding or patient identity management.

## Before production use

At minimum, add and test authentication, authorization, and tenant-scoped database access; restrict CORS; implement and monitor notification delivery; define device identity and ingestion; review local-time medication scheduling; and establish a compliant data-retention, backup, and incident-response process. Obtain appropriate clinical, privacy, and security review for the intended deployment.