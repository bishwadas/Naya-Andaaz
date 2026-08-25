from django.db import models
from django.utils import timezone
from apps.core.utils import generate_menu_id, generate_menu_item_id

class Menu(models.Model):
    LOCATION_CHOICES = [
        ('primary', 'Primary Header Menu'),
        ('footer', 'Footer Menu'),
        ('mobile', 'Mobile Menu'),
    ]

    id = models.CharField(max_length=128, primary_key=True, default=generate_menu_id)
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=64, choices=LOCATION_CHOICES)
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')

    class Meta:
        db_table = 'menus'
        verbose_name = 'Navigation Menu'
        verbose_name_plural = 'Navigation Menus'

    def __str__(self):
        return f"{self.name} ({self.get_location_display()})"


class MenuItem(models.Model):
    id = models.CharField(max_length=128, primary_key=True, default=generate_menu_item_id)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='items', db_column='menu_id')
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        db_column='parent_id'
    )
    title = models.CharField(max_length=255)
    url = models.CharField(max_length=512)
    target = models.CharField(max_length=32, default='_self')
    order = models.IntegerField(default=0)
    icon = models.CharField(max_length=64, null=True, blank=True)

    class Meta:
        db_table = 'menu_items'
        verbose_name = 'Menu Item'
        verbose_name_plural = 'Menu Items'
        ordering = ['order']

    def __str__(self):
        return f"{self.title} -> {self.url}"
