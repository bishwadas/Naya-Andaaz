from django.contrib import admin
from .models import Tag

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_trashed', 'created_at')
    list_filter = ('is_trashed', 'created_at')
    search_fields = ('name', 'slug')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
