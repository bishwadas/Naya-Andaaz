from django.contrib import admin
from .models import Menu, MenuItem

class MenuItemInline(admin.TabularInline):
    model = MenuItem
    extra = 1
    fields = ('title', 'url', 'parent', 'target', 'order', 'icon')

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'created_at', 'updated_at')
    list_filter = ('location',)
    search_fields = ('name',)
    inlines = [MenuItemInline]

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'menu', 'parent', 'url', 'target', 'order')
    list_filter = ('menu', 'target')
    search_fields = ('title', 'url')
    ordering = ('menu', 'order')
