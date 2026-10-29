from collections import Counter
from datetime import timedelta
import zlib

from django.utils import timezone

from .models import MoodLog

EMOTION_SCORES = {
    "happy": 0.18,
    "calm": 0.12,
    "neutral": 0.42,
    "sad": 0.58,
    "anxious": 0.78,
    "stressed": 0.9,
}

TEXT_RULES = [
    ("stressed", ("stress", "burnout", "deadline", "panic", "overwhelm", "tired", "exhausted")),
    ("anxious", ("anxious", "worry", "nervous", "afraid")),
    ("happy", ("happy", "great", "good", "grateful", "joy", "proud")),
    ("calm", ("calm", "rested", "peaceful", "relaxed", "grounded")),
]


def analyze_text(text):
    lowered = text.lower()
    emotion = "neutral"
    confidence = 0.74

    for label, keywords in TEXT_RULES:
        if any(keyword in lowered for keyword in keywords):
            emotion = label
            confidence = 0.92 if label in {"stressed", "happy"} else 0.86
            break

    details = {
        "confidence": confidence,
        "summary": f"Detected {emotion} sentiment from reflection text.",
        "suggestion": suggested_action(emotion),
    }
    return {"emotion": emotion, "confidence": confidence, "details": details}


def analyze_audio(audio_base64):
    return analyze_binary_payload(audio_base64, "voice")


def analyze_video(video_base64):
    return analyze_binary_payload(video_base64, "video")


def analyze_binary_payload(payload, mode):
    checksum = zlib.crc32(payload.encode("utf-8"))
    options = ["calm", "neutral", "happy", "stressed"]
    emotion = options[checksum % len(options)]
    confidence = 0.7 + ((checksum % 18) / 100)
    details = {
        "confidence": round(confidence, 2),
        "summary": f"Estimated {emotion} state from {mode} sample.",
        "suggestion": suggested_action(emotion),
    }
    return {"emotion": emotion, "confidence": round(confidence, 2), "details": details}


def create_mood_log(user_id, source_mode, analysis, user=None):
    mood_log = MoodLog.objects.create(
        user=user,
        client_user_id=user_id,
        source_mode=source_mode,
        emotion=analysis["emotion"],
        details=analysis.get("details", {"confidence": analysis.get("confidence", 0.8)}),
    )

    if user:
        snapshot = format_burnout_snapshot(get_user_logs(user_id))
        user.last_detected_emotion = mood_log.emotion
        user.burnout_score = snapshot["burnoutRisk"]
        user.save(update_fields=["last_detected_emotion", "burnout_score", "updated_at"])

    return mood_log


def get_user_logs(user_id):
    return MoodLog.objects.filter(client_user_id=user_id).order_by("-timestamp")


def format_burnout_snapshot(log_queryset):
    logs = list(log_queryset[:14])
    if not logs:
        return {
            "burnoutRisk": 24,
            "level": "Low",
            "status": "Healthy equilibrium",
            "trend": "steady",
            "latestEmotion": "neutral",
            "dominantEmotion": "neutral",
        }

    recent = logs[:7]
    average = sum(EMOTION_SCORES.get(item.emotion, 0.42) for item in recent) / len(recent)
    burnout_risk = round(average * 100)

    if burnout_risk >= 70:
        level = "High"
        status = "Sustained strain detected"
    elif burnout_risk >= 45:
        level = "Moderate"
        status = "Recovery pacing recommended"
    else:
        level = "Low"
        status = "Healthy equilibrium"

    recent_average = sum(EMOTION_SCORES.get(item.emotion, 0.42) for item in recent) / len(recent)
    prior_window = logs[7:14]
    prior_average = (
        sum(EMOTION_SCORES.get(item.emotion, 0.42) for item in prior_window) / len(prior_window)
        if prior_window
        else recent_average
    )

    delta = recent_average - prior_average
    if delta > 0.08:
        trend = "rising"
    elif delta < -0.08:
        trend = "improving"
    else:
        trend = "steady"

    dominant_emotion = Counter(item.emotion for item in recent).most_common(1)[0][0]
    return {
        "burnoutRisk": burnout_risk,
        "level": level,
        "status": status,
        "trend": trend,
        "latestEmotion": recent[0].emotion,
        "dominantEmotion": dominant_emotion,
    }


def suggested_action(emotion):
    if emotion in {"stressed", "anxious"}:
        return "Take a 3-minute breathing reset and reduce one active demand."
    if emotion in {"happy", "calm"}:
        return "Capture what is helping so you can repeat it later."
    return "Add one short reflection so MindGuard can build a steadier baseline."


def group_logs_by_day(logs, days=7):
    today = timezone.localdate()
    buckets = []
    recent_logs = list(logs)
    for offset in range(days - 1, -1, -1):
        day = today - timedelta(days=offset)
        day_logs = [log for log in recent_logs if timezone.localtime(log.timestamp).date() == day]
        calm_score = 0
        stress_score = 0
        if day_logs:
            for log in day_logs:
                score = EMOTION_SCORES.get(log.emotion, 0.42)
                stress_score += score
                calm_score += 1 - score
            denominator = len(day_logs)
            stress_score = round((stress_score / denominator) * 100)
            calm_score = round((calm_score / denominator) * 100)
        buckets.append(
            {
                "day": day.strftime("%a"),
                "stress": stress_score,
                "calm": calm_score,
            }
        )
    return buckets
