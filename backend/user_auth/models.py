from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to="profiles/", blank=True, null=True)
    department = models.CharField(max_length=200, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[("Male", "Male"), ("Female", "Female")], blank=True)
    title = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def save(self, *args, **kwargs):
        if self.gender:
            self.gender = self.gender.capitalize()  # Ensures "male" -> "Male"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username


