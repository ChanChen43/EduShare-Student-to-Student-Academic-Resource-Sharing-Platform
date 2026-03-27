Design and generate a fully functional modern, web application  and responsive mobile designed web called "EduShare", a student-to-student academic resource sharing platform aligned with SDG 4 (Quality Education).
 design the ui like how you design a student to student academic resource sharing platform
its basically borrowing or lending items
design it nicely not just simple clean
IMPORTANT:

* Integrate Supabase as the backend (database + authentication + storage + realtime).
* Generate working React code with Supabase client integration.
* Include real CRUD operations using Supabase (not placeholders).
* Code must be clean, modular, and ready to export to GitHub and run locally.
* Must put step by step installation on local to run as well as the supabase setup with commands
assume that i dont use docker and just npm install stuff

STYLE:

* Stylish, modern UI 
* ight/dark mode toggle
* Rounded corners, card-based layout
* Bootstrap-style spacing
* mobile + desktop design

---

🔌 SUPABASE INTEGRATION REQUIREMENTS

* Use @supabase/supabase-js

* Create a supabaseClient.js file

* Use environment variables:
  REACT_APP_SUPABASE_URL
  REACT_APP_SUPABASE_KEY

* Implement:
  • Authentication (sign up, login, logout)
  • Database queries (insert, select, update)
  • Storage (image upload for items)
  • Realtime updates (for messages)
etc..other stuff

---

🗄️ DATABASE SCHEMA (USE THIS EXACT STRUCTURE 	OR ADD MORE WHEN NEEDED ESPECIALLY WITH THE STUFF I NEED)

Tables:

users:

* id (uuid, primary key)
* name (text)
* email (text)
* role (text: donor, beneficiary, admin)
* points (integer)

items:

* id (uuid)
* title (text)
* category (text)
* description (text)
* condition (text)
* status (text: Pending, Available, Reserved)
* donor_id (uuid)
* image_url (text)
* created_at (timestamp)

reservations:

* id (uuid)
* item_id (uuid)
* borrower_id (uuid)
* status (text)
* reserved_at (timestamp)
* expires_at (timestamp)

messages:

* id (uuid)
* sender_id (uuid)
* receiver_id (uuid)
* item_id (uuid)
* message_text (text)
* timestamp (timestamp)
  or other stuff to add that is needed on the database supabase like the email stuff
---

📄 PAGES TO GENERATE (WITH FUNCTIONAL LOGIC)

1. AUTHENTICATION

* Login & Register using Supabase Auth with email verification upon signing up
* Role selection stored in users table after signup

2. DASHBOARD

* Fetch and display user-specific data
* Navbar + Sidebar (role-based visibility)

3. ITEM LISTING

* Fetch items from Supabase
* Filter by category, status
* Search functionality
* Reserve button updates database

4. ADD ITEM

* Form inserts into Supabase
* Upload image to Supabase Storage
* Status defaults to "Pending"

5. RESERVATION SYSTEM

* Insert into reservations table
* Automatically set expiration (24 hours)
* Update item status to "Reserved"

6. MESSAGING SYSTEM

* Insert messages into messages table
* Display conversation per item
* Optional realtime subscription

7. ADMIN PANEL

* Fetch items where status = Pending
* Approve → update status to Available
* Reject → delete or mark rejected
* View users and stats

8. REPORTS DASHBOARD

* Fetch aggregated data:
  • total items
  • total users
  • items shared
* Display charts (bar/pie)
other stuff neded

---

📧 EMAIL NOTIFICATIONS (REQUIRED)

* Integrate Supabase Edge Functions 
* Send email when:
  • Item is reserved → notify donor
  • Reservation confirmed → notify borrower
     sign in verification

---

🎯 CORE FEATURES (MUST BE FUNCTIONAL)

* Item listing (CRUD with Supabase)
* Search & filter
* Reservation system (24-hour logic)
* Messaging system
* Admin approval system
* Karma points (increment donor points after successful exchange)
* Reports dashboard (real data)
all other stuff needed to be working

---

🧩 UX REQUIREMENTS

* Loading states
* Empty states
* Toast notifications (success/error)
* Clean navigation flow
* Consistent layout across pages
other stuff i mentioned

---





* Include:
  • Working API calls
  • Reusable components
  • Clean routing (React Router)
  • Ready for GitHub export
other stuff i mentioned

---



The final output must be a functional prototype that can run locally after adding environment variables and connecting to Supabase.
also make sure when i run this on my laptop every single react stuff for designing to backend is complete as well as the email verification upon signing up/register and the email notification for

Must put step by step installation on local to run as well as the supabase setup with commands
assume that i dont use docker and just npm install stuff
make sure to do everything here