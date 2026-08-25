from django.contrib import admin
from .models import OTP

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'type', 'attempts', 'expires_at', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('email', 'code')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
