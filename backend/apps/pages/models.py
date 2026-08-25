from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.utils import generate_page_id

class Page(models.Model):
    STATUS_CHOICES = [
        ('published', 'Published'),
        ('draft', 'Draft'),
    ]

    id = models.CharField(max_length=128, primary_key=True, default=generate_page_id)
    title = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, unique=True)
    content = models.TextField()
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='published')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pages',
        db_column='author_id'
    )
    
    # SEO
    meta_title = models.TextField(null=True, blank=True, db_column='meta_title')
    meta_description = models.TextField(null=True, blank=True, db_column='meta_description')
    keywords = models.TextField(null=True, blank=True)
    
    # Soft deletion
    is_trashed = models.BooleanField(default=False, db_column='is_trashed')
    trashed_at = models.DateTimeField(null=True, blank=True, db_column='trashed_at')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')

    class Meta:
        db_table = 'pages'
        verbose_name = 'Page'
        verbose_name_plural = 'Pages'
        ordering = ['title']

    def __str__(self):
        return self.title
