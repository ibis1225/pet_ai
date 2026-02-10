"""
LINE Rich Menu Handler

Creates and manages the LINE Rich Menu for the PetAI chatbot.
6-button premium layout matching the existing chatbot design.
Buttons: 이벤트, 협력사, 상담하기, App 설치, 홈페이지, 문의하기
"""

from linebot.v3.messaging import (
    ApiClient,
    Configuration,
    MessagingApi,
    PostbackAction,
    RichMenuArea,
    RichMenuBounds,
    RichMenuRequest,
    RichMenuSize,
    URIAction,
)

from app.config import settings

# Rich Menu layout (2x3 grid) - matches 2_create_rich_menu_premium.py
RICH_MENU_LAYOUT = {
    "size": {"width": 2500, "height": 1686},
    "areas": [
        # Top row
        {
            "label": "이벤트",
            "bounds": {"x": 0, "y": 0, "width": 833, "height": 843},
            "action": {
                "type": "postback",
                "data": "action=event",
                "displayText": "이벤트",
            },
        },
        {
            "label": "협력사",
            "bounds": {"x": 833, "y": 0, "width": 834, "height": 843},
            "action": {
                "type": "postback",
                "data": "action=partner",
                "displayText": "협력사",
            },
        },
        {
            "label": "상담하기",
            "bounds": {"x": 1667, "y": 0, "width": 833, "height": 843},
            "action": {
                "type": "postback",
                "data": "action=consultation",
                "displayText": "상담하기",
            },
        },
        # Bottom row
        {
            "label": "App 설치",
            "bounds": {"x": 0, "y": 843, "width": 833, "height": 843},
            "action": {
                "type": "postback",
                "data": "action=app",
                "displayText": "App 설치",
            },
        },
        {
            "label": "홈페이지",
            "bounds": {"x": 833, "y": 843, "width": 834, "height": 843},
            "action": {
                "type": "uri",
                "uri": "https://petai.app",
            },
        },
        {
            "label": "문의하기",
            "bounds": {"x": 1667, "y": 843, "width": 833, "height": 843},
            "action": {
                "type": "postback",
                "data": "action=inquiry",
                "displayText": "문의하기",
            },
        },
    ],
}


async def create_rich_menu() -> str | None:
    """Create and set the default rich menu for the LINE bot."""
    configuration = Configuration(
        access_token=settings.LINE_CHANNEL_ACCESS_TOKEN
    )
    api_client = ApiClient(configuration)
    messaging_api = MessagingApi(api_client)

    areas = []
    for area_config in RICH_MENU_LAYOUT["areas"]:
        b = area_config["bounds"]
        a = area_config["action"]

        if a["type"] == "postback":
            action = PostbackAction(
                label=area_config["label"],
                data=a["data"],
                display_text=a.get("displayText"),
            )
        elif a["type"] == "uri":
            action = URIAction(
                label=area_config["label"],
                uri=a["uri"],
            )
        else:
            continue

        areas.append(
            RichMenuArea(
                bounds=RichMenuBounds(
                    x=b["x"], y=b["y"], width=b["width"], height=b["height"]
                ),
                action=action,
            )
        )

    rich_menu_request = RichMenuRequest(
        size=RichMenuSize(width=2500, height=1686),
        selected=True,
        name="Pet AI Premium Menu",
        chat_bar_text="메뉴",
        areas=areas,
    )

    try:
        result = messaging_api.create_rich_menu(rich_menu_request)
        rich_menu_id = result.rich_menu_id
        messaging_api.set_default_rich_menu(rich_menu_id)
        print(f"Rich menu created: {rich_menu_id}")
        return rich_menu_id
    except Exception as e:
        print(f"Failed to create rich menu: {e}")
        return None


async def delete_all_rich_menus() -> None:
    """Delete all existing rich menus."""
    configuration = Configuration(
        access_token=settings.LINE_CHANNEL_ACCESS_TOKEN
    )
    api_client = ApiClient(configuration)
    messaging_api = MessagingApi(api_client)

    try:
        result = messaging_api.get_rich_menu_list()
        for menu in result.richmenus:
            messaging_api.delete_rich_menu(menu.rich_menu_id)
            print(f"Deleted rich menu: {menu.rich_menu_id}")
    except Exception as e:
        print(f"Failed to delete rich menus: {e}")
