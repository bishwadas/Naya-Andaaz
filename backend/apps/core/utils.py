import uuid

def generate_user_id():
    return f"usr_{uuid.uuid4().hex[:12]}"

def generate_category_id():
    return f"cat_{uuid.uuid4().hex[:12]}"

def generate_tag_id():
    return f"tag_{uuid.uuid4().hex[:12]}"

def generate_post_id():
    return f"post_{uuid.uuid4().hex[:12]}"

def generate_post_tag_id():
    return f"pt_{uuid.uuid4().hex[:12]}"

def generate_revision_id():
    return f"rev_{uuid.uuid4().hex[:12]}"

def generate_media_id():
    return f"med_{uuid.uuid4().hex[:12]}"

def generate_page_id():
    return f"page_{uuid.uuid4().hex[:12]}"

def generate_comment_id():
    return f"com_{uuid.uuid4().hex[:12]}"

def generate_menu_id():
    return f"menu_{uuid.uuid4().hex[:12]}"

def generate_menu_item_id():
    return f"mi_{uuid.uuid4().hex[:12]}"

def generate_setting_id():
    return f"set_{uuid.uuid4().hex[:12]}"

def generate_activity_log_id():
    return f"act_{uuid.uuid4().hex[:12]}"

def generate_notification_id():
    return f"notif_{uuid.uuid4().hex[:12]}"

def generate_ad_id():
    return f"ad_{uuid.uuid4().hex[:12]}"

def generate_newsletter_id():
    return f"sub_{uuid.uuid4().hex[:12]}"

def generate_video_id():
    return f"vid_{uuid.uuid4().hex[:12]}"

def generate_otp_id():
    return f"otp_{uuid.uuid4().hex[:12]}"

def default_focal_point():
    return {"x": 50, "y": 50}
