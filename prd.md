Campus Lost & Found — Product
Requirements Document
Sep 24, 2026 · @Wealthmine Advisory Services LLP
1. Executive summary
Reclaim is a campus lost-and-found web app that turns a notice board and a security-
desk drawer into a searchable, matched, verified recovery system. A student reports an
item in under 60 seconds; the system suggests likely matches and runs a secure claim-
and-handover flow.
The brief only requires forms and add/retrieve APIs. Winning teams meet that brief
completely, then show 2–3 features that solve the hard part: getting the item back to the
right person.
2. Problem statement
Lost items on campus are rarely returned because losers and finders never meet in the
same place at the same time. Today's channels — WhatsApp groups, notice boards, a
security-desk register — are fragmented, unsearchable and easy to abuse.
Field Value
Product Reclaim — Campus Lost & Found (working name)
Version PRD v1.0 (draft)
Scope Hackathon MVP + post-hackathon roadmap
Mandated stack S1: HTML5, CSS3 (listing and reporting forms) · S2:
Node.js, Express.js (APIs to add and retrieve items)
Primary users Students, faculty/staff, campus security / admin
desk
Winning angle Smart matching + verified claims + 60-second
reporting, not just a CRUD list
Campus Lost & Found — Product Requirements Document
Page 1 of 15

Open question: collect 10–15 quick survey responses from students before the event. A
real number on stage ("8 of 12 students lost something this semester") beats any claim.
3. Goals, non-goals and success metrics
The MVP succeeds if a judge can report a lost item, see it matched to a found item, and
complete a verified claim live in under 3 minutes.
Goals
1. Report a lost or found item in 60 seconds or less, on mobile.
2. Browse and filter all open items by category, location, date and status.
3. Suggest likely matches between lost and found reports automatically.
4. Prevent false claims through ownership verification before handover.
5. Give the admin desk a single dashboard for custody, handover and disposal.
Non-goals (MVP)
Native mobile apps (responsive web only).
Payments, rewards or bounties.
Integration with university ERP or SSO (mock login instead; see open questions).
AI image recognition (roadmap item, not MVP).
Pain point Who feels
it
Consequence
Reports scattered across chats and
boards
Owner Item is found but owner never sees
the post
No structured description (category,
place, time)
Owner,
finder
Matching depends on luck and
memory
Anyone can claim a posted item Finder,
admin
Wrong person walks away with a
phone or ID card
Paper register at security desk Admin No search, no audit trail, items pile up
unclaimed
Finder has no easy, safe way to hand
over
Finder Good samaritans give up or keep the
item
Metric Target (MVP demo) Target (real deployment)
Time to report an item ≤ 60 s ≤ 60 s median
Campus Lost & Found — Product Requirements Document
Page 2 of 15

4. Users and personas
Three roles drive every requirement: the owner who lost something, the finder who
picked it up, and the admin who holds custody.
5. Core user journeys
Every item follows one lifecycle, whether it starts as a lost report or a found report.
Metric Target (MVP demo) Target (real deployment)
Match suggestion shown for
a true pair
Top 3 results ≥ 70% of recovered items
matched in top 3
Recovery rate Demo pair recovered
end-to-end
≥ 40% of reported lost items
returned in a semester
Time from found report to
owner notified
Instant (in-app) < 24 h
Lighthouse accessibility
score
≥ 90 ≥ 90
API p95 response time < 300 ms < 300 ms
Persona Context Needs Frustration today
Aanya, 2nd-
year student
(Owner)
Lost her ID card and
earphones between
library and canteen
Post fast from phone,
get notified if found,
prove it is hers
Posted in 4 WhatsApp
groups, heard nothing
Rohan, 3rd-
year student
(Finder)
Found a calculator in
Lab 3
Report in seconds,
drop at desk or hand
over safely, no hassle
Doesn't know who to
give it to; fears
handing to wrong
person
Mr. Patil,
security desk
(Admin)
Holds a drawer of 40+
unclaimed items
Log intake, verify
claimants, record
handover, clear old
items
Paper register, no
search, repeated
enquiries
Faculty / staff
(Owner or
Finder)
Finds items in
classrooms
Same as students,
occasional use
Same as students
Campus Lost & Found — Product Requirements Document
Page 3 of 15

