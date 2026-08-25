from django.contrib import admin
from .models import ActivityLog

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'action', 'target_type', 'target_title', 'ip_address', 'created_at')
    list_filter = ('action', 'target_type', 'created_at')
    search_fields = ('user_name', 'target_title', 'details', 'ip_address')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
