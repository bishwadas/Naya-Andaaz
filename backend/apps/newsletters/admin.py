from django.contrib import admin
from .models import Newsletter

@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_active', 'source', 'created_at')
    list_filter = ('is_active', 'source', 'created_at')
    search_fields = ('email',)
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
