from django.db import models
from django.utils import timezone
from apps.core.utils import generate_category_id

class Category(models.Model):
    id = models.CharField(max_length=128, primary_key=True, default=generate_category_id)
    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children',
        db_column='parent_id'
    )
    color = models.CharField(max_length=64, null=True, blank=True)
    image = models.TextField(null=True, blank=True)
    
    # SEO fields
    meta_title = models.TextField(null=True, blank=True, db_column='meta_title')
    meta_description = models.TextField(null=True, blank=True, db_column='meta_description')
    keywords = models.TextField(null=True, blank=True)
    canonical_url = models.TextField(null=True, blank=True, db_column='canonical_url')
    og_image = models.TextField(null=True, blank=True, db_column='og_image')
    twitter_image = models.TextField(null=True, blank=True, db_column='twitter_image')
    
    # Hierarchy & Order
    display_order = models.IntegerField(default=0, db_column='display_order')
    
    # Soft deletion
    is_trashed = models.BooleanField(default=False, db_column='is_trashed')
    trashed_at = models.DateTimeField(null=True, blank=True, db_column='trashed_at')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')

    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name
