from django.db import models
from django.utils import timezone
from apps.core.utils import generate_setting_id

class SiteSetting(models.Model):
    id = models.CharField(max_length=128, primary_key=True, default=generate_setting_id)
    key = models.CharField(max_length=128, unique=True)
    value = models.TextField()
    description = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField(default=timezone.now, db_column='updated_at')

    class Meta:
        db_table = 'site_settings'
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'
        ordering = ['key']

    def __str__(self):
        return self.key
