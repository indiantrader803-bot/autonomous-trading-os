from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1200})
    page.goto("http://localhost:3000/admin")
    page.wait_for_timeout(6000)
    tables = page.locator("table")
    print("TABLES FOUND IN ADMIN:", tables.count())
    for t_idx in range(tables.count()):
        rows = tables.nth(t_idx).locator("tbody tr")
        print(f"TABLE {t_idx} ROW COUNT: {rows.count()}")
        for r_idx in range(min(rows.count(), 5)):
            print(f"  T{t_idx} R{r_idx}:", rows.nth(r_idx).inner_text().replace('\n', ' | '))
    browser.close()
