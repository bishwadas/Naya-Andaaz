from django.contrib import admin
from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'author_email', 'post', 'status', 'is_trashed', 'created_at')
    list_filter = ('status', 'is_trashed', 'created_at')
    search_fields = ('author_name', 'author_email', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
