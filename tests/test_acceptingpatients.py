import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time

def get_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.binary_location = "/usr/bin/google-chrome"

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def test_accepting_patients():
    driver = get_driver()
    
    try:
        print("Navigating to login page...")
        driver.get("http://frontend:3000/login")
        wait = WebDriverWait(driver, 30)

        # Execute script to show feature indicator
        script = """
        var testMessage = document.createElement('div');
        testMessage.innerText = "<div>FEATURE #8: ACCEPTING PATIENTS INDICATOR</div>";
        testMessage.style.position = "fixed";
        testMessage.style.bottom = "10px";
        testMessage.style.left = "10px";
        testMessage.style.backgroundColor = "yellow";
        testMessage.style.color = "black";
        testMessage.style.zIndex = "9999";
        testMessage.style.padding = "10px";
        testMessage.style.fontSize = "16pt";
        document.body.appendChild(testMessage);
        """
        driver.execute_script(script)

        # Find and interact with login form elements
        print("Locating email input...")
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        print("Email input found. Entering email...")
        email_input.send_keys("linda.white@example.com")
        
        print("Locating password input...")
        password_input = driver.find_element(By.NAME, "password")
        print("Password input found. Entering password...")
        password_input.send_keys("password123")

        print("Locating login button...")
        login_button = driver.find_element(By.TAG_NAME, "button")
        print("Login button found. Clicking login button...")
        login_button.click()
        
        print("Current URL: ", driver.current_url)
        time.sleep(5)  # Pause to observe any changes

        # Wait for an element on the dashboard to ensure login was successful
        print("Waiting for dashboard element...")
        try:
            dashboard_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "dashboard-indicator")))
            print("Login successful, now on the dashboard.")
        except TimeoutException:
            print("Dashboard element not found. Capturing page source for debugging.")
            with open("page_source.html", "w") as file:
                file.write(driver.page_source)
            raise

        # Acceptance button interaction
        print("Locating acceptance button...")
        acceptance_btn = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "acceptanceBtn")))
        print("Acceptance button found. Clicking acceptance button...")
        acceptance_btn.click()
        time.sleep(2)
        print("Clicking acceptance button again...")
        acceptance_btn.click()

    finally:
        try:
            driver.quit()
        except Exception as e:
            print(f"Error while quitting the driver: {e}")
        print("Program ended.")

# Run the test
if __name__ == "__main__":
    test_accepting_patients()
