from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.utils import generate_media_id, default_focal_point

class Media(models.Model):
    id = models.CharField(max_length=128, primary_key=True, default=generate_media_id)
    title = models.CharField(max_length=255)
    filename = models.CharField(max_length=255)
    url = models.TextField()
    thumbnail_url = models.TextField(null=True, blank=True, db_column='thumbnail_url')
    mime_type = models.CharField(max_length=128, db_column='mime_type')
    size = models.IntegerField()
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    alt_text = models.TextField(null=True, blank=True, db_column='alt_text')
    caption = models.TextField(null=True, blank=True)
    focal_point = models.JSONField(default=default_focal_point, blank=True, db_column='focal_point')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_media',
        db_column='uploaded_by'
    )
    
    # Soft deletion
    is_trashed = models.BooleanField(default=False, db_column='is_trashed')
    trashed_at = models.DateTimeField(null=True, blank=True, db_column='trashed_at')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')

    class Meta:
        db_table = 'media'
        verbose_name = 'Media'
        verbose_name_plural = 'Media Items'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.filename})"
