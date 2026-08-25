from django.core.management.base import BaseCommand
from apps.users.models import User

class Command(BaseCommand):
    help = 'Seeds or updates default admin and demo accounts'

    def handle(self, *args, **options):
        # Admin account
        admin, created = User.objects.get_or_create(
            email='admin@sereia.news',
            defaults={
                'id': 'usr_admin_01',
                'username': 'admin',
                'name': 'Elena Rostova',
                'role': 'admin',
                'status': 'active',
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                'email_verified': True,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin.set_password('AdminPass2026!')
        admin.username = 'admin'
        admin.name = 'Elena Rostova'
        admin.role = 'admin'
        admin.status = 'active'
        admin.email_verified = True
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        self.stdout.write(self.style.SUCCESS('Admin user admin@sereia.news created/updated successfully! Password: AdminPass2026!'))

        # Also create secondary admin with username admin / admin123 for convenience
        admin_alt, created_alt = User.objects.get_or_create(
            username='admin_alt',
            defaults={
                'id': 'usr_admin_02',
                'email': 'admin123@sereia.news',
                'name': 'Admin User',
                'role': 'admin',
                'status': 'active',
                'email_verified': True,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_alt.set_password('admin123')
        admin_alt.is_staff = True
        admin_alt.is_superuser = True
        admin_alt.role = 'admin'
        admin_alt.status = 'active'
        admin_alt.email_verified = True
        admin_alt.save()
        self.stdout.write(self.style.SUCCESS('Alt admin account created/updated.'))
