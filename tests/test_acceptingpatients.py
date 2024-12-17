from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

# Set Chrome options
chrome_options = Options()
chrome_options.binary_location = "/usr/bin/google-chrome"  # Path to Chrome installed in Docker

# Set up ChromeDriver path manually (it should already be installed in the container)
service = Service("/usr/local/bin/chromedriver")  # ChromeDriver path installed in Docker

# Set up the WebDriver
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    driver.get("http://localhost:3000/login")
    wait = WebDriverWait(driver, 15)

    # Execute script
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

    email_input = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "email-input")))
    email_input.send_keys("linda.white@example.com")
    
    password_input = driver.find_element(By.CLASS_NAME, "password-input")
    password_input.send_keys("password123")

    login_button = driver.find_element(By.CLASS_NAME, "loginBtn")
    login_button.click()
    wait.until(EC.url_contains("/dashboard"))
    print("Login successful, now on the dashboard.")

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
