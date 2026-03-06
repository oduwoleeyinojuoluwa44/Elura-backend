
# Elura — Product Requirements Document (PRD)

Version: 1.0
Product: Elura
Product Type: Beauty Professional Discovery & Booking Platform
Stage: MVP Development

---

# 1. PRODUCT OVERVIEW

## 1.1 Product Description

Elura is a platform designed to help makeup artists build professional profiles, showcase their work, and receive structured booking requests from clients.

The platform replaces the chaotic Instagram-based workflow currently used by makeup artists with a structured professional system.

Elura focuses on three core functions:

• Professional portfolio hosting  
• Artist discovery and filtering  
• Structured booking requests  

The long-term goal is to build the **operating system for beauty professionals.**

---

# 2. PROBLEM STATEMENT

## 2.1 Problems Faced by Makeup Artists

Currently makeup artists depend heavily on social media platforms to get clients. This creates several issues:

1. Discovery depends on algorithms
2. Portfolios are mixed with personal content
3. Booking conversations happen in DMs
4. Clients cannot easily compare artists
5. Artists have no professional digital identity

---

## 2.2 Problems Faced by Clients

Clients also experience significant problems:

1. Hard to discover artists near them
2. Hard to evaluate skill level
3. No centralized place to browse artists
4. Booking process is unclear
5. Price transparency is poor

---

# 3. PRODUCT VISION

## 3.1 Long-Term Vision

Elura aims to become the professional infrastructure for beauty artists.

The platform will eventually allow artists to manage:

• portfolios  
• bookings  
• payments  
• client relationships  

---

## 3.2 Product Positioning

Elura is NOT:

• A social media platform  
• A content platform  

Elura IS:

• A professional discovery and booking platform for makeup artists

---

# 4. TARGET USERS

## 4.1 Primary Users

Makeup artists including:

• Bridal makeup artists  
• Freelance artists  
• Editorial artists  
• Beauty influencers transitioning to professional work  

---

## 4.2 Secondary Users

Clients searching for makeup artists for:

• Weddings  
• Birthdays  
• Photoshoots  
• Personal events  

---

# 5. SUCCESS METRICS

## 5.1 MVP Metrics

Success for MVP is defined as:

• 50+ artists onboarded  
• 20+ booking requests submitted  
• Active portfolio uploads  

---

## 5.2 Long-Term Metrics

• High artist retention  
• High booking activity  
• Geographic concentration of artists  

---

# 6. MVP PRODUCT FLOW

Artist Signup  
↓  
Profile Creation  
↓  
Portfolio Upload  
↓  
Discovery by Clients  
↓  
Booking Request

---

# 7. MVP FEATURES

## FEATURE 1 — ARTIST AUTHENTICATION

### Objective

Allow makeup artists to create accounts and access their dashboards.

### Step-by-Step Flow

STEP 1 — Artist visits signup page  
STEP 2 — Artist creates account using email  
STEP 3 — System creates artist record in database  
STEP 4 — Artist is redirected to profile setup  

### Requirements

• Email signup/login  
• Secure authentication  
• Session management  

---

## FEATURE 2 — ARTIST PROFILE

### Objective

Provide each makeup artist with a professional public page.

### Step-by-Step Flow

STEP 1 — Artist completes profile setup  
STEP 2 — Artist enters professional details  
STEP 3 — System stores profile data  
STEP 4 — Public profile page becomes accessible  

### Profile Fields

• Name  
• Username  
• Profile picture  
• Location  
• Bio  
• Specialties  
• Price range  
• Instagram link  

### Public URL Format

elura.app/artist/{username}

### Profile Goals

The profile should allow clients to quickly understand:

• the artist’s style  
• experience level  
• pricing range  
• portfolio quality  

---

## FEATURE 3 — PORTFOLIO SYSTEM

### Objective

Allow artists to showcase their work visually.

This is the **most important trust signal** in the platform.

### Step-by-Step Flow

STEP 1 — Artist enters dashboard  
STEP 2 — Artist uploads portfolio images  
STEP 3 — Images stored in Supabase Storage  
STEP 4 — Images appear in public profile grid  

### Requirements

• Multiple image upload  
• Image compression  
• Grid layout display  

---

## FEATURE 4 — DISCOVERY PAGE

### Objective

Allow clients to browse available makeup artists.

### Step-by-Step Flow

STEP 1 — Client visits discovery page  
STEP 2 — System loads artist profiles  
STEP 3 — Client applies filters  
STEP 4 — Client views artist profiles  

### Discovery Card Elements

• Profile image  
• Name  
• Specialty  
• Location  
• Price range  

### Filters

• Location  
• Specialty  
• Price range  

---

## FEATURE 5 — BOOKING REQUEST

### Objective

Allow clients to send structured booking requests to artists.

### Step-by-Step Flow

STEP 1 — Client visits artist profile  
STEP 2 — Client clicks "Request Booking"  
STEP 3 — Client fills booking form  
STEP 4 — System stores request  
STEP 5 — Artist receives notification  

### Booking Form Fields

• Client name  
• Event type  
• Event date  
• Message  

---

# 8. MVP AI FEATURE

## AI Consultation Pack Generator

### Objective

Provide structured preparation for makeup sessions.

### Step-by-Step Flow

STEP 1 — Artist opens AI tool in dashboard  
STEP 2 — Artist enters job details (event type, skin type, finish, notes)  
STEP 3 — System sends request to AI API  
STEP 4 — AI generates consultation pack  
STEP 5 — Results displayed to artist  

### AI Output Includes

1. Client consultation questionnaire  
2. Pre‑appointment preparation message  
3. Makeup kit checklist  
4. Appointment timeline  
5. Professional tips  

---

# 9. TECHNICAL ARCHITECTURE

Frontend: Next.js  
Backend: Supabase  
Database: PostgreSQL  
Image Storage: Supabase Storage  
Hosting: Vercel  
AI Integration: OpenAI API  

---

# 10. DATABASE STRUCTURE

## Artists

• id  
• name  
• username  
• bio  
• location  
• specialty  
• price_range  
• instagram  
• created_at  

## Portfolio Images

• id  
• artist_id  
• image_url  
• created_at  

## Booking Requests

• id  
• artist_id  
• client_name  
• event_type  
• event_date  
• message  
• created_at  

---

# 11. FUTURE FEATURES

• Reviews & Ratings  
• Secure Payments  
• In‑App Messaging  
• Verified Artist Profiles  
• Advanced Discovery Filters  
• AI Look Analyzer  
• AI Pricing Insights  

---

# 12. DEVELOPMENT PHASES

Phase 1 — Waitlist (Completed)  
Phase 2 — MVP Development  
Phase 3 — Beta Launch with early artists  
Phase 4 — Public Launch  

---

# 13. LONG TERM GOAL

Elura becomes the digital infrastructure where beauty professionals manage:

• portfolios  
• bookings  
• payments  
• client relationships  

The platform evolves into the **operating system for beauty professionals.**
