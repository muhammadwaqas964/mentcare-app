import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def get_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

def test_register_if_user_not_found():
    FRONTEND_URL = "http://localhost:3000"
    driver = get_driver()

    try:
        print("Navigating to login page...")
        driver.get(f"{FRONTEND_URL}/login")
        wait = WebDriverWait(driver, 120)  # Increased timeout to 120 seconds

        print("Locating email input...")
        email_input = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "email-input")))
        email_input.send_keys("unregistered.email@example.com")

        print("Locating password input...")
        password_input = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "password-input")))
        password_input.send_keys("password123")

        print("Locating login button...")
        login_button = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "loginBtn")))
        login_button.click()

        print("Waiting for feedback...")
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Invalid credentials')]")))

    finally:
        driver.quit()

if __name__ == "__main__":
    pytest.main()
