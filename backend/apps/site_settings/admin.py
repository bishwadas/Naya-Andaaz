from django.contrib import admin
from .models import SiteSetting

@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'description', 'updated_at')
    search_fields = ('key', 'value', 'description')
    ordering = ('key',)
    readonly_fields = ('updated_at',)
