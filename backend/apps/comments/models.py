from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.core.utils import generate_comment_id
from apps.posts.models import Post

class Comment(models.Model):
    STATUS_CHOICES = [
        ('approved', 'Approved'),
        ('pending', 'Pending Moderation'),
        ('spam', 'Spam'),
        ('trash', 'Trash'),
    ]

    id = models.CharField(max_length=128, primary_key=True, default=generate_comment_id)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments', db_column='post_id')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='comments',
        db_column='user_id'
    )
    author_name = models.CharField(max_length=255, db_column='author_name')
    author_email = models.CharField(max_length=255, db_column='author_email')
    content = models.TextField()
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='approved')
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        db_column='parent_id'
    )
    
    # Soft deletion
    is_trashed = models.BooleanField(default=False, db_column='is_trashed')
    trashed_at = models.DateTimeField(null=True, blank=True, db_column='trashed_at')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')

    class Meta:
        db_table = 'comments'
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.author_name} on {self.post.title[:30]}"
