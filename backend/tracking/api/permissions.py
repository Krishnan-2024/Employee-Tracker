from rest_framework import permissions

class TaskUserOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return
        else:
            return obj.employee == request.user or request.user.is_staff 