from django.contrib import admin
from .models import WorkLog, Review

@admin.register(WorkLog)
class WorkLogAdmin(admin.ModelAdmin):
    list_display = ("employee", "task_name", "status", "start_time", "end_time")
    search_fields = ("employee__username", "task_name")
    list_filter = ("status", "start_time", "end_time")
    ordering = ("-start_time",)

admin.site.register(Review)