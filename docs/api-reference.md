# API reference

The API is served below `/api`. The canonical OpenAPI 3.1 definition is [`lib/api-spec/openapi.yaml`](../lib/api-spec/openapi.yaml); use it for complete request and response schemas. The server currently has no authentication middleware and does not return a documented, uniform error envelope.

## Health

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/healthz` | Health status |

## Patient profile

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/profile` | Get the patient profile; creates a default profile if none exists |
| `PUT` | `/api/profile` | Update the profile |

The update body requires `fullName`, `age`, `bloodType`, and `conditions`. Optional fields are `roomNumber`, `doctorName`, and `notes`. Blood type values are `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, and `AB-`.

## Medication reminders and logs

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/reminders` | List reminders |
| `POST` | `/api/reminders` | Create a reminder |
| `PUT` | `/api/reminders/{id}` | Update a reminder |
| `DELETE` | `/api/reminders/{id}` | Delete a reminder |
| `POST` | `/api/reminders/{id}/taken` | Record the reminder as taken today |
| `GET` | `/api/medication-logs/today` | Get today's medication logs |

Reminder create/update bodies require `medicationName`, `dosage`, `time`, and `days`. `isActive` and `notes` are optional. Medication log statuses are `taken`, `missed`, or `skipped`.

## Family contacts

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/family` | List family contacts |
| `POST` | `/api/family` | Add a contact |
| `DELETE` | `/api/family/{id}` | Delete a contact |

Contact creation requires `name`, `phone`, and `relationship`; `isPrimary` is optional.

## Alerts

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/alerts` | List alerts |
| `POST` | `/api/alerts` | Create an alert record |
| `PATCH` | `/api/alerts/{id}/resolve` | Mark an alert resolved |

Create-alert bodies require `type`, `message`, and `severity`. Supported types are `no_movement`, `emergency`, `medication_missed`, `fall_detected`, `vital_alert`, and `nurse_call`. Severity values are `low`, `medium`, `high`, or `critical`. Creating an alert currently stores a record; it does not dispatch a notification.

## Devices and readings

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/devices` | List devices |
| `POST` | `/api/devices` | Register a device |
| `DELETE` | `/api/devices/{id}` | Remove a device |
| `GET` | `/api/devices/{id}/readings` | Get readings stored for a device |

Device creation requires `name` and `type`. Supported types are `heart_rate`, `motion_sensor`, `fall_detector`, `blood_pressure`, `blood_sugar`, `smartwatch`, `oxygen_saturation`, and `temperature`. Device registration does not connect to a live device; see [Limitations and safety](limitations-and-safety.md).

## Client generation

The OpenAPI file is also the source for the generated React Query client and Zod schemas. See [Local development](local-development.md#generate-api-code) for the code-generation command.