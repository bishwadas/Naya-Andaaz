from django.contrib import admin
from .models import Video

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'duration', 'is_featured', 'display_order', 'is_trashed', 'created_at')
    list_filter = ('is_featured', 'is_trashed', 'created_at')
    search_fields = ('title', 'description', 'video_url')
    ordering = ('display_order', '-created_at')
    readonly_fields = ('created_at', 'updated_at')
