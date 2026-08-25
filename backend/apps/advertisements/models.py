from django.db import models
from django.utils import timezone
from apps.core.utils import generate_ad_id

class Advertisement(models.Model):
    LOCATION_CHOICES = [
        ('header', 'Header Banner'),
        ('sidebar', 'Sidebar Sticky / Inline'),
        ('article_inline', 'Inside Article Content'),
        ('footer', 'Footer Banner'),
        ('popup', 'Pop-up / Interstitial'),
    ]

    id = models.CharField(max_length=128, primary_key=True, default=generate_ad_id)
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=64, choices=LOCATION_CHOICES)
    code = models.TextField(null=True, blank=True)
    image_url = models.TextField(null=True, blank=True, db_column='image_url')
    target_url = models.TextField(null=True, blank=True, db_column='target_url')
    is_active = models.BooleanField(default=True, db_column='is_active')
    impressions = models.IntegerField(default=0)
    clicks = models.IntegerField(default=0)
    start_date = models.DateTimeField(null=True, blank=True, db_column='start_date')
    end_date = models.DateTimeField(null=True, blank=True, db_column='end_date')
    
    # Soft deletion
    is_trashed = models.BooleanField(default=False, db_column='is_trashed')
    trashed_at = models.DateTimeField(null=True, blank=True, db_column='trashed_at')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')

    class Meta:
        db_table = 'advertisements'
        verbose_name = 'Advertisement'
        verbose_name_plural = 'Advertisements'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.location})"
