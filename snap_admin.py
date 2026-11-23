from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1200})
    page.goto("http://localhost:3000/admin")
    page.wait_for_timeout(6000)
    page.screenshot(path="C:/Users/karth/.gemini/antigravity/brain/47bf32b0-eba1-41f7-8b2f-f2fb62ba9b7c/admin_check_updated.png", full_page=True)
    browser.close()
print("Captured admin_check_updated.png successfully")
