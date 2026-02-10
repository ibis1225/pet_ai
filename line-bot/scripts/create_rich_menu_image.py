#!/usr/bin/env python3
"""
Rich Menu Image Creator

Creates a 2500x1686 premium rich menu image for LINE bot.
Based on the existing chatbot's image creation approach.

Usage:
    python create_rich_menu_image.py
"""

from PIL import Image, ImageDraw, ImageFont
import os


def create_gradient(width: int, height: int, start_color: tuple, end_color: tuple) -> Image.Image:
    """Create a vertical gradient image."""
    base = Image.new("RGB", (width, height), start_color)
    top = Image.new("RGB", (width, height), end_color)
    mask = Image.new("L", (width, height))

    for y in range(height):
        mask_value = int(255 * (y / height))
        for x in range(width):
            mask.putpixel((x, y), mask_value)

    return Image.composite(top, base, mask)


def create_rich_menu_image(output_path: str = "rich_menu.png") -> None:
    """Create the rich menu image."""
    # Dimensions (LINE rich menu large size)
    width = 2500
    height = 1686
    cell_width = width // 3
    cell_height = height // 2

    # Create base image
    img = Image.new("RGB", (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Menu items with colors - matches 1_image_creator_premium.py layout
    menu_items = [
        # Row 1: 이벤트, 협력사, 상담하기
        {
            "title": "이벤트",
            "emoji": "🎁",
            "start_color": (102, 126, 234),
            "end_color": (72, 96, 194),
        },
        {
            "title": "협력사",
            "emoji": "🤝",
            "start_color": (118, 75, 162),
            "end_color": (88, 55, 132),
        },
        {
            "title": "상담하기",
            "emoji": "📋",
            "start_color": (240, 147, 251),
            "end_color": (200, 117, 221),
        },
        # Row 2: App 설치, 홈페이지, 문의하기
        {
            "title": "App 설치",
            "emoji": "📱",
            "start_color": (79, 172, 254),
            "end_color": (49, 142, 224),
        },
        {
            "title": "홈페이지",
            "emoji": "🌐",
            "start_color": (0, 242, 254),
            "end_color": (0, 192, 204),
        },
        {
            "title": "문의하기",
            "emoji": "💬",
            "start_color": (67, 233, 123),
            "end_color": (47, 193, 93),
        },
    ]

    # Try to load a Korean font
    font_paths = [
        "/usr/share/fonts/truetype/noto/NotoSansKR-Bold.otf",
        "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf",
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "C:/Windows/Fonts/malgun.ttf",
    ]

    font = None
    emoji_font = None
    for path in font_paths:
        if os.path.exists(path):
            try:
                font = ImageFont.truetype(path, 60)
                emoji_font = ImageFont.truetype(path, 120)
                break
            except Exception:
                continue

    if font is None:
        font = ImageFont.load_default()
        emoji_font = font

    # Draw each cell
    for idx, item in enumerate(menu_items):
        row = idx // 3
        col = idx % 3

        x = col * cell_width
        y = row * cell_height

        # Create gradient cell
        gradient = create_gradient(
            cell_width, cell_height,
            item["start_color"], item["end_color"]
        )
        img.paste(gradient, (x, y))

        # Draw border
        draw.rectangle(
            [x, y, x + cell_width - 1, y + cell_height - 1],
            outline=(255, 255, 255, 128),
            width=2,
        )

        # Draw emoji
        emoji_bbox = draw.textbbox((0, 0), item["emoji"], font=emoji_font)
        emoji_width = emoji_bbox[2] - emoji_bbox[0]
        emoji_x = x + (cell_width - emoji_width) // 2
        emoji_y = y + cell_height // 2 - 120
        draw.text((emoji_x, emoji_y), item["emoji"], font=emoji_font, fill=(255, 255, 255))

        # Draw title
        title_bbox = draw.textbbox((0, 0), item["title"], font=font)
        title_width = title_bbox[2] - title_bbox[0]
        title_x = x + (cell_width - title_width) // 2
        title_y = y + cell_height // 2 + 40
        draw.text((title_x, title_y), item["title"], font=font, fill=(255, 255, 255))

    # Save image
    img.save(output_path, "PNG")
    print(f"Rich menu image saved to: {output_path}")


if __name__ == "__main__":
    create_rich_menu_image()
