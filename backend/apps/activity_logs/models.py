from django.db import models
from django.utils import timezone
from apps.core.utils import generate_activity_log_id

class ActivityLog(models.Model):
    id = models.CharField(max_length=128, primary_key=True, default=generate_activity_log_id)
    user_id = models.CharField(max_length=128, null=True, blank=True, db_column='user_id')
    user_name = models.CharField(max_length=255, db_column='user_name')
    user_avatar = models.TextField(null=True, blank=True, db_column='user_avatar')
    action = models.CharField(max_length=64, db_column='action')
    target_type = models.CharField(max_length=64, db_column='target_type')
    target_id = models.CharField(max_length=128, null=True, blank=True, db_column='target_id')
    target_title = models.CharField(max_length=255, null=True, blank=True, db_column='target_title')
    details = models.TextField(null=True, blank=True)
    ip_address = models.CharField(max_length=64, null=True, blank=True, db_column='ip_address')
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')

    class Meta:
        db_table = 'activity_logs'
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user_name} - {self.action} {self.target_type} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
