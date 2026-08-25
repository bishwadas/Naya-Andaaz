from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'name', 'role', 'status', 'email_verified', 'created_at')
    list_filter = ('role', 'status', 'email_verified', 'is_trashed')
    search_fields = ('username', 'email', 'name', 'phone')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Account Credentials', {'fields': ('username', 'email', 'password')}),
        ('Personal Info', {'fields': ('name', 'avatar', 'bio', 'phone', 'social_links')}),
        ('Permissions & Roles', {'fields': ('role', 'status', 'email_verified', 'email_verified_at', 'is_staff', 'is_superuser')}),
        ('Trash & Timestamps', {'fields': ('is_trashed', 'trashed_at', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at')
