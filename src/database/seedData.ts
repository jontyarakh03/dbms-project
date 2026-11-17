import { Customer, Policy, Claim, Payment, Admin } from '../types/database';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    Customer_ID: 101,
    Name: 'Rahul Patil',
    Address: 'Pune, Maharashtra',
    Phone: '9876501234',
    Email: 'rahul@mail.com',
    Created_At: '2026-01-10T10:00:00Z',
  },
  {
    Customer_ID: 102,
    Name: 'Sneha Kulkarni',
    Address: 'Mumbai, Maharashtra',
    Phone: '9822012345',
    Email: 'sneha@mail.com',
    Created_At: '2026-01-12T11:30:00Z',
  },
  {
    Customer_ID: 103,
    Name: 'Amit Deshmukh',
    Address: 'Nashik, Maharashtra',
    Phone: '9890123456',
    Email: 'amit@mail.com',
    Created_At: '2026-01-15T14:15:00Z',
  },
];

export const INITIAL_POLICIES: Policy[] = [
  {
    Policy_ID: 201,
    Customer_ID: 101,
    Policy_Type: 'Health',
    Premium: 12000,
    Start_Date: '2026-04-01',
    End_Date: '2027-03-31',
  },
  {
    Policy_ID: 202,
    Customer_ID: 102,
    Policy_Type: 'Vehicle',
    Premium: 8500,
    Start_Date: '2026-01-16',
    End_Date: '2027-01-15',
  },
  {
    Policy_ID: 203,
    Customer_ID: 103,
    Policy_Type: 'Life',
    Premium: 25000,
    Start_Date: '2026-07-01',
    End_Date: '2036-06-30',
  },
];

export const INITIAL_CLAIMS: Claim[] = [
  {
    Claim_ID: 301,
    Policy_ID: 201,
    Claim_Date: '2026-08-10',
    Claim_Amount: 45000,
    Claim_Status: 'Pending',
    Description: 'Hospitalization expenses for acute dengue fever treatment and diagnostic scans.',
    Supporting_Doc_Name: 'Apollo_Hospital_Discharge_Summary_301.pdf',
    Updated_At: '2026-08-10T09:30:00Z',
  },
  {
    Claim_ID: 302,
    Policy_ID: 202,
    Claim_Date: '2026-08-18',
    Claim_Amount: 18000,
    Claim_Status: 'Under Verification',
    Description: 'Front bumper damage repair, headlamp replacement, and alignment after intersection collision.',
    Supporting_Doc_Name: 'Maruti_Authorized_Service_Repair_Estimate_302.pdf',
    Updated_At: '2026-08-19T14:20:00Z',
  },
  {
    Claim_ID: 303,
    Policy_ID: 203,
    Claim_Date: '2026-08-25',
    Claim_Amount: 50000,
    Claim_Status: 'Approved',
    Description: 'Maturity milestone claim for completed 10-year endowment policy duration.',
    Supporting_Doc_Name: 'LIC_Endowment_Maturity_Bond_Surrender_303.pdf',
    Updated_At: '2026-08-28T16:45:00Z',
  },
  {
    Claim_ID: 304,
    Policy_ID: 201,
    Claim_Date: '2026-07-02',
    Claim_Amount: 30000,
    Claim_Status: 'Paid',
    Description: 'Outpatient minor procedure with day-care surgery reimbursement and pre-hospitalization medicines.',
    Supporting_Doc_Name: 'Ruby_Hall_Clinic_Daycare_Invoice_304.pdf',
    Updated_At: '2026-09-05T12:10:00Z',
  },
  {
    Claim_ID: 305,
    Policy_ID: 202,
    Claim_Date: '2026-07-20',
    Claim_Amount: 9000,
    Claim_Status: 'Rejected',
    Description: 'Side mirror and door dent repair claim following parking scratch incident.',
    Rejection_Reason: 'Policy Clause 4.2 Violation: Incident reported without mandatory vehicle fitness certificate valid at incident date.',
    Supporting_Doc_Name: 'Garage_Inspection_Note_305.pdf',
    Updated_At: '2026-07-25T11:00:00Z',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    Payment_ID: 401,
    Claim_ID: 304,
    Payment_Date: '2026-09-05',
    Amount: 30000,
    Payment_Status: 'Completed',
    Transaction_Ref: 'TXN-HDFC-991204',
    Payment_Method: 'NEFT / Direct Bank Transfer',
  },
  {
    Payment_ID: 402,
    Claim_ID: 303,
    Payment_Date: '2026-09-20',
    Amount: 50000,
    Payment_Status: 'Processing',
    Transaction_Ref: 'TXN-ICICI-884021',
    Payment_Method: 'RTGS Electronic Settlement',
  },
];

export const INITIAL_ADMINS: Admin[] = [
  {
    Admin_ID: 1,
    Name: 'Vikram Malhotra',
    Email: 'admin@claimvault.in',
    Password: '$2a$12$e82/hash.mocked.saltedAdminSecret2026',
    Role: 'Chief Claims Adjudicator',
    Avatar: 'VM',
  },
  {
    Admin_ID: 2,
    Name: 'Priya Sundaram',
    Email: 'priya@claimvault.in',
    Password: '$2a$12$y19/hash.mocked.priyaSecret2026',
    Role: 'Senior Verification Officer',
    Avatar: 'PS',
  },
  {
    Admin_ID: 3,
    Name: 'Anand Verma',
    Email: 'anand@claimvault.in',
    Password: '$2a$12$k44/hash.mocked.anandSecret2026',
    Role: 'Settlement & Audit Manager',
    Avatar: 'AV',
  },
];
