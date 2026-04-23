#!/usr/bin/env python3
"""
Generate real AI images for all 30 articles using OpenAI DALL-E 3
and upload to Bunny CDN as WebP.
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from io import BytesIO
from PIL import Image

# Config
BUNNY_STORAGE_ZONE = "kundalini-crisis"
BUNNY_HOSTNAME = "ny.storage.bunnycdn.com"
BUNNY_PASSWORD = "17cc449c-3cfb-4518-99b409b7dc19-6d59-44e6"
BUNNY_CDN_URL = "https://kundalini-crisis.b-cdn.net"
ARTICLES_DIR = Path("/home/ubuntu/kundalini-crisis/src/data/articles")
OUTPUT_DIR = Path("/tmp/kundalini-images")
OUTPUT_DIR.mkdir(exist_ok=True)

# OpenAI setup
from openai import OpenAI
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
)

# Article-specific image prompts
IMAGE_PROMPTS = {
    "spiritual-emergency-vs-mental-illness-how-to-tell-the-difference": 
        "A human figure standing at a crossroads in deep space, one path glowing with warm golden light representing spiritual awakening, the other path in clinical white light representing medical care. Dark cosmic background with nebula. Cinematic, mystical, photorealistic.",
    
    "what-is-a-kundalini-crisis-and-why-nobody-warned-you":
        "A human silhouette with a glowing serpentine energy rising up the spine, coiling upward in gold and violet light against a deep dark background. The figure appears overwhelmed but luminous. Dramatic, spiritual, photorealistic.",
    
    "the-dark-night-of-the-soul-is-not-a-metaphor-its-a-process":
        "A lone figure sitting in absolute darkness, but with a faint dawn light beginning to emerge on the horizon. The scene is both desolate and hopeful. Cinematic, moody, dark with subtle gold light. Photorealistic.",
    
    "when-meditation-breaks-you-adverse-effects-nobody-talks-about":
        "A person sitting in lotus position but surrounded by chaotic energy waves, lightning, and swirling dark matter. Their face shows distress. Deep dark background with electric blue and violet energy. Dramatic, photorealistic.",
    
    "depersonalization-after-spiritual-practice-youre-not-crazy":
        "A translucent human figure looking at their own hands in confusion, with reality seeming to dissolve around them. Mirror reflections that don't quite match. Dark, ethereal, dreamlike. Photorealistic.",
    
    "stanislav-grofs-framework-for-non-ordinary-states-of-consciousness":
        "A mandala-like diagram of consciousness states, with a human figure at center surrounded by concentric rings of different states of awareness. Sacred geometry, dark background, gold and violet tones. Mystical, detailed.",
    
    "how-to-find-a-therapist-who-understands-spiritual-emergency":
        "Two figures in a therapy room, one clearly in distress with visible energy patterns around them, the therapist calm and understanding. Warm light in an otherwise dark room. Hopeful, intimate. Photorealistic.",
    
    "the-somatic-experience-of-spiritual-awakening-tremors-heat-involuntary-movement":
        "A human body diagram showing energy pathways lit up in gold and fire, with visible heat waves and electrical patterns. The body appears to be vibrating with intense energy. Dark background, scientific-mystical aesthetic.",
    
    "why-your-friends-and-family-think-youre-losing-it":
        "A person surrounded by concerned but confused faces of family members, with the central figure glowing with inner light that others cannot see. Social isolation in spiritual awakening. Cinematic, emotional. Photorealistic.",
    
    "emergency-grounding-practices-when-awakening-gets-too-intense":
        "Bare feet on dark earth, with roots growing from the feet deep into the ground. Golden energy flowing downward from the body into the earth. Grounding, stabilizing, powerful. Dark background with earth tones.",
    
    "integration-after-spiritual-emergency-the-long-road-back":
        "A winding path through a dark forest gradually opening to light, with a figure walking forward. Behind them, fragments of their old life. Ahead, new growth. Journey, transformation. Cinematic, photorealistic.",
    
    "post-awakening-depression-when-the-fireworks-end-and-youre-still-here":
        "A figure sitting in the aftermath of a spiritual experience, surrounded by fading light and embers. The ecstasy has passed. They look contemplative and slightly lost. Dark, moody, honest. Photorealistic.",
    
    "psychedelics-and-spiritual-emergency-when-the-trip-doesnt-end":
        "A person trapped in a psychedelic vision that won't end, with fractal patterns and geometric shapes surrounding them. Their expression is exhausted rather than ecstatic. Dark, intense. Photorealistic.",
    
    "breathwork-induced-crisis-when-holotropic-goes-wrong":
        "A person doing breathwork surrounded by overwhelming energy and light that has become too intense. Their body is arched, energy visible. Dark room, dramatic lighting. Photorealistic.",
    
    "ayahuasca-aftershock-integration-when-the-ceremony-goes-deep":
        "A person sitting in the jungle at dawn after a ceremony, integrating profound visions. Jungle plants, morning mist, a fire dying down. Peaceful but heavy. Cinematic, photorealistic.",
    
    "sleep-disruption-during-spiritual-emergency-and-how-to-survive-it":
        "A person lying awake at 3am with glowing energy patterns visible around them, unable to sleep. The room is dark, moonlight through a window. Exhausted but energetically activated. Photorealistic.",
    
    "the-nervous-system-during-awakening-polyvagal-theory-meets-kundalini":
        "An anatomical illustration of the nervous system overlaid with kundalini energy channels. Scientific and mystical combined. The vagus nerve glowing. Dark background, gold and blue tones.",
    
    "the-relationship-between-trauma-and-spontaneous-awakening":
        "A cracked open heart revealing light inside, with trauma represented as dark fractures that have become channels for light. Powerful, healing, complex. Dark background, gold light. Photorealistic.",
    
    "the-difference-between-ego-death-and-depression":
        "Split image: one side showing ego dissolution as transcendent light, the other showing clinical depression as heavy darkness. A figure experiencing both simultaneously. Nuanced, complex. Cinematic.",
    
    "the-history-of-spiritual-emergency-from-shamanic-initiation-to-dsm-diagnosis":
        "A timeline visualization from ancient shamanic figures to modern medical settings, showing the same experience across cultures. Cave paintings to hospital rooms. Dark, historical, powerful.",
    
    "supplements-and-herbs-for-nervous-system-stabilization-during-crisis":
        "Medicinal herbs and supplements arranged on a dark surface with soft golden light. Ashwagandha, magnesium, lavender. Calming, grounding aesthetic. Dark background, warm tones. Photorealistic.",
    
    "tcm-and-spiritual-emergency-liver-fire-heart-shen-disturbance-and-kidney-depletion":
        "Traditional Chinese medicine meridian map overlaid with kundalini energy channels. Ancient wisdom meets modern crisis. Dark background, red and gold tones. Mystical, detailed.",
    
    "the-difference-between-spiritual-emergency-and-spiritual-bypassing":
        "Two paths diverging: one person genuinely struggling through darkness, another floating above it in denial. The contrast between authentic transformation and avoidance. Dark, honest. Cinematic.",
    
    "the-other-side-what-life-looks-like-after-spiritual-emergency":
        "A person standing on the other side of a great transformation, looking back at the darkness they came through. They are changed, quieter, wiser. Dawn light. Hopeful, earned. Photorealistic.",
    
    "the-role-of-community-and-why-isolation-makes-everything-worse":
        "A circle of people sitting together in darkness, each with their own inner light. Community, belonging, shared experience. Warm candlelight. Intimate, healing. Photorealistic.",
    
    "when-to-go-to-the-emergency-room-and-when-not-to":
        "A hospital emergency room entrance at night, with a person standing at the threshold, uncertain. The clinical and the spiritual in tension. Dark, decisive moment. Photorealistic.",
    
    "why-western-psychiatry-pathologizes-spiritual-experience":
        "A DSM book open next to sacred texts, with a figure caught between them. Medical labels floating around a person having a genuine spiritual experience. Dark, critical, powerful.",
    
    "kundalini-syndrome-symptoms-duration-and-what-actually-helps":
        "A detailed anatomical chart of kundalini symptoms mapped to the body, with energy channels and chakra points. Clinical meets mystical. Dark background, gold and violet tones.",
    
    "how-to-journal-your-way-through-spiritual-emergency":
        "An open journal with handwritten words glowing with golden light, surrounded by darkness. The act of writing as survival. Intimate, warm light in darkness. Photorealistic.",
    
    "how-to-support-someone-in-spiritual-crisis":
        "One person gently holding another who is in distress, with visible energy patterns around the person in crisis. The supporter is calm and grounded. Warm, intimate, dark background. Photorealistic.",
}

# Default prompt for any missing articles
DEFAULT_PROMPT = "A human figure experiencing spiritual awakening in darkness, with golden and violet energy surrounding them. Mystical, cinematic, dark background. Photorealistic."

def generate_image(slug: str, prompt: str) -> bytes | None:
    """Generate image using OpenAI DALL-E 3"""
    full_prompt = f"{prompt} Style: dark mystical aesthetic, deep dark background (#0D1117), gold (#E8A838) and violet (#6B3FA0) accent colors, cinematic lighting, no text, no watermarks."
    
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=full_prompt,
            size="1792x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        img_response = requests.get(image_url, timeout=30)
        return img_response.content
    except Exception as e:
        print(f"  [ERROR] DALL-E generation failed for {slug}: {e}")
        return None

def convert_to_webp(image_data: bytes, max_size: int = 180 * 1024) -> bytes:
    """Convert image to WebP and compress to under max_size"""
    img = Image.open(BytesIO(image_data))
    # Resize to 1200x675 (16:9)
    img = img.resize((1200, 675), Image.LANCZOS)
    
    # Try different quality levels
    for quality in [85, 75, 65, 55]:
        buffer = BytesIO()
        img.save(buffer, format='WEBP', quality=quality, method=6)
        data = buffer.getvalue()
        if len(data) <= max_size:
            return data
    
    # Last resort: very low quality
    buffer = BytesIO()
    img.save(buffer, format='WEBP', quality=40, method=6)
    return buffer.getvalue()

def upload_to_bunny(slug: str, webp_data: bytes) -> bool:
    """Upload WebP image to Bunny CDN"""
    url = f"https://{BUNNY_HOSTNAME}/{BUNNY_STORAGE_ZONE}/images/articles/{slug}.webp"
    headers = {
        "AccessKey": BUNNY_PASSWORD,
        "Content-Type": "image/webp",
    }
    try:
        response = requests.put(url, data=webp_data, headers=headers, timeout=30)
        return response.status_code in (200, 201)
    except Exception as e:
        print(f"  [ERROR] Upload failed for {slug}: {e}")
        return False

def main():
    articles = list(ARTICLES_DIR.glob("*.json"))
    print(f"Processing {len(articles)} articles...")
    
    success = 0
    failed = []
    
    for i, article_path in enumerate(articles):
        slug = article_path.stem
        prompt = IMAGE_PROMPTS.get(slug, DEFAULT_PROMPT)
        
        print(f"\n[{i+1}/{len(articles)}] {slug}")
        print(f"  Generating image...")
        
        # Generate image
        image_data = generate_image(slug, prompt)
        if not image_data:
            failed.append(slug)
            continue
        
        # Convert to WebP
        print(f"  Converting to WebP...")
        webp_data = convert_to_webp(image_data)
        print(f"  Size: {len(webp_data)/1024:.1f}KB")
        
        # Save locally
        local_path = OUTPUT_DIR / f"{slug}.webp"
        local_path.write_bytes(webp_data)
        
        # Upload to Bunny
        print(f"  Uploading to Bunny CDN...")
        if upload_to_bunny(slug, webp_data):
            print(f"  ✓ Done: {BUNNY_CDN_URL}/images/articles/{slug}.webp")
            success += 1
        else:
            failed.append(slug)
        
        # Rate limit: DALL-E 3 allows ~5 images/min on standard tier
        if i < len(articles) - 1:
            time.sleep(13)
    
    print(f"\n{'='*60}")
    print(f"Complete: {success}/{len(articles)} images generated and uploaded")
    if failed:
        print(f"Failed: {failed}")

if __name__ == "__main__":
    main()
