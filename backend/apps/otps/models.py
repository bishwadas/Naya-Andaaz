from django.db import models
from django.utils import timezone
from apps.core.utils import generate_otp_id

class OTP(models.Model):
    TYPE_CHOICES = [
        ('email_verification', 'Email Verification'),
        ('password_reset', 'Password Reset'),
        ('login', 'Login 2FA'),
    ]

    id = models.CharField(max_length=128, primary_key=True, default=generate_otp_id)
    email = models.CharField(max_length=255)
    code = models.CharField(max_length=16)
    type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    attempts = models.IntegerField(default=0)
    expires_at = models.DateTimeField(db_column='expires_at')
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')

    class Meta:
        db_table = 'otps'
        verbose_name = 'OTP Token'
        verbose_name_plural = 'OTP Tokens'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} code for {self.email}"
