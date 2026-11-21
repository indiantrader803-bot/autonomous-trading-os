from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 900})
    page.goto("http://localhost:3000", wait_until="domcontentloaded", timeout=15000)
    page.wait_for_timeout(4000)
    page.screenshot(path="C:/Users/karth/.gemini/antigravity/brain/47bf32b0-eba1-41f7-8b2f-f2fb62ba9b7c/real_positions_verified.png", full_page=True)
    browser.close()
print("Captured real positions screenshot successfully")
