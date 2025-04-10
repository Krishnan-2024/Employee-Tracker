from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("id", "email", "age", "gender", "title", "profile_picture", "is_verified", "is_active", "is_staff")
    list_filter = ("is_verified", "is_active", "is_staff", "gender")
    
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Personal Info", {"fields": ("age", "gender", "title", "description", "profile_picture")}),
        ("Permissions", {"fields": ("is_verified", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "age", "gender", "title", "description", "profile_picture", "is_verified", "is_active", "is_staff"),
        }),
    )

    search_fields = ("email", "title")
    ordering = ("email",)
    filter_horizontal = ("groups", "user_permissions")

# Register the custom user model
admin.site.register(User, CustomUserAdmin)
