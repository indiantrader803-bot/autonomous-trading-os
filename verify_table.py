from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1200})
    page.goto("http://localhost:3000")
    page.wait_for_timeout(5000)
    btn = page.locator("button", has_text="ACTIVE POSITIONS").first
    print("BUTTON TEXT:", btn.inner_text())
    rows = page.locator("table tbody tr")
    print("ROW COUNT:", rows.count())
    for i in range(min(rows.count(), 10)):
        print("ROW:", rows.nth(i).inner_text().replace('\n', ' | '))
    page.screenshot(path="C:/Users/karth/.gemini/antigravity/brain/47bf32b0-eba1-41f7-8b2f-f2fb62ba9b7c/real_table_verified.png", full_page=True)
    browser.close()
