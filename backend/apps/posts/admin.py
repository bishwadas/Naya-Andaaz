from django.contrib import admin
from .models import Post, PostTag, PostRevision

class PostRevisionInline(admin.TabularInline):
    model = PostRevision
    extra = 0
    readonly_fields = ('title', 'author', 'created_at')
    can_delete = False

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'is_featured', 'is_trending', 'is_editor_pick', 'views', 'published_at')
    list_filter = ('status', 'category', 'is_featured', 'is_trending', 'is_editor_pick', 'is_trashed', 'published_at')
    search_fields = ('title', 'slug', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-published_at', '-created_at')
    inlines = [PostRevisionInline]
    
    fieldsets = (
        ('General Information', {'fields': ('title', 'slug', 'author', 'category', 'sub_category', 'status')}),
        ('Article Content', {'fields': ('excerpt', 'content', 'featured_image', 'featured_image_caption', 'blocks', 'faqs', 'related_post_ids')}),
        ('Editorial Flags & Metrics', {'fields': ('is_featured', 'is_trending', 'is_editor_pick', 'reading_time', 'views', 'likes')}),
        ('Scheduling', {'fields': ('published_at', 'scheduled_at')}),
        ('SEO & Open Graph', {'fields': ('meta_title', 'meta_description', 'focus_keyword', 'canonical_url', 'og_image', 'twitter_image')}),
        ('Trash & Timestamps', {'fields': ('is_trashed', 'trashed_at', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at', 'views', 'likes')

@admin.register(PostRevision)
class PostRevisionAdmin(admin.ModelAdmin):
    list_display = ('title', 'post', 'author', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'content')
    readonly_fields = ('created_at',)
