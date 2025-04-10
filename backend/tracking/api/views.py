from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from ..models import WorkLog
from .serializers import WorkLogSerializer, UserSerializer,ReviewSerializer
from .permissions import TaskUserOrReadOnly
from rest_framework.validators import ValidationError
from django.utils.timezone import now
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import WorkLog,Review


class WorkLogListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkLog.objects.filter(employee=self.request.user)

    def perform_create(self, serializer):
        employee = self.request.user
        if WorkLog.objects.filter(employee=employee, status="pending").exists():
            raise ValidationError("You cannot add a new task while you have a pending task.")

        serializer.save(employee=employee)

class WorkLogUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = WorkLogSerializer
    permission_classes = [permissions.IsAuthenticated, TaskUserOrReadOnly]

    def get_queryset(self):
        return WorkLog.objects.filter(employee=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()

        # Ensure only status or end_time can be updated, not creating a new task
        serializer.save()


class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_tasks = WorkLog.objects.count()
        pending_tasks = WorkLog.objects.filter(status="pending").count()
        in_progress_tasks = WorkLog.objects.filter(status="in_progress").count()
        completed_tasks = WorkLog.objects.filter(status="completed").count()

        task_status_data = {
            "total": total_tasks,
            "pending": pending_tasks,
            "in_progress": in_progress_tasks,
            "completed": completed_tasks,
        }

        task_distribution = (
            WorkLog.objects.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )

        return Response(
            {
                "task_status_data": task_status_data,
                "task_distribution": list(task_distribution),
            }
        )


class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # Set user automatically
