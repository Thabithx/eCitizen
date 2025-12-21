
let currentApplicationId = null;

$(document).ready(function () {
   checkAuth();
   loadApplications(); 
   // Load applications when tab is clicked
   $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
      if (e.target.getAttribute('href') === '#applicationsTab') {
         loadApplications();
      }
   });

   $('#approveBtn').click(() => updateStatus(currentApplicationId, 'approved'));
   $('#rejectBtn').click(() => updateStatus(currentApplicationId, 'rejected'));
});

function checkAuth() {
   const token = localStorage.getItem('token');
   const user = JSON.parse(localStorage.getItem('user') || '{}');

   if (!token || user.role !== 'admin') {
      window.location.href = '../../pages/login.html';
   }
}

// ============ APPLICATIONS LOGIC ============

async function loadApplications() {
   try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/citizens', {
         headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
         renderApplicationsTable(data.data);
      } else {
         console.error('Failed to load applications:', data);
         alert('Failed to load applications: ' + (data.message || 'Unknown error'));
         $('#applicationsTableBody').html('<tr><td colspan="4" class="text-center text-danger py-4">Error loading applications</td></tr>');
      }
   } catch (error) {
      console.error('Error:', error);
      alert('Error loading applications: ' + error.message);
      $('#applicationsTableBody').html('<tr><td colspan="4" class="text-center text-danger py-4">Network error</td></tr>');
   }
}

function renderApplicationsTable(applications) {
   const tbody = $('#applicationsTableBody');
   tbody.empty();

   if (applications.length === 0) {
      tbody.html('<tr><td colspan="4" class="text-center py-4">No applications found</td></tr>');
      return;
   }

   applications.forEach(app => {
      const statusClass = `status-${app.applicationStatus}`;
      const date = new Date(app.createdAt).toLocaleDateString();
      const userName = app.user ? app.user.fullName : '<span class="text-muted"><em>Unknown/Deleted</em></span>';

      // Status Badge Style
      let badgeStyle = 'bg-secondary';
      if (app.applicationStatus === 'approved') badgeStyle = 'bg-success';
      if (app.applicationStatus === 'rejected') badgeStyle = 'bg-danger';
      if (app.applicationStatus === 'pending') badgeStyle = 'bg-warning text-dark';

      const row = `
            <tr>
                <td class="ps-4 fw-medium">${userName}</td>
                <td><span class="badge ${badgeStyle}">${app.applicationStatus.toUpperCase()}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewDetails('${app._id}')">
                        <i class="fas fa-eye me-1"></i> View
                    </button>
                </td>
            </tr>
        `;
      tbody.append(row);
   });
}

async function viewDetails(id) {
   currentApplicationId = id;
   try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/citizens/${id}`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
         const app = data.data;
         const userName = app.user ? app.user.fullName : 'Unknown/Deleted';
         const userEmail = app.user ? app.user.email : 'N/A';

         const renderDocLink = (url, name) => {
            if (!url) return '';
            return `
                     <div class="doc-card mb-2" style="background: white; border: 1px solid #eef0f7; border-radius: 12px; padding: 12px; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between;">
                        <div class="d-flex align-items-center">
                           <div style="width: 44px; height: 44px; background: #f0f7ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                              <i class="fas fa-file-pdf text-danger" style="font-size: 20px;"></i>
                           </div>
                           <div>
                              <div style="font-weight: 600; color: #1e293b; font-size: 0.9rem;">${name}</div>
                              <div style="font-size: 0.75rem; color: #64748b;">Official Document (PDF)</div>
                           </div>
                        </div>
                        <a href="${url}" target="_blank" class="btn btn-sm btn-primary" style="padding: 6px 16px; border-radius: 8px; font-weight: 600; font-size: 0.8rem; text-decoration: none;">
                           View
                        </a>
                     </div>
                 `;
         };

         const modalBody = `
                <div class="row g-4">
                    <div class="col-md-5 border-end">
                        <div class="text-center mb-4">
                            <img src="${app.photo || '../../images/default-avatar.png'}" alt="Photo" class="rounded-circle img-thumbnail shadow-sm" style="width: 120px; height: 120px; object-fit: cover;">
                            <h5 class="mt-3 mb-1">${userName}</h5>
                            <span class="badge bg-secondary">${app.occupation}</span>
                        </div>
                        
                        <div class="mb-3">
                           <div class="detail-label">Contact Info</div>
                           <div class="detail-value"><i class="fas fa-envelope me-2 text-muted"></i>${userEmail}</div>
                           <div class="detail-value mt-1"><i class="fas fa-phone me-2 text-muted"></i>${app.phoneNumber}</div>
                        </div>

                        <div class="mb-3">
                           <div class="detail-label">Address</div>
                           <div class="detail-value"><i class="fas fa-map-marker-alt me-2 text-muted"></i>${app.address}</div>
                        </div>
                    </div>
                    
                    <div class="col-md-7">
                        <h6 class="mb-3 pb-2 border-bottom">Uploaded Documents</h6>
                        ${renderDocLink(app.birthCertificate, 'Birth Certificate')}
                        ${renderDocLink(app.proofOfAddress, 'Proof of Address')}
                        ${app.educationalCert ? renderDocLink(app.educationalCert, 'Educational Certificate') : ''}
                        
                         ${app.additionalDocs && app.additionalDocs.length > 0 ?
               '<h6 class="mt-4 mb-3 pb-2 border-bottom">Additional Documents</h6>' +
               app.additionalDocs.map((doc, idx) => renderDocLink(doc, `Document ${idx + 1}`)).join('')
               : ''
            }
                    </div>
                </div>
            `;
         $('#modalBody').html(modalBody);

         if (app.applicationStatus === 'pending') {
            $('#approveBtn, #rejectBtn').show();
         } else {
            $('#approveBtn, #rejectBtn').hide();
         }

         new bootstrap.Modal(document.getElementById('detailsModal')).show();
      }
   } catch (error) {
      console.error('Error:', error);
   }
}

async function updateStatus(id, status) {
   try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/citizens/${id}/status`, {
         method: 'PATCH',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({ status })
      });

      if (response.ok) {
         bootstrap.Modal.getInstance(document.getElementById('detailsModal')).hide();
         loadApplications();
         alert(`Application ${status} successfully`);
      } else {
         alert('Failed to update status');
      }
   } catch (error) {
      console.error('Error:', error);
   }
}
