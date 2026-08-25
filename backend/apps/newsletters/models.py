from django.db import models
from django.utils import timezone
from apps.core.utils import generate_newsletter_id

class Newsletter(models.Model):
    id = models.CharField(max_length=128, primary_key=True, default=generate_newsletter_id)
    email = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True, db_column='is_active')
    source = models.CharField(max_length=128, default='website')
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')

    class Meta:
        db_table = 'newsletters'
        verbose_name = 'Newsletter Subscriber'
        verbose_name_plural = 'Newsletter Subscribers'
        ordering = ['-created_at']

    def __str__(self):
        return self.email
