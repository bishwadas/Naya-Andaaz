from django.test import TestCase, Client
from apps.users.models import User
from apps.categories.models import Category
from apps.tags.models import Tag
from apps.posts.models import Post
from apps.media_library.models import Media
from apps.pages.models import Page
from apps.comments.models import Comment
from apps.menus.models import Menu, MenuItem
from apps.site_settings.models import SiteSetting
from apps.activity_logs.models import ActivityLog
from apps.notifications.models import Notification
from apps.advertisements.models import Advertisement
from apps.newsletters.models import Newsletter
from apps.videos.models import Video
from apps.otps import models as otps_models

class HealthCheckTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_endpoint(self):
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

class ModelCreationTest(TestCase):
    def test_create_user_and_models(self):
        # User
        user = User.objects.create_user(
            email='testadmin@sereia.com',
            username='testadmin',
            name='Test Admin',
            password='TestPassword@123',
            role='admin'
        )
        self.assertEqual(user.role, 'admin')
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)

        # Category
        cat = Category.objects.create(name='Technology', slug='technology')
        self.assertEqual(str(cat), 'Technology')

        # Tag
        tag = Tag.objects.create(name='AI', slug='ai')
        self.assertEqual(str(tag), 'AI')

        # Post
        post = Post.objects.create(
            title='Test Article',
            slug='test-article',
            content='Test content for article',
            author=user,
            category=cat,
            status='published'
        )
        post.tags.add(tag)
        self.assertEqual(str(post), 'Test Article')
        self.assertEqual(post.tags.count(), 1)

        # Site Setting
        setting = SiteSetting.objects.create(key='site_name', value='Sereia')
        self.assertEqual(str(setting), 'site_name')
