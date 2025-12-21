eCitizen is a full-stack platform designed to digitize essential citizenship public services. I built this to solve the common frustrations of physical bureaucracy—long queues, lost paperwork, and slow processing. By centralizing identity management and healthcare benefits, eCitizen makes governance more efficient and accessible for everyone.
This is a complete digital identity solution that replaces traditional paperwork.

--Automated Generation: Once an admin approves a citizen's application, a unique NID is generated instantly.
--PDF & QR Integration: Uses `PDFKit` and `QRCode` to create professional, downloadable ID documents.
--Secure Verification: Each NID is linked to the user's verified profile, ensuring data integrity.
--Document Uploads: Integrated `Multer` and `Cloudinary` for secure handling of medical reports and income proof.
--Status Tracking: Real-time feedback for citizens as their applications move from 'pending' to 'approved'.
--Benefit Cards: Automated issuance of digital healthcare cards upon approval.

--Admin Dashboard
A central hub for government officials to manage the platform.
--Application Workflow: A clean interface to review, approve, or reject citizen applications.
--Citizen Management: Searchable database of all registered citizens and their ID statuses.
--Integrated Support: Handles citizen inquiries through a dedicated FAQ and messaging system.

--stack:
--Frontend: HTML5, CSS3 and Vanilla JavaScript for a fast, responsive user experience.
--Backend: Node.js with Express.js managing the API logic and authentication.
--Database: MongoDB with Mongoose for flexible, document-based data storage.
--Security: JWT-based authentication and Bcrypt password hashing.
--Services: Cloudinary for cloud storage, PDFKit for document generation, and Multer for file handling.

--how to setup

1. Clone the repo:
   git clone https://github.com/Thabithx/eCitizen.git
   cd eCitizen

2. Setup the Backend:
   -Navigate to `/backend` and run `npm install`.
   -Create a `.env` file (you'll need your own MongoDB and Cloudinary keys).
   -Run `npm run dev` to start the server.

3. Access the App:
   -Open `http://localhost:3030` in your browser.

--Admin Credentials
Email: `anura@gmail.com`
Password: `anura123`