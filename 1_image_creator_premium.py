from PIL import Image, ImageDraw, ImageFont

# 2x3 레이아웃
width = 2500
height = 1686
img = Image.new('RGB', (width, height), color='white')
draw = ImageDraw.Draw(img)

cell_width = width // 3
cell_height = height // 2

# 프리미엄 색상 팔레트 (그라데이션 효과)
colors = [
    ['#667EEA', '#764BA2', '#F093FB'],  # 보라 → 핑크
    ['#4FACFE', '#00F2FE', '#43E97B']  # 파랑 → 청록 → 초록
]

# 메뉴 텍스트
menus = [
    [
        {'emoji': '🎁', 'text': '이벤트'},
        {'emoji': '🤝', 'text': '협력사'},
        {'emoji': '📋', 'text': '상담하기'}
    ],
    [
        {'emoji': '📱', 'text': 'App 설치'},
        {'emoji': '🌐', 'text': '홈페이지'},
        {'emoji': '💬', 'text': '문의하기'}
    ]
]

# 폰트 설정
try:
    font_emoji = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", 180)  # 이모지
    font_text = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 100)  # 한글 (굵게)
except:
    try:
        font_emoji = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", 180)
        font_text = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 100)
    except:
        font_emoji = ImageFont.load_default()
        font_text = ImageFont.load_default()

# 각 셀 그리기
for row in range(2):
    for col in range(3):
        x_start = col * cell_width
        y_start = row * cell_height
        x_end = x_start + cell_width
        y_end = y_start + cell_height

        # 배경색
        color = colors[row][col]
        draw.rectangle([x_start, y_start, x_end, y_end], fill=color)

        # 경계선 (흰색)
        if col < 2:
            draw.line([x_end, y_start, x_end, y_end], fill='white', width=8)
        if row < 1:
            draw.line([x_start, y_end, x_end, y_end], fill='white', width=8)

        # 메뉴 내용
        menu = menus[row][col]
        emoji = menu['emoji']
        text = menu['text']

        # 이모지 (상단)
        emoji_bbox = draw.textbbox((0, 0), emoji, font=font_emoji)
        emoji_width = emoji_bbox[2] - emoji_bbox[0]
        emoji_x = x_start + (cell_width - emoji_width) // 2
        emoji_y = y_start + cell_height // 4
        draw.text((emoji_x, emoji_y), emoji, font=font_emoji, embedded_color=True)

        # 텍스트 (하단)
        text_bbox = draw.textbbox((0, 0), text, font=font_text)
        text_width = text_bbox[2] - text_bbox[0]
        text_x = x_start + (cell_width - text_width) // 2
        text_y = y_start + cell_height * 3 // 5

        # 텍스트 그림자 효과
        shadow_offset = 3
        draw.text((text_x + shadow_offset, text_y + shadow_offset), text, fill='#00000040', font=font_text)
        # 실제 텍스트
        draw.text((text_x, text_y), text, fill='white', font=font_text)

img.save('rich_menu_premium.png', 'PNG')
print("=" * 60)
print("✅ 프리미엄 Rich Menu 이미지 생성 완료!")
print("=" * 60)
print(f"📏 크기: {width}x{height} 픽셀")
print(f"🎨 그라데이션 색상 적용")
print(f"✨ 이모지 + 한글 텍스트")
print(f"💎 그림자 효과 추가")
print("=" * 60)
print("\n다음 단계: python create_rich_menu_premium.py")