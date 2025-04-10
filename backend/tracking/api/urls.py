from django.urls import path
from .views import WorkLogListCreateView, WorkLogUpdateView, DashboardStatsAPIView, ReviewListCreateView

urlpatterns = [
    path("worklogs/", WorkLogListCreateView.as_view(), name="worklogs"),
    path("worklogs/<int:pk>/", WorkLogUpdateView.as_view(), name="worklog-update"),
    path("dashboard/", DashboardStatsAPIView.as_view(), name="dashboard-stats"),
    path('reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
]
