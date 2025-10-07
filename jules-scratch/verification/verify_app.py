import re
from playwright.sync_api import sync_playwright, Page, expect

def test_full_app_flow(page: Page):
    # 1. Start at the login page
    page.goto("http://localhost:5173/login")

    # 2. Login
    # Use a more specific locator for username if needed
    page.locator('input[name="username"]').fill("testuser")
    page.locator('input[name="password"]').fill("password")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the dashboard
    expect(page).to_have_url(re.compile(r".*/dashboard/board"))

    # 3. Create a new task
    page.get_by_role("button", name="Add New Task").click()

    # Wait for the dialog to appear
    expect(page.get_by_role("heading", name="Add New Task")).to_be_visible()

    page.get_by_label("Title").fill("My New Test Task")
    page.get_by_label("Description").fill("This is a description for the test task.")
    page.get_by_role("button", name="Add Task").click()

    # 4. Verify the task was created
    expect(page.get_by_text("My New Test Task")).to_be_visible()
    expect(page.get_by_text("This is a description for the test task.")).to_be_visible()

    # 5. Take a screenshot
    print("Taking screenshot...")
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot taken and saved to jules-scratch/verification/verification.png")

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        test_full_app_flow(page)
        browser.close()

if __name__ == "__main__":
    run()