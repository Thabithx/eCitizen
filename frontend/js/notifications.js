

class NotificationSystem {
   constructor() {
      this.notifications = [];
      this.pollInterval = 60000; // Poll every 60 seconds
      this.init();
   }

   init() {
      // Load notifications initially
      this.fetchNotifications();

      // Start polling
      setInterval(() => this.fetchNotifications(), this.pollInterval);

      // Bind event listeners
      $(document).on('click', '#markAllRead', (e) => {
         e.stopPropagation();
         this.markAllAsRead();
      });

      $(document).on('click', '.notification-item', (e) => {
         const id = $(e.currentTarget).data('id');
         const isRead = $(e.currentTarget).hasClass('unread');
         if (isRead) {
            this.markAsRead(id);
         }
      });

      // Re-align dropdown if needed on open
      $('#notificationBell').on('show.bs.dropdown', () => {
         this.fetchNotifications();
      });
   }

   async fetchNotifications() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
         const response = await fetch('/api/notifications', {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         const result = await response.json();
         if (result.success) {
            this.notifications = result.data;
            this.render();
         }
      } catch (error) {
         console.error('Failed to fetch notifications:', error);
      }
   }

   render() {
      const unreadCount = this.notifications.filter(n => !n.isRead).length;
      const $badge = $('#notificationBadge');
      const $list = $('.notification-items');
      const $noNotif = $('#noNotifications');

      // Update badge
      if (unreadCount > 0) {
         $badge.text(unreadCount > 9 ? '9+' : unreadCount).removeClass('d-none');
      } else {
         $badge.addClass('d-none');
      }

      // Update list
      if (this.notifications.length > 0) {
         $noNotif.addClass('d-none');
         const itemsHtml = this.notifications.map(n => this.createNotificationHtml(n)).join('');
         $list.find('.notification-item').remove();
         $list.append(itemsHtml);
      } else {
         $noNotif.removeClass('d-none');
      }
   }

   createNotificationHtml(n) {
      const iconMap = {
         'application': 'bi-file-earmark-person',
         'nic': 'bi-card-list',
         'support': 'bi-chat-dots',
         'system': 'bi-info-circle'
      };

      const timeString = this.formatTime(n.createdAt);

      return `
            <div class="notification-item ${n.isRead ? '' : 'unread'}" data-id="${n._id}">
                <div class="notification-icon notif-${n.type}">
                    <i class="bi ${iconMap[n.type] || iconMap.system}"></i>
                </div>
                <div class="notification-content">
                    <h6>${n.title}</h6>
                    <p>${n.message}</p>
                    <span class="notification-time">${timeString}</span>
                </div>
            </div>
        `;
   }

   async markAsRead(id) {
      const token = localStorage.getItem('token');
      try {
         const response = await fetch(`/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
         });

         if (response.ok) {
            this.notifications = this.notifications.map(n =>
               n._id === id ? { ...n, isRead: true } : n
            );
            this.render();
         }
      } catch (error) {
         console.error('Error marking as read:', error);
      }
   }

   async markAllAsRead() {
      const token = localStorage.getItem('token');
      try {
         const response = await fetch('/api/notifications/read-all', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
         });

         if (response.ok) {
            this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
            this.render();
         }
      } catch (error) {
         console.error('Error marking all as read:', error);
      }
   }

   formatTime(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000);

      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return date.toLocaleDateString();
   }
}

$(document).ready(() => {
   // Only init if user is logged in
   if (localStorage.getItem('token')) {
      window.notificationSystem = new NotificationSystem();
   }
});
