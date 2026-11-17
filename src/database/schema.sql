-- ====================================================================
-- DBMS MINI PROJECT: INSURANCE CLAIM MANAGEMENT SYSTEM
-- Course: Database Management Systems (CS304)
-- Authors: Abhishek Patil (Roll 02) & Jonty Arakh (Roll 12)
-- Normalization: 3rd Normal Form (3NF) compliant
-- Target DBMS: SQLite 3 / PostgreSQL Compatible
-- ====================================================================

PRAGMA foreign_keys = ON;

-- --------------------------------------------------------------------
-- 1. CUSTOMER ENTITY
-- Primary Key: Customer_ID
-- Integrity: Unique Email & Phone validation
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Customer (
    Customer_ID INTEGER PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    Phone VARCHAR(15) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE
);

-- --------------------------------------------------------------------
-- 2. POLICY ENTITY
-- Primary Key: Policy_ID
-- Foreign Key: Customer_ID references Customer(Customer_ID)
-- Constraints: CHECK (Premium > 0), CHECK (End_Date >= Start_Date)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Policy (
    Policy_ID INTEGER PRIMARY KEY,
    Customer_ID INTEGER NOT NULL,
    Policy_Type VARCHAR(20) NOT NULL CHECK (Policy_Type IN ('Health', 'Vehicle', 'Life', 'Property', 'Travel')),
    Premium DECIMAL(10,2) NOT NULL CHECK (Premium > 0),
    Start_Date DATE NOT NULL,
    End_Date DATE NOT NULL,
    CONSTRAINT fk_policy_customer FOREIGN KEY (Customer_ID) 
        REFERENCES Customer(Customer_ID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_policy_dates CHECK (End_Date >= Start_Date)
);

-- --------------------------------------------------------------------
-- 3. CLAIM ENTITY
-- Primary Key: Claim_ID
-- Foreign Key: Policy_ID references Policy(Policy_ID)
-- Constraints: CHECK (Claim_Amount > 0)
-- Valid Statuses: 'Pending', 'Under Verification', 'Approved', 'Rejected', 'Paid'
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Claim (
    Claim_ID INTEGER PRIMARY KEY,
    Policy_ID INTEGER NOT NULL,
    Claim_Date DATE NOT NULL,
    Claim_Amount DECIMAL(10,2) NOT NULL CHECK (Claim_Amount > 0),
    Claim_Status VARCHAR(25) NOT NULL DEFAULT 'Pending' 
        CHECK (Claim_Status IN ('Pending', 'Under Verification', 'Approved', 'Rejected', 'Paid')),
    Description TEXT NOT NULL,
    Rejection_Reason TEXT,
    CONSTRAINT fk_claim_policy FOREIGN KEY (Policy_ID) 
        REFERENCES Policy(Policy_ID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- --------------------------------------------------------------------
-- 4. PAYMENT ENTITY
-- Primary Key: Payment_ID
-- Foreign Key: Claim_ID references Claim(Claim_ID)
-- Constraints: Payment_Status IN ('Processing', 'Completed')
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Payment (
    Payment_ID INTEGER PRIMARY KEY,
    Claim_ID INTEGER NOT NULL UNIQUE, -- 1:1 settlement mapping per approved claim
    Payment_Date DATE NOT NULL,
    Amount DECIMAL(10,2) NOT NULL CHECK (Amount > 0),
    Payment_Status VARCHAR(20) NOT NULL DEFAULT 'Processing' 
        CHECK (Payment_Status IN ('Processing', 'Completed')),
    Transaction_Ref VARCHAR(50),
    CONSTRAINT fk_payment_claim FOREIGN KEY (Claim_ID) 
        REFERENCES Claim(Claim_ID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- --------------------------------------------------------------------
-- 5. ADMIN ENTITY
-- Primary Key: Admin_ID
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Admin (
    Admin_ID INTEGER PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL
);

-- --------------------------------------------------------------------
-- INDEXES FOR QUERY OPTIMIZATION
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_policy_customer ON Policy(Customer_ID);
CREATE INDEX IF NOT EXISTS idx_claim_policy ON Claim(Policy_ID);
CREATE INDEX IF NOT EXISTS idx_claim_status ON Claim(Claim_Status);
CREATE INDEX IF NOT EXISTS idx_payment_claim ON Payment(Claim_ID);

-- --------------------------------------------------------------------
-- ACID TRANSACTION DEMO: Payment Settlement Procedure
-- Updates Claim status to 'Paid' atomically when Payment is recorded
-- --------------------------------------------------------------------
-- BEGIN TRANSACTION;
-- INSERT INTO Payment (Payment_ID, Claim_ID, Payment_Date, Amount, Payment_Status, Transaction_Ref)
-- VALUES (403, 303, '2026-11-07', 50000.00, 'Completed', 'TXN-SETTLE-8812');
--
-- UPDATE Claim 
-- SET Claim_Status = 'Paid' 
-- WHERE Claim_ID = 303 AND Claim_Status = 'Approved';
-- COMMIT;

