from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Set Chrome options
chrome_options = Options()
chrome_options.binary_location = "/usr/bin/chromium-browser"  # Use Chromium binary
chrome_options.add_argument("--headless")  # Run headless
chrome_options.add_argument("--no-sandbox")  # Disable sandboxing for CI environments
chrome_options.add_argument("--disable-dev-shm-usage")  # Solve issues with /dev/shm

# Set up ChromeDriver using webdriver-manager
service = Service(ChromeDriverManager().install())  # Automatically install and manage chromedriver

# Set up the WebDriver
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    driver.get("http://localhost:3000/login")
    wait = WebDriverWait(driver, 15)

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
    email_input = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "email-input")))
    email_input.send_keys("linda.white@example.com")
    
    password_input = driver.find_element(By.CLASS_NAME, "password-input")
    password_input.send_keys("password123")

    login_button = driver.find_element(By.CLASS_NAME, "loginBtn")
    login_button.click()
    wait.until(EC.url_contains("/dashboard"))
    print("Login successful, now on the dashboard.")

    # Acceptance button interaction
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
