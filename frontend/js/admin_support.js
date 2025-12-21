
const API_URL = '/api';

let currentEditFaqId = null;
let currentReplyMessageId = null;
let currentViewMessage = null;

$(document).ready(function () {
   checkAuth();
   loadMessages();
   loadFAQs();
   updateStats();
});

function checkAuth() {
   const token = localStorage.getItem('token');
   const user = JSON.parse(localStorage.getItem('user') || '{}');

   if (!token || user.role !== 'admin') {
      window.location.href = '../pages/login.html';
      return;
   }
   $('#adminName').text(user.fullName || 'Admin');
}

function getHeaders() {
   return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
   };
}

// Stats
async function updateStats() {
   
}

// Tab Switching
window.switchTab = function (tab, event) {
   $('.tab-content').removeClass('active');
   $('.tab-btn').removeClass('active');

   $(`#${tab}`).addClass('active');
   $(event.currentTarget).addClass('active');
}

// Messages
window.loadMessages = async function () {
   const tbody = $('#messagesTableBody');
   console.log('Messages tbody jQuery object:', tbody);
   console.log('Messages tbody length:', tbody.length);
   console.log('Messages tbody element:', tbody[0]);

   if (tbody.length === 0) {
      console.error('ERROR: messagesTableBody not found in DOM!');
      return;
   }

   tbody.html('<tr><td colspan="6" class="text-center text-muted">Loading...</td></tr>');

   try {
      console.log('Fetching messages from:', `${API_URL}/messages`);
      const response = await fetch(`${API_URL}/messages`, { headers: getHeaders() });
      console.log('Messages response status:', response.status);

      const data = await response.json();
      console.log('Messages data:', data);
      console.log('Messages data.data:', data.data);
      console.log('Messages data.data length:', data.data?.length);

      if (!response.ok) {
         console.error('Failed to fetch messages:', data);
         tbody.html('<tr><td colspan="6" class="text-center text-danger">Error loading messages: ' + (data.message || data.error) + '</td></tr>');
         updateMessageStats(0, 0, 0);
         return;
      }

      if (!data.data || data.data.length === 0) {
         console.log('No messages found or empty array');
         tbody.html('<tr><td colspan="6" class="text-center text-muted">No messages found.</td></tr>');
         updateMessageStats(0, 0, 0);
         return;
      }

      const messages = data.data;
      console.log('Processing messages:', messages);
      let answered = messages.filter(m => m.status === 'answered').length;
      updateMessageStats(messages.length, messages.length - answered, answered);

      console.log('About to render', messages.length, 'messages');
      const html = messages.map((msg, index) => {
         console.log(`Rendering message ${index}:`, msg);
         return `
            <tr>
                <td>${new Date(msg.createdAt).toLocaleDateString()}</td>
                <td>${escapeHtml(msg.name)}</td>
                <td>${escapeHtml(msg.email)}</td>
                <td>${escapeHtml(msg.message).substring(0, 50)}...</td>
                <td>
                    <span class="badge ${msg.status === 'answered' ? 'bg-success' : 'bg-warning text-dark'}">
                        ${msg.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick='viewMessage(${JSON.stringify(msg).replace(/'/g, "&#39;")})'>
                        <i class="fas fa-eye"></i>
                    </button>
                    ${msg.status === 'pending' ? `
                    <button class="btn btn-sm btn-outline-success me-1" onclick="openReplyModal('${msg._id}', '${escapeHtml(msg.name).replace(/'/g, "\\'")}')">
                        <i class="fas fa-reply"></i>
                    </button>` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMessage('${msg._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
      }).join('');

      console.log('Generated HTML length:', html.length);
      console.log('First 200 chars of HTML:', html.substring(0, 200));
      console.log('Setting HTML to tbody');
      tbody.html(html);
      console.log('After setting, tbody.html() length:', tbody.html().length);
      console.log('After setting, tbody children count:', tbody.children().length);

      // Check visibility
      const firstRow = tbody.find('tr').first();
      const table = tbody.closest('table');
      const tabPane = $('#messagesTab');

      console.log('First row element:', firstRow[0]);
      console.log('First row visible?:', firstRow.is(':visible'));
      console.log('First row CSS display:', firstRow.css('display'));
      console.log('First row CSS visibility:', firstRow.css('visibility'));
      console.log('First row height:', firstRow.height());
      console.log('Table visible?:', table.is(':visible'));
      console.log('Table height:', table.height());
      console.log('Tab pane (#messagesTab) visible?:', tabPane.is(':visible'));
      console.log('Tab pane classes:', tabPane.attr('class'));
      console.log('Tab pane display:', tabPane.css('display'));

      // Force tab to be visible if it's not
      if (!tabPane.hasClass('show')) {
         console.log('WARNING: Messages tab not showing! Adding show class...');
         tabPane.addClass('show active');
      }

      console.log('Messages rendering complete');
   } catch (error) {
      console.error('Error loading messages:', error);
      tbody.html('<tr><td colspan="6" class="text-center text-danger">Network error loading messages</td></tr>');
   }
}

function updateMessageStats(total, pending, answered) {
   $('#totalMessages').text(total);
   $('#pendingReplies').text(pending);
}

// View Message
window.viewMessage = function (msg) {
   currentViewMessage = msg;
   $('#viewMsgName').text(msg.name);
   $('#viewMsgEmail').text(msg.email);
   $('#viewMsgDate').text(new Date(msg.createdAt).toLocaleString());
   $('#viewMsgContent').text(msg.message);

   if (msg.status === 'pending') {
      $('#btnReplyFromView').show();
   } else {
      $('#btnReplyFromView').hide();
   }

   new bootstrap.Modal('#viewMessageModal').show();
}

window.openReplyModalFromView = function () {
   if (currentViewMessage) {
      bootstrap.Modal.getInstance('#viewMessageModal').hide();
      openReplyModal(currentViewMessage._id, currentViewMessage.name, currentViewMessage.email);
   }
}

// Reply
window.openReplyModal = function (id, name, email) {
   currentReplyMessageId = id;
   $('#replyToEmail').val(email);
   $('#replyContent').val('');
   new bootstrap.Modal('#replyModal').show();
}

window.submitReply = async function () {
   const reply = $('#replyContent').val().trim();
   if (!reply) return alert('Please enter a reply.');

   try {
      const response = await fetch(`${API_URL}/messages/${currentReplyMessageId}/reply`, {
         method: 'PUT',
         headers: getHeaders(),
         body: JSON.stringify({ adminReply: reply })
      });

      if (response.ok) {
         bootstrap.Modal.getInstance('#replyModal').hide();
         alert('✓ Reply sent successfully!');
         loadMessages();
      } else {
         const data = await response.json();
         alert('Failed to send reply: ' + (data.error || 'Unknown error'));
      }
   } catch (error) {
      console.error(error);
      alert('Error sending reply.');
   }
}

window.deleteMessage = async function (id) {
   if (!confirm('Are you sure you want to delete this message?')) return;
   try {
      await fetch(`${API_URL}/messages/${id}`, { method: 'DELETE', headers: getHeaders() });
      loadMessages();
   } catch (e) { console.error(e); }
}


// FAQs
window.loadFAQs = async function () {
   const tbody = $('#faqsTableBody');
   console.log('FAQs tbody jQuery object:', tbody);
   console.log('FAQs tbody length:', tbody.length);
   console.log('FAQs tbody element:', tbody[0]);

   if (tbody.length === 0) {
      console.error('ERROR: faqsTableBody not found in DOM!');
      return;
   }

   tbody.html('<tr><td colspan="5" class="text-center text-muted">Loading...</td></tr>');

   try {
      console.log('Fetching FAQs from:', `${API_URL}/faqs`);
      const response = await fetch(`${API_URL}/faqs`, { headers: getHeaders() });
      console.log('FAQs response status:', response.status);

      const data = await response.json();
      console.log('FAQs data:', data);
      console.log('FAQs data.data:', data.data);
      console.log('FAQs data.data length:', data.data?.length);

      if (!response.ok) {
         console.error('Failed to fetch FAQs:', data);
         tbody.html('<tr><td colspan="5" class="text-center text-danger">Error loading FAQs</td></tr>');
         $('#faqCount').text(0);
         return;
      }

      if (!data.data || data.data.length === 0) {
         console.log('No FAQs found or empty array');
         tbody.html('<tr><td colspan="5" class="text-center text-muted">No FAQs found.</td></tr>');
         $('#faqCount').text(0);
         return;
      }

      const faqs = data.data;
      console.log('Processing FAQs:', faqs);
      $('#faqCount').text(faqs.length);

      console.log('About to render', faqs.length, 'FAQs');
      const html = faqs.map((faq, index) => {
         console.log(`Rendering FAQ ${index}:`, faq);
         return `
            <tr>
                <td>${escapeHtml(faq.question)}</td>
                <td>${escapeHtml(faq.answer).substring(0, 50)}...</td>
                <td>
                    <span class="badge ${faq.active ? 'bg-success' : 'bg-secondary'}">
                        ${faq.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick='editFAQ(${JSON.stringify(faq).replace(/'/g, "&#39;")})'>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteFAQ('${faq._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
      }).join('');

      console.log('Generated FAQ HTML length:', html.length);
      console.log('Setting HTML to FAQ tbody');
      tbody.html(html);
      console.log('FAQs rendering complete');

   } catch (error) {
      console.error('Error loading FAQs:', error);
      tbody.html('<tr><td colspan="5" class="text-center text-danger">Network error loading FAQs</td></tr>');
   }
}

