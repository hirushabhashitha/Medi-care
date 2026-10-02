# MediCore Hospital Management System

MediCore is a full-stack hospital management system built for day-to-day clinical and administrative workflows. It provides a role-based dashboard for patient registration, appointments, consultations, electronic medical records, laboratory work, pharmacy inventory, inpatient admissions, billing, staff management, reports, and audit logs.
This repository is the Next.js application for the MediCare project. It uses SQLite for zero-configuration local development and Prisma as the data-access layer.

## Features
- Secure username/password authentication with signed session cookies and role-based route protection.
- Dashboard shell with role-aware navigation for seven operational roles.
- Patient registration, search, profiles, medical history, emergency contacts, allergies, and notes.
- Doctor and department management with consultation fees and availability slots.
- Appointment scheduling with token numbers and status tracking.
- Consultation workflow with vitals, diagnosis, treatment notes, medical records, prescriptions, and lab orders.
- Laboratory test catalog, orders, sample workflow, result entry, and status tracking.
- Pharmacy medicine catalog, stock levels, reorder alerts, expiry dates, prescription dispensing, and stock deduction.
- Ward and bed management with inpatient admission and discharge status.
- Invoices, invoice line items, payment recording, payment methods, and receipt numbers.
- Employee records, attendance, leave requests, departments, and user administration.
- Operational reports and an audit-log viewer for administrative oversight.
## Technology Stack

- **Frontend:** Next.js App Router, React 19, TypeScript, CSS, Recharts.
- **Backend:** Next.js Route Handlers running on Node.js.
- **Database:** SQLite for local development; Prisma ORM and Prisma Client.
- **Authentication:** Web Crypto API password hashing with PBKDF2 and signed JWT session cookies using `jose`.
- **Tooling:** ESLint 9, Tailwind CSS 4/PostCSS, Prisma 6, `tsx`.
## Requirements

- Node.js 20 or newer (Node.js 26 was used during development).
- npm 10 or newer.
- No external database server is required for the default SQLite setup.

## Local Setup
1. Clone the repository and enter the project directory.

	```bash
	git clone https://github.com/hirushabhashitha/Medi-care.git
	cd Medi-care
	```
2. Install dependencies.

	```bash
	npm install
	```
3. Create a `.env` file in the project root. The file is intentionally ignored by Git.

	```env
	DATABASE_URL="file:./dev.db"
	JWT_SECRET="replace-with-a-long-random-production-secret"
	NEXT_PUBLIC_APP_NAME="MediCore HMS"
	```
4. Create the database, generate Prisma Client, and load the demo data.

	```bash
	npm run db:setup
	```
5. Start the development server.

	```bash
	npm run dev
	```
