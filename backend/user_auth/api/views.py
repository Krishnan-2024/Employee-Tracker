from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    LoginSerializer,
    ResetPasswordEmailSerializer,
    ResetPasswordSerializer,
    ProfileUpdateSerializer
)

User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        print(request.data)
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully. Check your email to verify your account."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    def get(self, request, token):
        try:
            payload = AccessToken(token) 
            user_id = payload["user_id"]
            user = User.objects.get(id=user_id)
            user.is_verified = True
            user.is_active = True
            user.save()

            return Response({"message": "Email verified successfully!"}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": "Invalid or expired token", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
class LoginView(APIView):
    def post(self, request):
        print(request.data)
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(username=serializer.validated_data["email"], password=serializer.validated_data["password"])
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({"access": str(refresh.access_token), "refresh": str(refresh)}, status=status.HTTP_200_OK)
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # If using SimpleJWT, blacklist the refresh token
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    
    def post(self, request):
        serializer = ResetPasswordEmailSerializer(data=request.data)
        if serializer.is_valid():
            user = get_object_or_404(User, email=serializer.validated_data["email"])
            token = RefreshToken.for_user(user).access_token
            reset_link = f"http://localhost:3000/reset-password/{token}/"
            send_mail("Reset Password", f"Click the link to reset your password: {reset_link}", settings.EMAIL_HOST_USER, [user.email])
            return Response({"message": "Check your email for the reset link"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    
    def post(self, request, token):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            try:
                access_token = AccessToken(token)
                user_id = access_token["user_id"]
                user = User.objects.get(id=user_id)
                user.set_password(serializer.validated_data["new_password"])
                user.save()

                return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": "Invalid token", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = ProfileUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class ProfileView(APIView):
    # permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Retrieve the authenticated user's profile"""
        user = request.user
        serializer = UserSerializer(user, context={"request": request})  # Pass request
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """Update the user's profile"""
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)  # Allow partial updates
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)