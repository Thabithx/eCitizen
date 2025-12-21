// Smooth scrolling
document.documentElement.style.scrollBehavior = 'smooth';

// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
   entries.forEach(entry => {
      if (entry.isIntersecting) {
         entry.target.classList.add('visible');
      }
   });
}, { threshold: 0.1 });

// Observe all animated elements
document.addEventListener('DOMContentLoaded', () => {
   const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in');
   animatedElements.forEach(el => observer.observe(el));
});

// Animated counter for stats
function animateCounter(element, target, suffix = '') {
   const duration = 2000;
   const increment = target / (duration / 16);
   let current = 0;

   const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
         element.textContent = target + suffix;
         clearInterval(timer);
      } else {
         element.textContent = Math.floor(current) + suffix;
      }
   }, 16);
}

// Observe stat numbers for counter animation
const statObserver = new IntersectionObserver((entries) => {
   entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
         entry.target.classList.add('counted');
         const target = parseInt(entry.target.getAttribute('data-target'));
         const suffix = entry.target.getAttribute('data-suffix') || '';

         if (target) {
            animateCounter(entry.target, target, suffix);
         }
      }
   });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
   const statNumbers = document.querySelectorAll('.stat-number[data-target]');
   statNumbers.forEach(el => statObserver.observe(el));
});

// Parallax effect on scroll
window.addEventListener('scroll', () => {
   const currentScroll = window.pageYOffset;
   const parallaxElements = document.querySelectorAll('.parallax-element');

   parallaxElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.pageYOffset;
      const elementHeight = element.height;
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
         const scrolled = currentScroll - elementTop + windowHeight;
         const speed = 0.5;
         const yPos = -(currentScroll - elementTop) * speed;
         element.style.transform = `translateY(${yPos}px)`;
      }
   });
});

// Smooth reveal on page load
window.addEventListener('load', () => {
   const heroElements = document.querySelectorAll('.hero-content > *');
   heroElements.forEach((el, index) => {
      setTimeout(() => {
         el.style.opacity = '1';
         el.style.transform = 'translateY(0)';
      }, index * 200);
   });
});

// Header behavior 
const header = document.getElementById('main-header');
if (header) {
   let ticking = false;

   function updateHeader() {
      const scrollY = window.pageYOffset;

      if (scrollY > 100) {
         header.classList.add('scrolled');
      } else {
         header.classList.remove('scrolled');
      }

      ticking = false;
   }

   window.addEventListener('scroll', () => {
      if (!ticking) {
         window.requestAnimationFrame(updateHeader);
         ticking = true;
      }
   });

   // Initialize header state
   updateHeader();
}

// Global click handler for Profile Icon
document.addEventListener('click', (e) => {
   const profileLink = e.target.closest('a[href*="profile.html"]');

   if (profileLink) {
      e.preventDefault();

      const token = localStorage.getItem('token');

      if (token) {
         // User is logged in, go to profile
         window.location.href = profileLink.href;
      } else {
         // User is NOT logged in, go to login
         window.location.href = '../pages/login.html';
      }
   }
});
