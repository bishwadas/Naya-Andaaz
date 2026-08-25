from django.db import models
from django.utils import timezone
from apps.core.utils import generate_tag_id

class Tag(models.Model):
    id = models.CharField(max_length=128, primary_key=True, default=generate_tag_id)
    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)
    
    # Soft deletion
    is_trashed = models.BooleanField(default=False, db_column='is_trashed')
    trashed_at = models.DateTimeField(null=True, blank=True, db_column='trashed_at')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')

    class Meta:
        db_table = 'tags'
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        ordering = ['name']

    def __str__(self):
        return self.name
