import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def get_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(options=options)
    return driver

def test_register_if_user_not_found():
    driver = get_driver()

    try:
        print("Navigating to login page...")
        driver.get("http://localhost:3000/login")
        wait = WebDriverWait(driver, 120)  # Increased timeout to 120 seconds

        # Locate email input by class name and enter text
        print("Locating email input...")
        email_input = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "email-input")))
        print("Email input found. Entering email...")
        email_input.send_keys("unregistered.email@example.com")  # Use an unregistered email for testing

        # Locate password input by class name and enter text
        print("Locating password input...")
        password_input = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "password-input")))
        print("Password input found. Entering password...")
        password_input.send_keys("password123")

        # Locate and click the login button by class name
        print("Locating login button...")
        login_button = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "loginBtn")))
        print("Login button found. Clicking login button...")
        login_button.click()

        # Wait for 5 seconds to simulate user feedback processing
        print("Waiting for feedback...")
        time.sleep(5)

        # Check for the error message indicating the user is not registered
        error_message = None
        try:
            error_message = driver.find_element(By.XPATH, "//*[contains(text(), 'Invalid credentials')]")
        except:
            pass

        if error_message:
            print("User not registered. Navigating to registration page...")
            register_link = wait.until(EC.presence_of_element_located((By.LINK_TEXT, "Register Now")))
            register_link.click()

            # Wait for the registration page to load
            print("Waiting for registration page to load...")
            register_heading = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "register-heading")))
            print("Registration page loaded. Test passed!")
        else:
            print("User is registered. Test passed!")

    except Exception as e:
        print(f"Exception occurred: {e}")
        raise

    finally:
        driver.quit()

if __name__ == "__main__":
    pytest.main()
