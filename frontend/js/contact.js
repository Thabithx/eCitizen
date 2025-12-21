// Contact Page Logic

$(document).ready(function () {
   loadFAQs();
   setupContactForm();
});

// Load FAQs from backend
async function loadFAQs() {
   try {
      const response = await fetch('/api/faqs');
      if (!response.ok) throw new Error('Failed to fetch FAQs');

      const data = await response.json();
      const container = $('#faqsDisplay');

      if (!data.success || !data.data || data.data.length === 0) {
         container.html(`
                <div class="alert alert-light text-center border">
                    <i class="bi bi-info-circle me-2"></i>No FAQs available yet.
                </div>
            `);
         return;
      }

      // Render FAQs
      const faqsHtml = data.data.map(faq => `
            <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                    <i class="bi bi-chevron-right"></i>
                    ${escapeHtml(faq.question)}
                </div>
                <div class="faq-answer">
                    ${escapeHtml(faq.answer)}
                </div>
            </div>
        `).join('');

      container.html(faqsHtml);

   } catch (error) {
      console.error('Error loading FAQs:', error);
      $('#faqsDisplay').html(`
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>Unable to load FAQs.
            </div>
        `);
   }
}

// Toggle FAQ answer
window.toggleFaq = function (element) {
   const answer = $(element).next('.faq-answer');
   const icon = $(element).find('i');

   // Close other FAQs
   $('.faq-answer.show').not(answer).removeClass('show');
   $('.faq-question i').not(icon).css('transform', 'rotate(0deg)');

   // Toggle current
   answer.toggleClass('show');
   if (answer.hasClass('show')) {
      icon.css('transform', 'rotate(90deg)');
   } else {
      icon.css('transform', 'rotate(0deg)');
   }
}

// Setup Contact Form
function setupContactForm() {
   $('#contactForm').on('submit', async function (e) {
      e.preventDefault();

      const btn = $(this).find('button[type="submit"]');
      const alert = $('#formAlert');
      const originalText = btn.html();

      // Basic validation
      const name = $('#name').val().trim();
      const email = $('#email').val().trim();
      const message = $('#message').val().trim();

      if (!name || !email || !message) {
         showAlert('Please fill in all fields.', 'danger');
         return;
      }

      // Loading state
      btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Sending...');
      alert.hide();

      try {
         const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
         });

         const result = await response.json();

         if (response.ok) {
            showAlert('Message sent successfully! We will get back to you soon.', 'success');
            $('#contactForm')[0].reset();
         } else {
            showAlert(result.error || 'Failed to send message.', 'danger');
         }
      } catch (error) {
         console.error('Error submitting form:', error);
         showAlert('Something went wrong. Please try again.', 'danger');
      } finally {
         btn.prop('disabled', false).html(originalText);
      }
   });
}

function showAlert(message, type) {
   const alert = $('#formAlert');
   alert.removeClass('alert-success alert-danger').addClass(`alert-${type}`).text(message).fadeIn();

   setTimeout(() => {
      alert.fadeOut();
   }, 5000);
}

function escapeHtml(text) {
   return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}
