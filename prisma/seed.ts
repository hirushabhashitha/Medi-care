import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Simple password hashing for seed (same as auth.ts but standalone for seed script)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${saltHex}:${hashHex}`;
}

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Departments ──
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'General Medicine' },
      update: {},
      create: { name: 'General Medicine', description: 'General medical consultations and internal medicine' },
    }),
    prisma.department.upsert({
      where: { name: 'Cardiology' },
      update: {},
      create: { name: 'Cardiology', description: 'Heart and cardiovascular system' },
    }),
    prisma.department.upsert({
      where: { name: 'Pediatrics' },
      update: {},
      create: { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents' },
    }),
    prisma.department.upsert({
      where: { name: 'Orthopedics' },
      update: {},
      create: { name: 'Orthopedics', description: 'Musculoskeletal system, bones, joints, ligaments' },
    }),
    prisma.department.upsert({
      where: { name: 'Dermatology' },
      update: {},
      create: { name: 'Dermatology', description: 'Skin, hair, and nail conditions' },
    }),
    prisma.department.upsert({
      where: { name: 'Emergency' },
      update: {},
      create: { name: 'Emergency', description: 'Emergency and trauma care' },
    }),
    prisma.department.upsert({
      where: { name: 'Radiology' },
      update: {},
      create: { name: 'Radiology', description: 'Diagnostic imaging (X-ray, MRI, CT scans)' },
    }),
    prisma.department.upsert({
      where: { name: 'Pharmacy' },
      update: {},
      create: { name: 'Pharmacy', description: 'Medication dispensing and inventory' },
    }),
    prisma.department.upsert({
      where: { name: 'Laboratory' },
      update: {},
      create: { name: 'Laboratory', description: 'Pathology and diagnostic lab services' },
    }),
    prisma.department.upsert({
      where: { name: 'Neurology' },
      update: {},
      create: { name: 'Neurology', description: 'Nervous system disorders' },
    }),
  ]);

  console.log(`✅ Created ${departments.length} departments`);

  // ── Users (one per role) ──
  const usersData: {
    email: string;
    username: string;
    password: string;
    role: Role;
    firstName: string;
    lastName: string;
    designation: string;
    departmentName?: string;
  }[] = [
    {
      email: 'admin@medicore.com',
      username: 'admin',
      password: 'admin123',
      role: 'ADMINISTRATOR',
      firstName: 'System',
      lastName: 'Administrator',
      designation: 'System Admin',
    },
    {
      email: 'dr.silva@medicore.com',
      username: 'dr.silva',
      password: 'doctor123',
      role: 'DOCTOR',
      firstName: 'Kamal',
      lastName: 'Silva',
      designation: 'Senior Consultant',
      departmentName: 'General Medicine',
    },
    {
      email: 'dr.fernando@medicore.com',
      username: 'dr.fernando',
      password: 'doctor123',
      role: 'DOCTOR',
      firstName: 'Nimal',
      lastName: 'Fernando',
      designation: 'Consultant Cardiologist',
      departmentName: 'Cardiology',
    },
    {
      email: 'nurse.perera@medicore.com',
      username: 'nurse.perera',
      password: 'nurse123',
      role: 'NURSE',
      firstName: 'Kumari',
      lastName: 'Perera',
      designation: 'Senior Nurse',
      departmentName: 'General Medicine',
    },
    {
      email: 'reception@medicore.com',
      username: 'reception',
      password: 'reception123',
      role: 'RECEPTIONIST',
      firstName: 'Dilani',
      lastName: 'Jayawardena',
      designation: 'Front Desk Officer',
    },
    {
      email: 'lab@medicore.com',
      username: 'labtech',
      password: 'lab123',
      role: 'LAB_STAFF',
      firstName: 'Sunil',
      lastName: 'Bandara',
      designation: 'Lab Technician',
      departmentName: 'Laboratory',
    },
    {
      email: 'pharmacy@medicore.com',
      username: 'pharmacist',
      password: 'pharmacy123',
      role: 'PHARMACIST',
      firstName: 'Ruwan',
      lastName: 'Wijesekara',
      designation: 'Chief Pharmacist',
      departmentName: 'Pharmacy',
    },
    {
      email: 'accounts@medicore.com',
      username: 'accountant',
      password: 'accounts123',
      role: 'ACCOUNTANT',
      firstName: 'Malini',
      lastName: 'Rathnayake',
      designation: 'Senior Accountant',
    },
  ];

  let employeeCounter = 1;

  for (const userData of usersData) {
    const hashedPassword = await hashPassword(userData.password);
    const dept = userData.departmentName
      ? departments.find(d => d.name === userData.departmentName)
      : null;

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        username: userData.username,
        passwordHash: hashedPassword,
        role: userData.role,
        isActive: true,
      },
    });

    const empCode = `EMP${String(employeeCounter++).padStart(4, '0')}`;

    await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        employeeCode: empCode,
        firstName: userData.firstName,
        lastName: userData.lastName,
        designation: userData.designation,
        departmentId: dept?.id,
        phone: `+94 7${Math.floor(10000000 + Math.random() * 90000000)}`,
      },
    });

    // Create Doctor record for doctors
    if (userData.role === 'DOCTOR') {
      await prisma.doctor.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          departmentId: dept?.id,
          specialization: userData.departmentName || 'General',
          qualification: 'MBBS, MD',
          consultationFee: userData.departmentName === 'Cardiology' ? 3500 : 2500,
          availableSlots: JSON.stringify({
            monday: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'],
            tuesday: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'],
            wednesday: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
            thursday: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'],
            friday: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30'],
          }),
        },
      });
    }

    console.log(`  👤 ${userData.role}: ${userData.username} / ${userData.password}`);
  }

  console.log(`\n✅ Created ${usersData.length} users with employee records`);

  // ── Lab Tests Catalog ──
  const labTests = [
    { name: 'Complete Blood Count (CBC)', category: 'Hematology', normalRange: 'WBC: 4.5-11.0 x10⁹/L', unit: 'x10⁹/L', price: 800 },
    { name: 'Blood Glucose (Fasting)', category: 'Biochemistry', normalRange: '70-100 mg/dL', unit: 'mg/dL', price: 500 },
    { name: 'Lipid Profile', category: 'Biochemistry', normalRange: 'Total Cholesterol: <200 mg/dL', unit: 'mg/dL', price: 1500 },
    { name: 'Liver Function Test (LFT)', category: 'Biochemistry', normalRange: 'ALT: 7-56 U/L', unit: 'U/L', price: 1800 },
    { name: 'Renal Function Test (RFT)', category: 'Biochemistry', normalRange: 'Creatinine: 0.7-1.3 mg/dL', unit: 'mg/dL', price: 1600 },
    { name: 'Thyroid Panel (TSH, T3, T4)', category: 'Endocrinology', normalRange: 'TSH: 0.4-4.0 mIU/L', unit: 'mIU/L', price: 2500 },
    { name: 'Urinalysis', category: 'Clinical Pathology', normalRange: 'pH: 4.5-8.0', unit: '-', price: 400 },
    { name: 'Chest X-Ray', category: 'Radiology', normalRange: 'N/A', unit: '-', price: 1200 },
    { name: 'ECG (Electrocardiogram)', category: 'Cardiology', normalRange: 'Normal Sinus Rhythm', unit: '-', price: 1000 },
    { name: 'HbA1c', category: 'Biochemistry', normalRange: '<5.7%', unit: '%', price: 1200 },
  ];

  for (const test of labTests) {
    await prisma.labTest.upsert({
      where: { name: test.name },
      update: {},
      create: test,
    });
  }

  console.log(`✅ Created ${labTests.length} lab tests`);

  // ── Sample Medicines ──
  const medicines = [
    { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', brand: 'Panadol', category: 'Tablet', unitCost: 2, sellingPrice: 5, stockQty: 5000, reorderLevel: 500, manufacturer: 'GSK' },
    { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', brand: 'Amoxil', category: 'Capsule', unitCost: 8, sellingPrice: 15, stockQty: 2000, reorderLevel: 200, manufacturer: 'Pfizer' },
    { name: 'Omeprazole 20mg', genericName: 'Omeprazole', brand: 'Losec', category: 'Capsule', unitCost: 5, sellingPrice: 12, stockQty: 3000, reorderLevel: 300, manufacturer: 'AstraZeneca' },
    { name: 'Metformin 500mg', genericName: 'Metformin HCl', brand: 'Glucophage', category: 'Tablet', unitCost: 3, sellingPrice: 8, stockQty: 4000, reorderLevel: 400, manufacturer: 'Merck' },
    { name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', brand: 'Norvasc', category: 'Tablet', unitCost: 4, sellingPrice: 10, stockQty: 2500, reorderLevel: 250, manufacturer: 'Pfizer' },
    { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', brand: 'Zyrtec', category: 'Tablet', unitCost: 3, sellingPrice: 7, stockQty: 3500, reorderLevel: 350, manufacturer: 'UCB' },
    { name: 'Azithromycin 250mg', genericName: 'Azithromycin', brand: 'Zithromax', category: 'Tablet', unitCost: 15, sellingPrice: 30, stockQty: 1500, reorderLevel: 150, manufacturer: 'Pfizer' },
    { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', brand: 'Brufen', category: 'Tablet', unitCost: 3, sellingPrice: 6, stockQty: 4500, reorderLevel: 500, manufacturer: 'Abbott' },
    { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', brand: 'Ventolin', category: 'Inhaler', unitCost: 120, sellingPrice: 250, stockQty: 200, reorderLevel: 30, manufacturer: 'GSK' },
    { name: 'Diclofenac Gel 1%', genericName: 'Diclofenac', brand: 'Voltaren', category: 'Topical', unitCost: 80, sellingPrice: 150, stockQty: 300, reorderLevel: 50, manufacturer: 'Novartis' },
  ];

  for (const med of medicines) {
    await prisma.medicine.create({
      data: {
        ...med,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });
  }

  console.log(`✅ Created ${medicines.length} medicines`);

  // ── Wards & Beds ──
  const wardsData = [
    { name: 'General Ward A', type: 'General', totalBeds: 10, floor: 'Ground Floor', dailyRate: 1500 },
    { name: 'General Ward B', type: 'General', totalBeds: 10, floor: 'Ground Floor', dailyRate: 1500 },
    { name: 'Private Ward', type: 'Private', totalBeds: 5, floor: '1st Floor', dailyRate: 5000 },
    { name: 'ICU', type: 'ICU', totalBeds: 4, floor: '2nd Floor', dailyRate: 15000 },
    { name: 'Pediatric Ward', type: 'Semi-Private', totalBeds: 8, floor: '1st Floor', dailyRate: 2500 },
  ];

  for (const wardData of wardsData) {
    const ward = await prisma.ward.upsert({
      where: { name: wardData.name },
      update: {},
      create: {
        name: wardData.name,
        type: wardData.type,
        totalBeds: wardData.totalBeds,
        floor: wardData.floor,
      },
    });

    for (let i = 1; i <= wardData.totalBeds; i++) {
      const bedNumber = `${wardData.name.charAt(0)}${String(i).padStart(2, '0')}`;
      await prisma.bed.upsert({
        where: { wardId_bedNumber: { wardId: ward.id, bedNumber } },
        update: {},
        create: {
          wardId: ward.id,
          bedNumber,
          dailyRate: wardData.dailyRate,
        },
      });
    }
  }

  console.log(`✅ Created ${wardsData.length} wards with beds`);

  // ── Sample Patients ──
  const patients = [
    { patientCode: 'PAT0001', firstName: 'Amal', lastName: 'Wickramasinghe', gender: 'Male', bloodGroup: 'A+', phone: '+94 771234567', dateOfBirth: new Date('1985-03-15') },
    { patientCode: 'PAT0002', firstName: 'Sachini', lastName: 'Dissanayake', gender: 'Female', bloodGroup: 'B+', phone: '+94 772345678', dateOfBirth: new Date('1992-07-22') },
    { patientCode: 'PAT0003', firstName: 'Ranjith', lastName: 'Gunasekara', gender: 'Male', bloodGroup: 'O+', phone: '+94 773456789', dateOfBirth: new Date('1978-11-08') },
    { patientCode: 'PAT0004', firstName: 'Tharushi', lastName: 'Mendis', gender: 'Female', bloodGroup: 'AB+', phone: '+94 774567890', dateOfBirth: new Date('2000-01-30') },
    { patientCode: 'PAT0005', firstName: 'Nuwan', lastName: 'Rajapaksha', gender: 'Male', bloodGroup: 'O-', phone: '+94 775678901', dateOfBirth: new Date('1965-09-12') },
  ];

  for (const patient of patients) {
    await prisma.patient.upsert({
      where: { patientCode: patient.patientCode },
      update: {},
      create: patient,
    });
  }

  console.log(`✅ Created ${patients.length} sample patients`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('──────────────────────────────────────');
  console.log('  Default Login Credentials:');
  console.log('──────────────────────────────────────');
  console.log('  Admin:        admin / admin123');
  console.log('  Doctor:       dr.silva / doctor123');
  console.log('  Doctor:       dr.fernando / doctor123');
  console.log('  Nurse:        nurse.perera / nurse123');
  console.log('  Receptionist: reception / reception123');
  console.log('  Lab Tech:     labtech / lab123');
  console.log('  Pharmacist:   pharmacist / pharmacy123');
  console.log('  Accountant:   accountant / accounts123');
  console.log('──────────────────────────────────────\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
