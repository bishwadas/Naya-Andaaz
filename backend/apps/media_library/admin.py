from django.contrib import admin
from .models import Media

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('title', 'filename', 'mime_type', 'size', 'width', 'height', 'uploaded_by', 'is_trashed', 'created_at')
    list_filter = ('mime_type', 'is_trashed', 'created_at')
    search_fields = ('title', 'filename', 'alt_text', 'caption')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
