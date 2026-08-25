from django.contrib import admin
from .models import Advertisement

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'is_active', 'impressions', 'clicks', 'is_trashed', 'created_at')
    list_filter = ('location', 'is_active', 'is_trashed', 'created_at')
    search_fields = ('title', 'code', 'target_url')
    ordering = ('-created_at',)
    readonly_fields = ('impressions', 'clicks', 'created_at', 'updated_at')
