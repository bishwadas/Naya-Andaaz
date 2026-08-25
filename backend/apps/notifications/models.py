from django.db import models
from django.utils import timezone
from apps.core.utils import generate_notification_id

class Notification(models.Model):
    TYPE_CHOICES = [
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]

    id = models.CharField(max_length=128, primary_key=True, default=generate_notification_id)
    user_id = models.CharField(max_length=128, db_column='user_id')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=32, choices=TYPE_CHOICES, default='info')
    is_read = models.BooleanField(default=False, db_column='is_read')
    link = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (User: {self.user_id})"