stateDiagram-v2
[*] --> Reported
Reported --> Matched: match suggested
Reported --> AtDesk: finder drops at desk
AtDesk --> Matched: match suggested
Matched --> ClaimPending: owner submits claim
ClaimPending --> Verified: answers / OTP approved
ClaimPending --> Rejected: verification fails
Rejected --> Matched
Verified --> Returned: handover recorded
Reported --> Expired: 60 days unclaimed
Returned --> [*]
Expired --> [*]
The diagram shows the status field every item carries; the admin dashboard and API
filters use these exact states.
# Journey Steps Done when
J1 Report lost Choose "I lost" → category →
title, description, colour/brand →
last-seen place and time →
optional photo → submit
Item live in listing; matches
shown immediately
J2 Report
found
Choose "I found" → same form →
pick "I'll keep it" or "Dropped at
desk" → add a private verification
question
Item live with photo blurred for
sensitive categories
J3 Browse /
search
Listing page → filters (lost/found,
category, location, date, status)
→ keyword search → item detail
User finds a candidate item in ≤
3 clicks
J4 Match System scores open lost × found
pairs → top 3 suggestions on the
item page and in notifications
Owner sees their found item
without searching
J5 Claim &
verify
Owner taps "This is mine" →
answers finder's hidden question
/ describes unique mark → finder
or admin approves
Claim status = Verified;
handover OTP generated
J6 Handover Owner shows 4-digit OTP at desk
or to finder → OTP entered →
item marked Returned
Audit log records who, when,
where
Campus Lost & Found — Product Requirements Document
Page 4 of 15

6. Functional requirements
All Must-haves map directly to the brief's S1 and S2 tasks; Should-haves are the features
that separate a winner from a CRUD demo.
ID Requirement Priority Stage
FR-01 Report form for lost items: type, category, title,
description, colour, brand, location (dropdown of
campus zones), date/time, photo, contact
preference
Must S1 + S2
FR-02 Report form for found items: same fields + custody
("with me" / "at desk") + private verification
question
Must S1 + S2
FR-03 Client-side validation (HTML5 required, pattern,
maxlength) and matching server-side validation
Must S1 + S2
FR-04 Item listing page: responsive card grid, status
badge, thumbnail, relative time ("2 h ago")
Must S1
FR-05 Filters (type, category, location, date range, status)
and keyword search
Must S1 + S2
FR-06 Item detail page with full description, map pin of
zone, status history
Must S1 + S2
FR-07 POST API to add an item; GET APIs to list
(paginated, filterable) and fetch one
Must S2
FR-08 Image upload (JPEG/PNG/WebP, ≤ 5 MB, resized
server-side)
Must S2
FR-09 Match engine: score lost × found pairs on category,
keywords, location, time window; return top 3
Should S2
FR-10 Claim flow with verification question and approve /
reject by finder or admin
Should S1 + S2
FR-11 4-digit handover OTP and "Returned" status with
audit log
Should S2
FR-12 Admin dashboard: intake, pending claims,
handovers, items older than 60 days, basic stats
Should S1 + S2
FR-13 Login with college email (mock OTP for demo); only
verified users can claim
Should S2
Campus Lost & Found — Product Requirements Document
Page 5 of 15

7. Differentiators that win
Judges remember one moment; ours is a found item instantly surfacing on the owner's
screen, followed by a verified OTP handover.
Pick the first four for the MVP; add the heatmap only if the core flow is stable 6 hours
before the deadline.
ID Requirement Priority Stage
FR-14 In-app notifications for new matches and claim
decisions
Should S1 + S2
FR-15 Email notifications (Nodemailer) Could S2
FR-16 Printable QR poster per desk/location linking to
"Report found here" with location pre-filled
Could S1 + S2
FR-17 Auto-expiry after 60 days → donate / dispose
queue
Could S2
FR-18 AI photo tagging, chat between owner and finder,
multilingual UI
Won't (MVP) —
Feature Why judges care Effort
Smart match score ("87% match") with
reasons (same category, 50 m apart, 2
h window)
Shows real problem-solving logic, not
just storage
Medium
Hidden verification question set by
finder
Solves fraud, the problem other teams
ignore
Low
Handover OTP + audit trail Trust and accountability; admin-
friendly
Low
QR posters at hotspots (library,
canteen, labs)
Physical-to-digital bridge; great on-
stage prop
Low
Sensitive-item privacy (ID cards,
wallets: blurred photo, no personal
details shown)
Shows mature thinking about privacy Low
Campus heatmap of where items are
lost
Visual insight for admins; strong demo
slide
Medium
Installable PWA with offline form draft Feels like a real product on phones Medium
Campus Lost & Found — Product Requirements Document
Page 6 of 15

