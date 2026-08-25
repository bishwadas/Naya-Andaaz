from django.db import models
from django.utils import timezone
from apps.core.utils import generate_video_id

class Video(models.Model):
    id = models.CharField(max_length=128, primary_key=True, default=generate_video_id)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    video_url = models.TextField(db_column='video_url')
    thumbnail_url = models.TextField(null=True, blank=True, db_column='thumbnail_url')
    duration = models.CharField(max_length=32, null=True, blank=True)
    is_featured = models.BooleanField(default=False, db_column='is_featured')
    display_order = models.IntegerField(default=0, db_column='display_order')
    
    # Soft deletion
    is_trashed = models.BooleanField(default=False, db_column='is_trashed')
    trashed_at = models.DateTimeField(null=True, blank=True, db_column='trashed_at')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')

    class Meta:
        db_table = 'videos'
        verbose_name = 'Video'
        verbose_name_plural = 'Videos'
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return self.title