window.resetFAQForm = function () {
   $('#faqForm')[0].reset();
   $('#faqModalTitle').text('Add New FAQ');
   currentEditFaqId = null;
   $('#faqId').val('');
}

window.openAddFAQModal = function () {
   resetFAQForm();
   new bootstrap.Modal('#faqModal').show();
}

window.editFAQ = function (faq) {
   currentEditFaqId = faq._id;
   $('#faqQuestion').val(faq.question);
   $('#faqAnswer').val(faq.answer);
   $('#faqActive').val(faq.active ? 'true' : 'false');
   $('#faqModalTitle').text('Edit FAQ');

   new bootstrap.Modal('#faqModal').show();
}

window.saveFAQ = async function () {
   const question = $('#faqQuestion').val().trim();
   const answer = $('#faqAnswer').val().trim();
   const active = $('#faqActive').val() === 'true';

   if (!question || !answer) return alert('Please fill in required fields.');

   const payload = { question, answer, active };
   const method = currentEditFaqId ? 'PUT' : 'POST';
   const url = currentEditFaqId ? `${API_URL}/faqs/${currentEditFaqId}` : `${API_URL}/faqs`;

   try {
      const response = await fetch(url, {
         method: method,
         headers: getHeaders(),
         body: JSON.stringify(payload)
      });

      if (response.ok) {
         bootstrap.Modal.getInstance('#faqModal').hide();
         loadFAQs();
      } else {
         alert('Failed to save FAQ.');
      }
   } catch (error) {
      console.error(error);
      alert('Error saving FAQ.');
   }
}

window.deleteFAQ = async function (id) {
   if (!confirm('Delete this FAQ?')) return;
   try {
      await fetch(`${API_URL}/faqs/${id}`, { method: 'DELETE', headers: getHeaders() });
      loadFAQs();
   } catch (e) { console.error(e); }
}


function escapeHtml(text) {
   if (!text) return '';
   return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}
