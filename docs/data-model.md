# Data model

The database uses PostgreSQL with Drizzle ORM. Table definitions are in `lib/db/src/schema/`.

| Table | Purpose | Notable fields |
| --- | --- | --- |
| `patient_profile` | Patient profile | Name, age, blood type, room, doctor, conditions, notes |
| `reminders` | Medication reminders | Medication, dosage, time, selected days, active state, notes |
| `medication_logs` | Dose status entries | Reminder ID, date, status, timestamp |
| `family_contacts` | Family/care contacts | Name, phone, relationship, primary-contact flag |
| `alerts` | Alert records | Type, message, severity, resolution state, creation time |
| `devices` | Registered device records | Name, device type, connection state, last-seen time |
| `device_readings` | Stored readings | Device ID, numeric value, unit, recorded time |

The current schema includes a foreign-key cascade from device readings to their device. Medication logs do not declare a foreign key to reminders. Review the current Drizzle schema before relying on relationship behavior.

## Data scope

The API has no authentication or tenant scoping. It currently creates and serves one shared profile/data set rather than isolating records by user, household, or care organization. Do not treat this schema as a multi-user patient record system.

## Schema changes

Development schema changes use the Drizzle Kit push command described in [Local development](local-development.md#database). There is no checked-in SQL migration history in the current repository.