Open [http://localhost:3000](http://localhost:3000) and sign in with one of the seeded accounts below.

### Available Scripts
| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Start the production server after building. |
| `npm run lint` | Run ESLint. |
| `npm run db:generate` | Generate Prisma Client. |
| `npm run db:push` | Apply the Prisma schema to the configured database. |
| `npm run db:seed` | Seed demo departments, accounts, catalog data, wards, and patients. |
| `npm run db:setup` | Run `db:push` followed by the seed script. |
| `npm run db:studio` | Open Prisma Studio. |
## Demo Accounts

The seed script creates one or more accounts for every supported role. These credentials are for local development only and must be changed or removed before deployment.

| Role | Username | Password | Email |
| --- | --- | --- | --- |
| Administrator | `admin` | `admin123` | `admin@medicore.com` |
| Doctor | `dr.silva` | `doctor123` | `dr.silva@medicore.com` |
| Doctor | `dr.fernando` | `doctor123` | `dr.fernando@medicore.com` |
| Nurse | `nurse.perera` | `nurse123` | `nurse.perera@medicore.com` |
| Receptionist | `reception` | `reception123` | `reception@medicore.com` |
| Laboratory staff | `labtech` | `lab123` | `lab@medicore.com` |
| Pharmacist | `pharmacist` | `pharmacy123` | `pharmacy@medicore.com` |
| Accountant | `accountant` | `accounts123` | `accounts@medicore.com` |
## Role Access

| Role | Main responsibilities |
| --- | --- |
| Administrator | Users, employees, departments, wards, reports, audit logs, and full system administration. |
| Doctor | Appointments, consultations, medical records, prescriptions, and laboratory orders. |
| Nurse | Admissions, wards, beds, and inpatient operational support. |
| Receptionist | Patient registration, patient lookup, doctor lookup, and appointment booking. |
| Laboratory staff | Laboratory catalog, pending orders, sample statuses, and test results. |
| Pharmacist | Medicine catalog, stock monitoring, and prescription dispensing. |
| Accountant | Invoices, invoice items, payments, receipt numbers, and billing workflows. |
## Seeded Demo Data

Running `npm run db:seed` creates or upserts the following local development data:

- **Departments:** General Medicine, Cardiology, Pediatrics, Orthopedics, Dermatology, Emergency, Radiology, Pharmacy, Laboratory, and Neurology.
- **Doctors:** Dr. Kamal Silva (General Medicine, consultation fee 2,500) and Dr. Nimal Fernando (Cardiology, consultation fee 3,500), with weekday availability slots.
- **Lab tests:** Complete Blood Count, Blood Glucose, Lipid Profile, Liver Function Test, Renal Function Test, Thyroid Panel, Urinalysis, Chest X-Ray, ECG, and HbA1c.
- **Medicines:** Paracetamol, Amoxicillin, Omeprazole, Metformin, Amlodipine, Cetirizine, Azithromycin, Ibuprofen, Salbutamol Inhaler, and Diclofenac Gel, each with stock, pricing, manufacturer, and one-year demo expiry data.
- **Wards:** General Ward A (10 beds), General Ward B (10 beds), Private Ward (5 beds), ICU (4 beds), and Pediatric Ward (8 beds).
- **Patients:** Amal Wickramasinghe (`PAT0001`), Sachini Dissanayake (`PAT0002`), Ranjith Gunasekara (`PAT0003`), Tharushi Mendis (`PAT0004`), and Nuwan Rajapaksha (`PAT0005`).
The seed script is designed to be repeatable for departments, users, employees, doctors, tests, wards, beds, and patients. Medicine records are inserted as demo records and should be cleared or reseeded carefully when resetting an existing database.

## Database Model

The Prisma schema in `prisma/schema.prisma` contains these models:

- **Security:** `User`, `AuditLog`, and the `Role` enum.
- **Staff:** `Department`, `Employee`, `Attendance`, and `LeaveRequest`.
- **Clinical:** `Doctor`, `Patient`, `Appointment`, and `MedicalRecord`.
- **Pharmacy:** `Prescription`, `PrescriptionItem`, and `Medicine`.
- **Laboratory:** `LabTest`, `LabOrder`, and `LabOrderItem`.
- **Inpatient care:** `Ward`, `Bed`, and `Admission`.
- **Billing:** `Invoice`, `InvoiceItem`, and `Payment`.

Most relationships use cascading deletes for dependent clinical records. Unique constraints protect usernames, emails, patient codes, invoice numbers, lab test names, department names, ward names, and ward bed numbers.

## API Routes

The application exposes REST-style Next.js Route Handlers under `/api`:

| Area | Routes |
| --- | --- |
| Authentication | `/api/auth/login`, `/api/auth/logout`, `/api/auth/session` |
| Patients | `/api/patients`, `/api/patients/:id` |
| Appointments | `/api/appointments`, `/api/appointments/:id` |
| Clinical | `/api/medical-records`, `/api/admissions` |
| Staff and setup | `/api/users`, `/api/employees`, `/api/departments`, `/api/doctors`, `/api/attendance`, `/api/wards` |
| Laboratory | `/api/laboratory/tests`, `/api/laboratory/orders` |
| Pharmacy | `/api/pharmacy/medicines`, `/api/pharmacy/dispense` |
| Billing | `/api/billing/invoices`, `/api/billing/invoices/:id`, `/api/billing/payments` |
| Reporting and security | `/api/reports`, `/api/audit-logs` |

## Application Pages

The authenticated dashboard currently includes pages for the dashboard overview, patients, patient profiles, appointments, consultations, doctors, departments, employees, admissions, wards, laboratory orders, laboratory catalog, pharmacy, dispensing, billing, invoice details, payments, reports, users, and audit logs.

## Security and Production Notes

- Never commit `.env`, database files, real patient information, or production credentials.
- Set a unique, high-entropy `JWT_SECRET` in every deployed environment. The fallback secret in source is for local development only.
- Replace all seeded passwords before using the system outside local development.
- Use HTTPS in production so session cookies are protected in transit.
- SQLite is appropriate for local development and small single-instance deployments. Use PostgreSQL or MySQL for production scale, backups, concurrent writes, and managed hosting.
- Review and strengthen authorization checks, validation, rate limiting, backups, and audit policies before processing real medical data.
- This project is a management application and does not provide medical advice or clinical decision support.

## Verification

Run the following checks before opening a pull request or deployment:

```bash
npm run lint
npm run build
npx prisma validate
```

For a local end-to-end smoke test, run `npm run db:setup`, start the server, sign in with each role, and verify patient registration, appointment booking, consultation, lab order/result updates, medicine dispensing, admission, invoice creation, payment recording, and audit-log visibility.

## Project Structure

```text
prisma/
	schema.prisma       Database models and relations
	seed.ts             Repeatable local demo data
src/
	app/
		api/               REST route handlers
		dashboard/         Authenticated application pages
		login/             Login screen
		components/        Shared UI components
		lib/               Authentication and database helpers
public/                Static assets
```

## License

No license has been declared yet. Add a license file before distributing this project publicly or using it as a shared dependency.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
