import uuid

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.core import signing
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import MindGuardUser, MoodLog
from .serializers import (
    AuthLoginSerializer,
    AuthRegisterSerializer,
    MoodEntrySerializer,
    MoodLogSerializer,
    NotificationSerializer,
    TokenRegistrationSerializer,
)
from .services import (
    analyze_audio,
    analyze_text,
    analyze_video,
    create_mood_log,
    format_burnout_snapshot,
    get_user_logs,
)


def _create_signed_token(payload, salt):
    return signing.dumps(payload, salt=salt)


def _load_signed_token(token, salt, max_age):
    return signing.loads(token, salt=salt, max_age=max_age)


def _find_user_by_identifier(user_id):
    if not user_id:
        return None
    try:
        return MindGuardUser.objects.filter(external_id=uuid.UUID(str(user_id))).first()
    except (ValueError, TypeError):
        return MindGuardUser.objects.filter(email__iexact=user_id).first()


@api_view(["GET"])
def health_view(request):
    return Response(
        {
            "status": "ok",
            "service": "mindguard-django-api",
            "version": "1.0.0",
        }
    )


@api_view(["POST"])
def register_view(request):
    serializer = AuthRegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data["email"].lower()

    if MindGuardUser.objects.filter(email=email).exists():
        return Response(
            {"message": "User already exists"},
            status=status.HTTP_409_CONFLICT,
        )

    user = MindGuardUser.objects.create(
        email=email,
        name=serializer.validated_data.get("name", ""),
        password_hash=make_password(serializer.validated_data["password"]),
    )
    token = _create_signed_token({"uid": str(user.external_id)}, "mindguard-verify")
    verification_url = f"{settings.FRONTEND_URL.rstrip('/')}/verify-email?token={token}"

    send_mail(
        subject="Verify your MindGuard account",
        message=(
            "Welcome to MindGuard.\n\n"
            f"Verify your account here: {verification_url}\n\n"
            "If you did not request this account, you can ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )

    payload = {"message": "User created. Check email for verification link."}
    if settings.DEBUG:
        payload["verificationUrl"] = verification_url
    return Response(payload, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def verify_view(request):
    token = request.query_params.get("token")
    if not token:
        return Response("Invalid token", status=status.HTTP_400_BAD_REQUEST)

    try:
        payload = _load_signed_token(token, "mindguard-verify", 60 * 60 * 24)
    except signing.BadSignature:
        return Response("Invalid or expired token", status=status.HTTP_400_BAD_REQUEST)

    user = MindGuardUser.objects.filter(external_id=payload.get("uid")).first()
    if not user:
        return Response("User not found", status=status.HTTP_404_NOT_FOUND)
    if user.is_verified:
        return Response("Email already verified")

    user.is_verified = True
    user.save(update_fields=["is_verified", "updated_at"])
    return Response("Email successfully verified. You may now log in.")


@api_view(["POST"])
def login_view(request):
    serializer = AuthLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = MindGuardUser.objects.filter(email=serializer.validated_data["email"].lower()).first()
    if not user or not check_password(serializer.validated_data["password"], user.password_hash):
        return Response(
            {"message": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    if not user.is_verified:
        return Response(
            {"message": "Please verify your email first"},
            status=status.HTTP_403_FORBIDDEN,
        )

    auth_token = _create_signed_token({"uid": str(user.external_id), "kind": "access"}, "mindguard-auth")
    refresh_token = _create_signed_token({"uid": str(user.external_id), "kind": "refresh"}, "mindguard-refresh")

    return Response(
        {
            "authToken": auth_token,
            "refreshToken": refresh_token,
            "user": {
                "id": str(user.external_id),
                "email": user.email,
                "name": user.name,
                "burnoutScore": user.burnout_score,
            },
        }
    )


def _interaction_response(user_id, source_mode, analysis):
    user = _find_user_by_identifier(user_id)
    mood_log = create_mood_log(
        user_id=user_id,
        source_mode=source_mode,
        analysis=analysis,
        user=user,
    )
    return mood_log


@api_view(["POST"])
def text_interaction_view(request):
    user_id = request.data.get("userId")
    text = request.data.get("text", "")
    if not user_id or not text:
        return Response(
            {"message": "userId and text required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    mood_log = _interaction_response(user_id, "text", analyze_text(text))
    return Response({"message": "Text processed", "moodLog": MoodLogSerializer(mood_log).data})


@api_view(["POST"])
def voice_interaction_view(request):
    user_id = request.data.get("userId")
    audio_base64 = request.data.get("audioBase64")
    if not user_id or not audio_base64:
        return Response(
            {"message": "userId and audioBase64 required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    mood_log = _interaction_response(user_id, "voice", analyze_audio(audio_base64))
    return Response({"message": "Voice processed", "moodLog": MoodLogSerializer(mood_log).data})


@api_view(["POST"])
def video_interaction_view(request):
    user_id = request.data.get("userId")
    video_base64 = request.data.get("videoBase64")
    if not user_id or not video_base64:
        return Response(
            {"message": "userId and videoBase64 required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    mood_log = _interaction_response(user_id, "video", analyze_video(video_base64))
    return Response({"message": "Video processed", "moodLog": MoodLogSerializer(mood_log).data})


@api_view(["GET", "POST"])
def mood_view(request):
    if request.method == "POST":
        serializer = MoodEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data["userId"]
        user = _find_user_by_identifier(user_id)
        mood_log = create_mood_log(
            user_id=user_id,
            source_mode=serializer.validated_data["sourceMode"],
            analysis={
                "emotion": serializer.validated_data["emotion"],
                "confidence": serializer.validated_data.get("details", {}).get("confidence", 0.88),
                "details": serializer.validated_data.get("details", {}),
            },
            user=user,
        )
        snapshot = format_burnout_snapshot(get_user_logs(user_id))
        return Response({"entry": MoodLogSerializer(mood_log).data, "burnoutRisk": snapshot})

    user_id = request.query_params.get("userId") or request.headers.get("x-user-id")
    if not user_id:
        return Response({"message": "userId required"}, status=status.HTTP_400_BAD_REQUEST)
    logs = get_user_logs(user_id)
    return Response(MoodLogSerializer(logs[:50], many=True).data)


@api_view(["GET"])
def mood_history_view(request):
    user_id = request.query_params.get("userId")
    if not user_id:
        return Response({"message": "userId required"}, status=status.HTTP_400_BAD_REQUEST)
    logs = get_user_logs(user_id)
    return Response(MoodLogSerializer(logs[:30], many=True).data)


@api_view(["GET"])
def burnout_risk_view(request):
    user_id = request.query_params.get("userId")
    if not user_id:
        return Response({"message": "userId required"}, status=status.HTTP_400_BAD_REQUEST)
    snapshot = format_burnout_snapshot(get_user_logs(user_id))
    return Response(snapshot)


@api_view(["POST"])
def register_token_view(request):
    serializer = TokenRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = _find_user_by_identifier(serializer.validated_data["userId"])
    if not user:
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    user.expo_push_token = serializer.validated_data["expoPushToken"]
    user.save(update_fields=["expo_push_token", "updated_at"])
    return Response({"message": "Push token registered successfully"})


@api_view(["POST"])
def send_alert_view(request):
    serializer = NotificationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = _find_user_by_identifier(serializer.validated_data["userId"])
    if not user or not user.expo_push_token:
        return Response(
            {"message": "User or push token not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    ticket = {
        "id": _create_signed_token({"uid": str(user.external_id)}, "mindguard-ticket"),
        "status": "queued",
        "title": serializer.validated_data["title"],
    }
    return Response({"message": "Notification sent", "tickets": [ticket]})
