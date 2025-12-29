# eCitizen - National Digital Identity Platform

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

</div>

<br />

<div align="center">
  <p align="center">
    A revolutionary digital identity ecosystem transforming how citizens interact with government services.
    <br />
    <a href="#key-features"><strong>Explore the features »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Thabithx/eCitizen/issues">Report Bug</a>
    ·
    <a href="https://github.com/Thabithx/eCitizen/issues">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#key-features">Key Features</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>

## About The Project

Do you remember when you were kids and you had to get a national id you were required to fill in all the documents physically take a picture and paste it on the form and gather other documents and send it and wait for months to recieve your national id....well yea its still the same..everything has changed but not that... so why not try to change it, today we are introducing our government's official electronic national id registration system. Now you can apply for your national ID fast and easily from the comfort of your home, without going through all the stone age painful processes and save yourself so much time.

I engineered a **fully automated ID generation pipeline** that combines PDF rendering, QR code cryptography, and cloud storage to deliver secure digital identities in seconds. The system handles everything from document verification to benefit card issuance, with an admin workflow that processes applications at scale while maintaining data integrity and security compliance.

### Built With

*   **Runtime:** Node.js 18+ (RESTful API Architecture)
*   **Framework:** Express.js (Robust Server-Side Logic)
*   **Database:** MongoDB with Mongoose ODM
*   **Frontend:** Vanilla JavaScript, HTML5, CSS3 & Bootstrap 5
*   **Security:** JWT Authentication & Bcrypt Password Hashing
*   **Cloud Services:** Cloudinary (Document Storage & Management)
*   **Document Generation:** PDFKit & QRCode.js

<p align="right">(<a href="#top">back to top</a>)</p>

## Key Features

### Automated National ID Generation
A sophisticated identity issuance engine that generates unique National IDs with embedded QR codes. Each ID is rendered as a professional PDF document with cryptographic verification, ensuring authenticity and preventing fraud.

### Secure Authentication System
Enterprise-grade security with JWT-based session management and bcrypt password encryption. Role-based access control ensures citizens, admins, and support staff each access only their authorized resources.

### Intelligent Document Processing
Seamless file upload system powered by Multer and Cloudinary, handling medical reports, income proof, and identity documents. Automatic validation ensures only compliant documents are accepted.

### Healthcare Benefit Integration
Automatic issuance of digital healthcare benefit cards upon application approval. Citizens can access medical services using their verified digital identity, streamlining healthcare delivery.

### Admin Command Center
A powerful dashboard for government officials to manage the entire platform. Features real-time application tracking, citizen database management, and analytics on approval rates and processing times.

### Application Workflow Engine
Smart state management that tracks each application from submission through review to final approval. Real-time status updates keep citizens informed throughout the verification process.

### Integrated Support System
Centralized FAQ management and citizen messaging system. Admins can respond to inquiries, update help documentation, and track support metrics, all from a unified interface.

### Real-Time Notifications
Intelligent notification system that alerts citizens about application status changes, admin responses, and important updates. Never miss a critical update about your digital identity.

### Responsive Design
Fully mobile-optimized interface ensuring citizens can apply for and manage their digital ID from any device. Progressive enhancement ensures functionality even on slower connections.

<p align="right">(<a href="#top">back to top</a>)</p>

## Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

*   **Node.js 18** or higher
*   **MongoDB** (local installation or MongoDB Atlas account)
*   **Cloudinary Account** for document storage
*   **Git** for version control

### Installation

1.  **Clone the Repository**
    ```
    git clone https://github.com/Thabithx/eCitizen.git
    cd eCitizen
    ```

2.  **Setup**
    *   Navigate to the backend directory:
        ```
        cd backend
        npm install
        ```
    *   Create a `.env` file in the `backend` directory with the following variables:
        ```env
        PORT=3030
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret_key
        CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
        CLOUDINARY_API_KEY=your_cloudinary_api_key
        CLOUDINARY_API_SECRET=your_cloudinary_api_secret
        ```
    *   Start the development server:
        ```sh
        npm run dev
        ```

3.  **Access the Application**
    *   Open your browser and navigate to `http://localhost:8000`
    *   The backend API runs on `http://localhost:3030`

<p align="right">(<a href="#top">back to top</a>)</p>

## Usage

### For Citizens

1.  **Registration:** Create an account with email and password
2.  **Apply for NID:** Fill out the application form and upload required documents:
    *   Birth certificate or proof of identity
    *   Proof of address
    *   Recent photograph
3.  **Track Application:** Monitor your application status in real-time from your profile dashboard
4.  **Download ID:** Once approved, download your digital National ID card as a PDF with embedded QR code
5.  **Access Benefits:** Use your approved digital identity to access healthcare and other government services

### For Administrators

1.  **Login:** Use admin credentials to access the admin dashboard
    ```
    Email: anura@gmail.com
    Password: anura123
    ```
2.  **Review Applications:** View pending citizen applications with all uploaded documents
3.  **Approve/Reject:** Make decisions on applications with optional feedback messages
4.  **Manage Citizens:** Search, filter, and manage all registered citizens
5.  **Handle Support:** Respond to citizen inquiries and manage FAQ content
6.  **Analytics:** Monitor platform metrics including approval rates and processing times

_For more information, please refer to the [HEALTHCARE_SERVICE_GUIDE.md](HEALTHCARE_SERVICE_GUIDE.md)_

<p align="right">(<a href="#top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>

---

<div align="center">
  <p>© 2025 eCitizen. Transforming Digital Governance.</p>
</div>
