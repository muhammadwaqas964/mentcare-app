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
        driver.get("http://frontend:3000/login")
        wait = WebDriverWait(driver, 30)

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

        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        email_input.send_keys("linda.white@example.com")
        
        password_input = driver.find_element(By.NAME, "password")
        password_input.send_keys("password123")

        login_button = driver.find_element(By.TAG_NAME, "button")
        login_button.click()
        
        time.sleep(5)

        try:
            dashboard_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "dashboard-indicator")))
        except TimeoutException:
            with open("page_source.html", "w") as file:
                file.write(driver.page_source)
            raise

        acceptance_btn = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "acceptanceBtn")))
        acceptance_btn.click()
        time.sleep(2)
        acceptance_btn.click()

    finally:
        try:
            driver.quit()
        except Exception as e:
            print(f"Error while quitting the driver: {e}")
        print("Program ended.")

if __name__ == "__main__":
    test_accepting_patients()
