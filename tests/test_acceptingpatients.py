from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def get_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Run in headless mode (optional)
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(options=options)
    return driver

def test_login_and_navigate_to_main_page():
    driver = get_driver()

    try:
        print("Navigating to login page...")
        driver.get("http://localhost:3000/login")

        # Wait for the page to load by checking if the login button is available
        wait = WebDriverWait(driver, 30)
        login_button = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "loginBtn")))

        print("Login button found. Entering credentials...")

        # Locate and fill the email and password
        email_input = driver.find_element(By.CLASS_NAME, "email-input")
        password_input = driver.find_element(By.CLASS_NAME, "password-input")
        email_input.send_keys("unregistered.email@example.com")
        password_input.send_keys("password123")

        # Click the login button
        login_button.click()

        # Wait for the page to load after clicking login (e.g., by checking for an element on the next page)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "selectable-tab")))

        print("Login successful, navigating to the main page...")

        # Now click on the "MentCare" logo (now identified by the class "selectable-tab")
        logo = driver.find_element(By.CLASS_NAME, "selectable-tab")
        logo.click()

        # Wait for the main page to load (adjust this to check for a specific element)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "main-page-element")))

        print("Main page loaded successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        driver.quit()