8. Information architecture
Seven pages cover the full product; two primary buttons ("I lost something" / "I found
something") sit on every screen.
flowchart TD
H[Home] --> L[Browse items]
H --> RL[Report lost]
H --> RF[Report found]
L --> D[Item detail]
D --> C[Claim + verify]
H --> M[My reports & matches]
H --> A[Admin dashboard]
9. Data model
Four collections are enough: users, items, claims and an audit log.
Page Key content Primary action
Home Hero with two big CTAs, live stats (items
returned this month), recent items strip
Report lost / found
Browse items Filter sidebar (drawer on mobile), search
bar, card grid, pagination
Open item
Report lost / found Stepped form (3 steps), progress bar,
photo preview
Submit
Item detail Photo, details, zone, timeline of status,
match suggestions
"This is mine" / "I found
this"
Claim + verify Verification question, unique-mark
description, status tracker
Submit claim
My reports &
matches
User's items, match alerts, claim status,
handover OTP
View match
Admin dashboard Queues (intake, claims, handover,
expiring), stats, heatmap
Approve / record
handover
Campus Lost & Found — Product Requirements Document
Page 7 of 15

10. API specification (Express, REST, JSON)
The brief's S2 core is two endpoints — POST /items and GET /items — and everything
else extends them. Base path /api/v1 ; errors return { "error": { "code", "message",
"fields" } } .
Entity Field Type Notes
User _id, name, email, role ObjectId, string,
string, enum
role: student / staff /
admin; email must be
college domain
User verified, createdAt boolean, date Set after OTP login
Item _id, type ObjectId, enum lost / found
Item title, description, category string (≤ 80), string
(≤ 500), enum
category: electronics,
ID/cards, books, bags,
keys, clothing, bottles,
other
Item colour, brand, tags string, string,
string[]
tags auto-extracted from
title + description
Item location, eventDate enum (campus
zone), date
Zones from a config file
(Library, Canteen, Lab 1–
5…)
Item imageUrl, isSensitive string, boolean Sensitive → blurred
photo, limited detail
Item custody, verifyQuestion,
verifyAnswerHash
enum, string, string Found items only; answer
stored hashed (bcrypt)
Item status, reportedBy,
createdAt, expiresAt
enum, ref User, date,
date
Status values = lifecycle
states in section 5
Claim _id, item, claimant, answer,
markDescription
ObjectId, ref Item,
ref User, string,
string
Claim status, otp, decidedBy,
decidedAt
enum, string
(hashed), ref User,
date
pending / verified /
rejected / completed
AuditLog action, actor, item,
timestamp, meta
enum, ref User, ref
Item, date, object
Every status change is
logged
Campus Lost & Found — Product Requirements Document
Page 8 of 15

Status codes: 400 validation, 401 not logged in, 403 not owner/admin, 404 not found, 409
item already claimed, 413 image too large, 429 rate limited.
Match score (MVP, rule-based, 0–100)
Method Endpoint Purpose Auth Success
POST /items Add lost/found item
(multipart: fields +
image)
User 201 + item
GET /items List items; query: type,
category, location,
status, q, from, to,
page, limit (default 12)
Public 200 + { items,
total, page }
GET /items/:id Fetch one item with
status history
Public 200
PATCH /items/:id Edit own item / admin
status change
Owner,
Admin
200
DELETE /items/:id Withdraw own report
(soft delete)
Owner,
Admin
204
GET /items/:id/matches Top 3 match
suggestions with score
and reasons
User 200
POST /items/:id/claims Submit claim with
verification answer
User 201
PATCH /claims/:id Approve / reject claim Finder,
Admin
200 + OTP
issued on
approve
POST /claims/:id/handover Confirm handover with
OTP
Finder,
Admin
200; item →
Returned
POST /auth/request-otp ·
/auth/verify-otp
College-email login Public 200 + JWT
GET /me/items ·
/me/notifications
User's reports,
matches, alerts
User 200
GET /admin/stats Counts by status,
recovery rate, heatmap
data
Admin 200
Campus Lost & Found — Product Requirements Document
Page 9 of 15

Show a match only at score ≥ 50, with the matched signals listed as reasons.
11. Technical architecture
A single Express server serves both the static HTML/CSS front end and the JSON API, so
the whole app deploys as one service.
flowchart LR
B[Browser<br/>HTML5 + CSS3 + vanilla JS] -->|fetch JSON| E[Express
API<br/>Node.js]
E --> DB[(MongoDB Atlas)]
E --> S[Image storage<br/>Cloudinary / local]
E --> N[Nodemailer<br/>email alerts]
Signal Weight
Same category 35
Keyword / tag overlap (Jaccard on tags) 30
Same or adjacent campus zone 20
Found date within 0–3 days after lost date 10
Colour / brand match 5
Layer Choice Reason
Front end (S1) Semantic HTML5, CSS3 (custom
properties, Grid, Flexbox), vanilla JS
modules
Matches brief exactly; fast; no
build step
Back end (S2) Node.js 20 LTS, Express 4 Mandated by brief
Validation express-validator (server) + HTML5
constraints (client)
Same rules both sides
Database MongoDB Atlas free tier via
Mongoose
Flexible item schema; free
hosting
Uploads Multer + Sharp (resize to 800 px,
WebP) → Cloudinary or /uploads
Keeps pages light
Auth Email OTP → JWT in httpOnly cookie College-email restriction
Security
middleware
helmet, cors, express-rate-limit,
mongo-sanitize
OWASP basics
Campus Lost & Found — Product Requirements Document
Page 10 of 15

Folder layout: /public (HTML, CSS, JS, assets) · /src/routes · /src/controllers ·
/src/models · /src/middleware · /src/services/matcher.js · /seed (demo data).
12. Non-functional requirements
Security and privacy carry the most weight because the app handles phones, wallets and
ID cards.
Layer Choice Reason
Hosting Render / Railway (API + static), Atlas
(DB)
Free, public demo URL
Tooling GitHub, Postman collection, ESLint +
Prettier
Judges check repo quality
ID Area Requirement
NFR-01 Security Verification answers and OTPs stored as bcrypt
hashes; never returned by any API
NFR-02 Security Rate limit: 10 reports/hour and 5 claim
attempts/item per user; 3 failed claims lock that
item for the user
NFR-03 Security Input sanitised against XSS and NoSQL injection;
uploads checked by MIME type and size
NFR-04 Privacy Contact details never public; owner and finder
connect only through the claim flow
NFR-05 Privacy Sensitive categories (ID cards, wallets, documents)
show blurred photo and masked text
NFR-06 Accessibility WCAG 2.1 AA: labelled inputs, keyboard navigation,
4.5:1 contrast, visible focus, alt text required on
uploads
NFR-07 Performance First load < 2 s on 4G; images lazy-loaded; listing
paginated at 12
NFR-08 Responsiveness Mobile-first; tested at 360 px, 768 px, 1280 px
NFR-09 Reliability Graceful empty, loading and error states on every
page
Campus Lost & Found — Product Requirements Document
Page 11 of 15

13. UI/UX and design system
The visual goal is calm and trustworthy, closer to a banking app than a notice board:
generous whitespace, one accent colour, clear status colours.
UX rules
The report form is 3 short steps (What → Where & when → Photo & submit), never one
long page.
Location is a tap-to-pick list of campus zones, not free text, so matching works.
Every empty state tells the user what to do next ("No matches yet — we'll alert you").
Match cards show the score and plain-language reasons.
Micro-interactions: success confetti on "Returned", skeleton loaders on listing.
ID Area Requirement
NFR-10 Data retention Items auto-expire at 60 days; personal data deleted
30 days after closure
Token Value Use
Primary Deep indigo #3730A3 Buttons, links, header
Accent Warm amber #F59E0B "Found" highlights, match badges
Status: Lost Rose #E11D48 Lost badge
Status: Found Emerald #059669 Found badge
Status:
Returned
Slate #64748B Closed items
Surface / text #F8FAFC / #0F172A Light theme; dark theme via prefers-color-
scheme
Type Inter (UI), 16 px base, 1.25
scale
All text
Radius /
spacing
12 px cards, 8 px base grid Consistency
Campus Lost & Found — Product Requirements Document
Page 12 of 15

14. Build plan and team split
The plan assumes a 24-hour hackathon and a team of 4; the core flow must be demoable
by hour 14, leaving time for polish and rehearsal.
Rule: feature freeze at hour 19. Anything unfinished is cut, not rushed.
15. Demo script and judging criteria
The demo is a 3-minute story with two phones on stage: one plays the owner, one the
finder.
Phase Hours Deliverable Owner
0. Setup 0–1 Repo, folder structure, Atlas DB, deploy
pipeline, seed script
Backend lead
1. S1 forms +
listing
1–7 Home, report forms (3 steps), listing
grid, item detail — static with mock
JSON
Frontend × 2
1. S2 core APIs 1–7 POST/GET items, image upload,
validation, filters
Backend lead
2. Integration 7–10 Front end wired to live API; filters and
search working
All
3. Differentiators 10–14 Match engine, claim + verification, OTP
handover
Backend lead + 1
frontend
3. Admin 10–14 Admin dashboard queues and stats Frontend 2
4. Polish 14–19 Responsiveness, accessibility pass,
empty/error states, QR posters
Frontend × 2
5. Hardening 14–19 Rate limiting, security middleware,
Postman collection, README
Backend lead
6. Pitch 19–24 Seed realistic data, deck, demo script
rehearsal ×3, backup video
Pitch lead (4th
member)
Time Beat What judges see
0:00–
0:30
Hook "8 of 12 students we surveyed lost
something this semester. Most never
got it back."
Campus Lost & Found — Product Requirements Document
Page 13 of 15

Keep a recorded backup video of the full flow in case campus Wi-Fi fails.
16. Risks, assumptions and open questions
The biggest risk is scope: a half-working match engine loses to a polished, complete core
flow.
Time Beat What judges see
0:30–
1:00
Owner reports lost earphones 3-step form on phone, done in ~40 s
1:00–
1:30
Finder scans QR poster in canteen,
reports found
Location pre-filled; sets hidden
question "What sticker is on the case?"
1:30–
2:00
Match appears on owner's phone "87% match — same category, same
zone, 2 h apart"
2:00–
2:30
Claim, verify, OTP handover Correct answer → OTP → item marked
Returned, confetti
2:30–
3:00
Admin dashboard + close Recovery rate, heatmap, roadmap in
one line
Typical judging criterion Where Reclaim scores
Problem relevance Survey number; every student relates
Technical implementation Clean REST API, validation, security middleware,
match engine
Innovation Match score with reasons, hidden-question
verification, QR bridge
UI/UX Mobile-first, 3-step form, accessibility ≥ 90
Completeness End-to-end flow works live on a public URL
Scalability / impact Multi-campus ready (zones in config), roadmap to
AI tagging
Risk Likelihood Mitigation
Scope creep delays core flow High Must-haves first; freeze at hour 19
Venue Wi-Fi or hosting fails in
demo
Medium Local fallback server + backup video
Campus Lost & Found — Product Requirements Document
Page 14 of 15

Assumptions
Brief allows a database and vanilla JavaScript alongside HTML5/CSS3 and
Node/Express.
24-hour event, team of 4.
A demo login with mocked email OTP is acceptable.
Open questions
Risk Likelihood Mitigation
Weak match results on demo
data
Medium Hand-crafted seed data covering 3 true pairs
Fake claims Medium Hidden question, attempt limits, admin
approval for sensitive items
Image upload slows pages Low Sharp resize to WebP, lazy load
Exact hackathon duration, team size and judging rubric?
Are frameworks (React, Tailwind) allowed, or is plain HTML5/CSS3 mandatory for S1?
MongoDB Atlas or a simpler JSON/SQLite store?
Final product name and logo?
Survey 10–15 students before the event for the opening statistic.
Campus Lost & Found — Product Requirements Document
Page 15 of 15