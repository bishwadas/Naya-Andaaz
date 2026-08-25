from django.contrib import admin
from .models import Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'display_order', 'is_trashed', 'created_at')
    list_filter = ('parent', 'is_trashed', 'created_at')
    search_fields = ('name', 'slug', 'description')
    ordering = ('display_order', 'name')
    readonly_fields = ('created_at', 'updated_at')
