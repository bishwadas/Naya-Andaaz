from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from apps.core.utils import generate_user_id

class UserManager(BaseUserManager):
    def create_user(self, email, username, name, password=None, role='subscriber', **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')
        
        email = self.normalize_email(email)
        user_id = extra_fields.pop('id', generate_user_id())
        
        user = self.model(
            id=user_id,
            email=email,
            username=username,
            name=name,
            role=role,
            **extra_fields
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(
            email=email,
            username=username,
            name=name,
            password=password,
            role='admin',
            status='active',
            email_verified=True,
            **extra_fields
        )

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('admin', 'Super Admin'),
        ('editor', 'Editor'),
        ('author', 'Author'),
        ('subscriber', 'Subscriber'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]

    id = models.CharField(max_length=128, primary_key=True, default=generate_user_id)
    uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    username = models.CharField(max_length=128, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    password = models.TextField(db_column='password_hash')
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default='subscriber')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='active')
    avatar = models.TextField(default='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', blank=True)
    bio = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=64, null=True, blank=True)
    social_links = models.JSONField(default=dict, blank=True, db_column='social_links')
    email_verified = models.BooleanField(default=False, db_column='email_verified')
    email_verified_at = models.DateTimeField(null=True, blank=True, db_column='email_verified_at')
    
    # Soft deletion
    is_trashed = models.BooleanField(default=False, db_column='is_trashed')
    trashed_at = models.DateTimeField(null=True, blank=True, db_column='trashed_at')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')

    # Django internal flags
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.get_role_display()}"

    def save(self, *args, **kwargs):
        if self.role in ['admin', 'editor']:
            self.is_staff = True
        else:
            self.is_staff = False
        if self.role == 'admin':
            self.is_superuser = True
        else:
            self.is_superuser = False
        if self.status != 'active' or self.is_trashed:
            self.is_active = False
        else:
            self.is_active = True
        super().save(*args, **kwargs)
