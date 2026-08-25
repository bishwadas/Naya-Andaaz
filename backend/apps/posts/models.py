from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.utils import generate_post_id, generate_post_tag_id, generate_revision_id
from apps.categories.models import Category
from apps.tags.models import Tag

class Post(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('published', 'Published'),
        ('scheduled', 'Scheduled'),
        ('trash', 'Trash'),
    ]

    id = models.CharField(max_length=128, primary_key=True, default=generate_post_id)
    title = models.CharField(max_length=512)
    slug = models.CharField(max_length=512, unique=True)
    content = models.TextField()
    excerpt = models.TextField(null=True, blank=True)
    
    # Media
    featured_image = models.TextField(null=True, blank=True, db_column='featured_image')
    featured_image_caption = models.TextField(null=True, blank=True, db_column='featured_image_caption')
    
    # Relationships
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
        db_column='author_id'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='posts',
        db_column='category_id'
    )
    sub_category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_posts',
        db_column='sub_category_id'
    )
    tags = models.ManyToManyField(
        Tag,
        through='PostTag',
        related_name='posts',
        blank=True
    )
    
    # Editorial status & Flags
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False, db_column='is_featured')
    is_trending = models.BooleanField(default=False, db_column='is_trending')
    is_editor_pick = models.BooleanField(default=False, db_column='is_editor_pick')
    reading_time = models.IntegerField(default=1, db_column='reading_time')
    views = models.IntegerField(default=0)
    likes = models.IntegerField(default=0)
    
    # Scheduling & Publication
    published_at = models.DateTimeField(null=True, blank=True, db_column='published_at')
    scheduled_at = models.DateTimeField(null=True, blank=True, db_column='scheduled_at')
    
    # SEO
    meta_title = models.TextField(null=True, blank=True, db_column='meta_title')
    meta_description = models.TextField(null=True, blank=True, db_column='meta_description')
    focus_keyword = models.TextField(null=True, blank=True, db_column='focus_keyword')
    canonical_url = models.TextField(null=True, blank=True, db_column='canonical_url')
    og_image = models.TextField(null=True, blank=True, db_column='og_image')
    twitter_image = models.TextField(null=True, blank=True, db_column='twitter_image')
    
    # JSON Content Extensions
    blocks = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True)
    related_post_ids = models.JSONField(default=list, blank=True, db_column='related_post_ids')
    
    # Soft deletion
    is_trashed = models.BooleanField(default=False, db_column='is_trashed')
    trashed_at = models.DateTimeField(null=True, blank=True, db_column='trashed_at')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')

    class Meta:
        db_table = 'posts'
        verbose_name = 'Article'
        verbose_name_plural = 'Articles'
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title


class PostTag(models.Model):
    id = models.CharField(max_length=128, primary_key=True, default=generate_post_tag_id)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, db_column='post_id')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, db_column='tag_id')

    class Meta:
        db_table = 'post_tags'
        unique_together = ('post', 'tag')
        verbose_name = 'Post Tag'
        verbose_name_plural = 'Post Tags'


class PostRevision(models.Model):
    id = models.CharField(max_length=128, primary_key=True, default=generate_revision_id)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='revisions', db_column='post_id')
    title = models.CharField(max_length=512)
    content = models.TextField()
    excerpt = models.TextField(null=True, blank=True)
    blocks = models.JSONField(default=list, blank=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='author_id'
    )
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')

    class Meta:
        db_table = 'post_revisions'
        verbose_name = 'Post Revision'
        verbose_name_plural = 'Post Revisions'
        ordering = ['-created_at']
