import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('http://localhost:3000', wait_until='networkidle')
        await asyncio.sleep(4)
        await page.screenshot(path=r'C:\Users\karth\.gemini\antigravity\brain\47bf32b0-eba1-41f7-8b2f-f2fb62ba9b7c\live_ui_verified.png', full_page=True)
        await browser.close()

asyncio.run(main())