from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000')
    script = """
    async () => {
        try {
            const r = await fetch("http://localhost:8000/api/v1/positions");
            return await r.json();
        } catch (e) {
            return { error: e.toString() };
        }
    }
    """
    res = page.evaluate(script)
    print("BROWSER FETCH RESULT:", json.dumps(res, indent=2))
    browser.close()
