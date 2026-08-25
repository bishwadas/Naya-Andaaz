from django.contrib import admin
from .models import Page

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'status', 'author', 'is_trashed', 'created_at')
    list_filter = ('status', 'is_trashed', 'created_at')
    search_fields = ('title', 'slug', 'content')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('title',)
    readonly_fields = ('created_at', 'updated_at')
