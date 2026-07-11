# Enterprise POS System — Features

> **Version:** 1.0.0  
> **Status:** Phase 0 — Documentation & Planning  
> **Last Updated:** 2026-07-11

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [Business Management](#3-business-management)
4. [Product Management](#4-product-management)
5. [Inventory](#5-inventory)
6. [Customer Management](#6-customer-management)
7. [Supplier Management](#7-supplier-management)
8. [Purchase Management](#8-purchase-management)
9. [Point of Sale (POS)](#9-point-of-sale-pos)
10. [Accounting](#10-accounting)
11. [Reports & Analytics](#11-reports--analytics)
12. [Enterprise Features](#12-enterprise-features)

---

## 1. Authentication

### 1.1 Login

| Feature | Description |
|---------|-------------|
| Email & Password Login | Authenticate users with verified credentials |
| Remember Me | Extend session duration via persistent refresh token |
| Login Rate Limiting | Block brute-force attempts after repeated failures |
| Failed Attempt Logging | Record all failed login attempts in audit log |
| Session Management | Active sessions tracked and invalidatable by admin |

### 1.2 Registration

| Feature | Description |
|---------|-------------|
| Admin-Controlled Registration | New user accounts created only by system administrators |
| Email Verification | New accounts require email verification before activation |
| Initial Password Setup | Users receive a secure link to set their initial password |

### 1.3 Password Reset

| Feature | Description |
|---------|-------------|
| Forgot Password Flow | User requests reset via registered email address |
| Secure Reset Link | Time-limited, single-use token delivered via email |
| Password Strength Enforcement | New passwords validated against complexity requirements |
| Reset Audit Trail | All password change events logged in audit system |

### 1.4 Token Management

| Feature | Description |
|---------|-------------|
| JWT Access Token | Short-lived token (15 minutes) used for API authentication |
| Refresh Token | Long-lived token (7 days) stored in HttpOnly cookie |
| Token Rotation | Refresh token replaced on every refresh operation |
| Token Revocation | Refresh tokens invalidated on logout or admin revocation |
| Silent Refresh | Frontend automatically refreshes access token before expiry |

---

## 2. User Management

### 2.1 Users

| Feature | Description |
|---------|-------------|
| User Profile Management | Create, update, and deactivate user accounts |
| Avatar Upload | Profile image upload with server-side storage |
| Account Status Control | Activate or deactivate user accounts without deletion |
| User Search & Filter | Search by name, email, role, branch, or status |
| User Activity Log | View per-user action history from audit log |

### 2.2 Employees

| Feature | Description |
|---------|-------------|
| Employee Records | Store personal details, contact info, and employment metadata |
| Branch Assignment | Assign employees to one or multiple branches |
| User Account Linking | Link employee record to system user account |
| Employment Status | Track active, inactive, or terminated status |

### 2.3 Roles

| Feature | Description |
|---------|-------------|
| Role Definition | Create named roles representing job functions (e.g., Cashier, Manager) |
| Role Assignment | Assign one or more roles to each user |
| Default Roles | System provides predefined roles: Super Admin, Manager, Cashier, Accountant |
| Role Cloning | Duplicate an existing role to create a similar variant |

### 2.4 Permissions

| Feature | Description |
|---------|-------------|
| Permission Matrix | Granular permissions mapped to module actions (create, read, update, delete) |
| Role-Permission Binding | Each role is assigned a set of permissions |
| Permission Override | Individual user-level permission overrides for edge cases |
| Permission Audit | All permission changes tracked in audit log |

---

## 3. Business Management

### 3.1 Company

| Feature | Description |
|---------|-------------|
| Company Profile | Name, logo, address, contact, tax registration number |
| Business Type | Configure as retail, wholesale, or hybrid |
| Currency Settings | Set default currency and display format |
| Fiscal Year Configuration | Define fiscal year start/end for reporting |

### 3.2 Branch

| Feature | Description |
|---------|-------------|
| Branch Creation | Register physical or virtual branches under the company |
| Branch Details | Name, address, contact, manager, and operating hours |
| Branch-Level Data | Sales, inventory, and staff scoped per branch |
| Consolidated View | Aggregated reports spanning all branches |

### 3.3 Settings

| Feature | Description |
|---------|-------------|
| System Preferences | Date format, number format, language, timezone |
| Invoice Configuration | Invoice prefix, numbering sequence, footer text |
| POS Settings | Default tax, receipt options, payment methods |
| Notification Settings | Configure email/in-app notification triggers |
| Backup Schedule | Configure automated backup frequency and retention |

---

## 4. Product Management

### 4.1 Product

| Feature | Description |
|---------|-------------|
| Product Creation | Name, SKU, description, images, and attributes |
| Product Variants | Manage size, color, or other variant dimensions |
| Pricing | Cost price, selling price, wholesale price |
| Tax Assignment | Link applicable tax rates to each product |
| Product Status | Active, inactive, or discontinued states |
| Bulk Import | Import products via CSV file |
| Product Search | Full-text search with filter by category, brand, and status |

### 4.2 Category

| Feature | Description |
|---------|-------------|
| Hierarchical Categories | Multi-level category tree (parent/child structure) |
| Category Image | Optional image for visual category navigation |
| Category Management | Create, rename, merge, and archive categories |

### 4.3 Brand

| Feature | Description |
|---------|-------------|
| Brand Registry | Maintain a list of product manufacturers or brands |
| Brand Logo | Store brand logo for display in product listings |
| Brand-Product Association | Filter and report products by brand |

### 4.4 Unit

| Feature | Description |
|---------|-------------|
| Unit of Measure | Define units (piece, kg, liter, box, dozen, etc.) |
| Unit Conversion | Define conversion factors between related units |
| Default Unit | Set a default unit per product |

### 4.5 Barcode

| Feature | Description |
|---------|-------------|
| Barcode Assignment | Assign one or multiple barcodes per product/variant |
| Barcode Generation | Auto-generate EAN-13 or CODE-128 barcodes |
| Barcode Printing | Print single or batch barcode labels |
| Barcode Scanning | Lookup product by scanned barcode at POS |

### 4.6 Tax

| Feature | Description |
|---------|-------------|
| Tax Rate Definition | Define named tax rates with percentage values |
| Tax Groups | Group multiple tax rates into a combined tax |
| Tax Inclusion Mode | Configure prices as tax-inclusive or tax-exclusive |
| Tax Reporting | Generate tax collection summaries by period |

---

## 5. Inventory

### 5.1 Warehouse

| Feature | Description |
|---------|-------------|
| Warehouse Registry | Register storage locations (warehouses, store rooms) |
| Branch Assignment | Link each warehouse to a branch |
| Warehouse Capacity | Optional capacity tracking per warehouse |

### 5.2 Stock Management

| Feature | Description |
|---------|-------------|
| Stock Tracking | Real-time quantity on hand per product per warehouse |
| Low Stock Alerts | Configurable threshold triggers notification when stock is low |
| Stock Valuation | FIFO or average cost valuation methods |
| Stock Overview | Dashboard view of stock levels across all warehouses |

### 5.3 Stock Adjustment

| Feature | Description |
|---------|-------------|
| Manual Adjustment | Increase or decrease stock with reason and reference |
| Stocktake / Physical Count | Record physical count and auto-calculate variance |
| Adjustment Approval | Optional manager approval workflow for adjustments |
| Adjustment History | Full log of all adjustments with user and timestamp |

### 5.4 Stock Transfer

| Feature | Description |
|---------|-------------|
| Inter-Warehouse Transfer | Move stock between warehouses within the same branch |
| Inter-Branch Transfer | Transfer stock between different branches |
| Transfer Request Workflow | Request, approve, dispatch, and receive flow |
| Transfer History | Full audit trail of all stock movements |

---

## 6. Customer Management

### 6.1 Customer Profile

| Feature | Description |
|---------|-------------|
| Customer Record | Name, contact, address, and account details |
| Customer Type | Retail or wholesale customer classification |
| Credit Limit | Define and enforce maximum credit balance per customer |
| Customer Balance | Track outstanding balance and payment history |
| Customer Search | Search and filter by name, phone, email, or type |

### 6.2 Purchase History

| Feature | Description |
|---------|-------------|
| Sales History | View all sales transactions linked to a customer |
| Total Spend | Aggregate spending per customer over any date range |
| Invoice Access | View and reprint individual invoices from customer profile |
| Return History | View all returned sales associated with a customer |

---

## 7. Supplier Management

### 7.1 Supplier Profile

| Feature | Description |
|---------|-------------|
| Supplier Record | Company name, contact person, address, and banking details |
| Supplier Balance | Track outstanding payables to each supplier |
| Payment Terms | Define credit days and default payment conditions |
| Supplier Status | Active or inactive classification |

### 7.2 Purchase History

| Feature | Description |
|---------|-------------|
| Purchase Orders | View all purchase orders placed with a supplier |
| Goods Received | History of all stock received from supplier |
| Returns | Record and track purchase returns to supplier |
| Payment History | Log of all payments made to supplier |

---

## 8. Purchase Management

### 8.1 Purchase Order

| Feature | Description |
|---------|-------------|
| PO Creation | Create structured purchase orders with line items |
| Supplier Assignment | Link each PO to a registered supplier |
| Expected Delivery Date | Record and track expected arrival dates |
| PO Status | Draft, Sent, Partial, Received, Cancelled |
| PO Approval | Optional manager approval before sending to supplier |
| PDF Export | Generate printable purchase order document |

### 8.2 Purchase Receive

| Feature | Description |
|---------|-------------|
| Goods Receipt Note (GRN) | Record items received against a purchase order |
| Partial Receive | Accept and record partial deliveries |
| Stock Auto-Update | Received quantities automatically added to warehouse stock |
| Discrepancy Recording | Log differences between ordered and received quantities |

### 8.3 Purchase Return

| Feature | Description |
|---------|-------------|
| Return to Supplier | Create return transactions for defective or excess goods |
| Stock Deduction | Returned items automatically deducted from stock |
| Return Reason | Record reason codes for each return transaction |
| Credit Note | Generate supplier credit note for returned goods |

---

## 9. Point of Sale (POS)

### 9.1 Product Search

| Feature | Description |
|---------|-------------|
| Barcode Scan | Instantly add products to cart via barcode scanner |
| Text Search | Search products by name, SKU, or category |
| Category Browse | Visually browse and select products by category grid |
| Recent Products | Quick access to recently sold or favourite products |

### 9.2 Cart

| Feature | Description |
|---------|-------------|
| Add / Remove Items | Full cart management with quantity editing |
| Quantity Adjustment | Inline quantity increment/decrement per line item |
| Line Discount | Apply percentage or fixed discount per cart item |
| Cart Discount | Apply overall discount to entire cart |
| Customer Assignment | Attach a customer record to the sale |
| Cart Hold | Pause and resume transactions (multiple held carts) |
| Notes | Add line-level or order-level notes |

### 9.3 Checkout

| Feature | Description |
|---------|-------------|
| Tax Calculation | Automatic tax computation based on product tax settings |
| Subtotal / Discount / Tax / Total | Clear breakdown of all pricing components |
| Change Calculation | Auto-compute change due for cash payments |

### 9.4 Invoice

| Feature | Description |
|---------|-------------|
| Auto-Generated Invoice Number | Sequential, configurable invoice numbering |
| Invoice PDF | Generate printable invoice with company branding |
| Invoice Status | Paid, Partial, Unpaid, Voided |
| Invoice Reprint | Reprint any historical invoice |

### 9.5 Payment

| Feature | Description |
|---------|-------------|
| Cash Payment | Accept and record cash payments |
| Card Payment | Record card payment (external terminal reference) |
| Split Payment | Accept multiple payment methods in a single transaction |
| Credit / Account Payment | Charge to customer credit account |
| Payment Validation | Prevent underpayment on non-credit sales |

### 9.6 Receipt

| Feature | Description |
|---------|-------------|
| Thermal Receipt | Print compact receipt for thermal receipt printers |
| Digital Receipt | Send receipt via email to customer |
| Receipt Customization | Configure business logo, footer message, and contact info |

---

## 10. Accounting

### 10.1 Income

| Feature | Description |
|---------|-------------|
| Income Records | Log income entries with category, amount, and date |
| Auto Income from Sales | Sales payments automatically create income records |
| Income Categories | Classify income by type (Sales, Services, Other) |

### 10.2 Expense

| Feature | Description |
|---------|-------------|
| Expense Records | Log expenses with category, amount, description, and date |
| Expense Categories | Classify expenses (Rent, Utilities, Salaries, etc.) |
| Receipt Attachment | Attach digital receipt or invoice to expense records |
| Expense Approval | Optional approval workflow for high-value expenses |

### 10.3 Ledger

| Feature | Description |
|---------|-------------|
| General Ledger | Chronological record of all financial transactions |
| Account Balances | Running balance per account or category |
| Period Filtering | View ledger for any date range |

### 10.4 Profit / Loss

| Feature | Description |
|---------|-------------|
| P&L Summary | Period-based income vs. expense comparison |
| Gross Profit Calculation | Revenue minus cost of goods sold |
| Net Profit Calculation | Gross profit minus all operating expenses |
| Branch P&L | Independent profit/loss view per branch |

---

## 11. Reports & Analytics

### 11.1 Sales Report

| Feature | Description |
|---------|-------------|
| Daily / Weekly / Monthly Summary | Aggregated sales totals by period |
| Sales by Product | Top-selling products ranked by revenue or quantity |
| Sales by Category | Revenue breakdown by product category |
| Sales by Branch | Comparative sales across branches |
| Sales by User | Per-cashier or per-employee performance |

### 11.2 Purchase Report

| Feature | Description |
|---------|-------------|
| Purchase Summary | Total purchases by period |
| Purchase by Supplier | Spending breakdown per supplier |
| Pending Orders | Outstanding purchase orders not yet received |

### 11.3 Inventory Report

| Feature | Description |
|---------|-------------|
| Stock Status | Current stock levels per product per warehouse |
| Low Stock Report | Products at or below reorder threshold |
| Stock Movement Report | History of all stock changes by product or period |
| Stock Valuation Report | Total inventory value at cost |

### 11.4 Financial Report

| Feature | Description |
|---------|-------------|
| Income vs. Expense | Side-by-side comparison by period |
| Tax Collection Report | Total tax collected by period and rate |
| Customer Balance Report | Outstanding receivables per customer |
| Supplier Balance Report | Outstanding payables per supplier |

---

## 12. Enterprise Features

### 12.1 Audit Log

| Feature | Description |
|---------|-------------|
| Comprehensive Logging | Every create, update, and delete action recorded |
| User Attribution | Each log entry linked to the performing user |
| Before / After Values | Record of data state before and after changes |
| Module Filtering | Filter audit log by module, action type, or user |
| Timestamp & IP | Log includes timestamp and originating IP address |
| Tamper Protection | Audit records are append-only and cannot be deleted |

### 12.2 Notifications

| Feature | Description |
|---------|-------------|
| In-App Notifications | Real-time alerts displayed within the application |
| Email Notifications | Email alerts for configurable business events |
| Notification Events | Low stock, new purchase order, payment received, failed login |
| Notification Preferences | Per-user control over which notifications to receive |
| Notification History | Browsable history of all sent notifications |

### 12.3 Backup

| Feature | Description |
|---------|-------------|
| Manual Backup | On-demand full database backup triggered by admin |
| Scheduled Backup | Automated backups at configured daily/weekly intervals |
| Backup Storage | Backups stored locally or to configured remote storage |
| Backup Manifest | Metadata record of each backup including size and timestamp |

### 12.4 Restore

| Feature | Description |
|---------|-------------|
| Backup Selection | Admin selects from available backup snapshots |
| Pre-Restore Validation | System validates backup integrity before restore |
| Restore Confirmation | Explicit admin confirmation required before restore execution |
| Restore Log | Record of all restore operations in audit log |

---

*This document is part of the Enterprise POS System Phase 0 documentation suite.*
