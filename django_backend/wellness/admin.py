from django.contrib import admin

from .models import MindGuardUser, MoodLog


@admin.register(MindGuardUser)
class MindGuardUserAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "is_verified", "burnout_score", "last_detected_emotion")
    search_fields = ("email", "name")


@admin.register(MoodLog)
class MoodLogAdmin(admin.ModelAdmin):
    list_display = ("client_user_id", "emotion", "source_mode", "timestamp")
    list_filter = ("emotion", "source_mode")
    search_fields = ("client_user_id",)
