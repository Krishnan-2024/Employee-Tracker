from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import WorkLog, Review

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

class WorkLogSerializer(serializers.ModelSerializer):
    employee = UserSerializer(read_only=True)

    class Meta:
        model = WorkLog
        fields = ["id", "employee", "task_name", "start_time", "end_time", "description", "status"]
        read_only_fields = ("employee", )

    def validate(self, data):
        request = self.context["request"]
        employee = request.user

        if self.instance is None:  # Only validate on creation
            if WorkLog.objects.filter(employee=employee, status="pending").exists():
                raise serializers.ValidationError("You cannot add a new task while you have a pending task.")

        return data

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')  # Display username instead of ID

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']