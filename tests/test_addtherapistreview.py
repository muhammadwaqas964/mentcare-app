from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
import time

service = Service("./chromedriver-win64/chromedriver.exe")
driver = webdriver.Chrome(service=service)

try:
    driver.get("http://localhost:3000/login")
    wait = WebDriverWait(driver, 15)

    script = """
    var testMessage = document.createElement('div');
    testMessage.innerText = "FEATURE #4: SEARCH THERAPIST AND ADD/REMOVE THERAPIST (Linda White)";
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
    email_input.send_keys("john.smith@example.com")
    time.sleep(1)
    
    password_input = driver.find_element(By.CLASS_NAME, "password-input")
    password_input.send_keys("password123")
    time.sleep(1)

    login_button = driver.find_element(By.CLASS_NAME, "loginBtn")
    login_button.click()
    wait.until(EC.url_contains("/dashboard"))
    print("Login successful, now on the dashboard.")
    time.sleep(1) 

    driver.get("http://localhost:3000/therapistlist") 
    time.sleep(1)

    search_input = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "search-therapists-input")))
    search_input.send_keys("Linda White")
    time.sleep(3)

    buttons = driver.find_elements(By.XPATH, "//button[text()='View Profile']")
    visible_button = None
    for button in buttons:
        if button.is_displayed():
            visible_button = button
            break
    visible_button.click()
    time.sleep(1)

    wait.until(EC.url_contains("/therapistProfile"))
    time.sleep(3)

    buttons = driver.find_elements(By.CLASS_NAME, "td-btn")
    review_button = None
    for button in buttons:
        if button.is_displayed() and button.text.strip() == "ADD REVIEW":
            review_button = button
            break
    review_button.click()
    time.sleep(2)

    textarea = driver.find_element(By.CSS_SELECTOR, "div.popUp-background textarea")
    textarea.send_keys("Linda White is a great therapist!")
    time.sleep(1)

    star_input = driver.find_element(By.XPATH, "//input[@name='userReviewRating' and @value='5']")
    star_input.click()
    time.sleep(1)

    send_review_button = driver.find_element(By.XPATH, "//input[@type='submit' and @value='Send Review']")
    send_review_button.click()
    time.sleep(3)

    driver.get("http://localhost:3000/therapistlist")

    search_input = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "search-therapists-input")))
    search_input.send_keys("Linda White")
    time.sleep(1)

    buttons = driver.find_elements(By.XPATH, "//button[text()='View Profile']")
    visible_button = None
    for button in buttons:
        if button.is_displayed():
            visible_button = button
            break
    visible_button.click()
    time.sleep(1)

    wait.until(EC.url_contains("/therapistProfile"))
    time.sleep(3)
    
    pagination_button = driver.find_element(By.XPATH, "//input[@class='MuiPaginationItem-root' and @value='5']")
    ActionChains(driver).move_to_element(pagination_button).click().perform()
    time.sleep(3)
    
finally:
    try:
        driver.quit()
    except Exception as e:
        print(f"Error while quitting the driver: {e}")
    print("Program ended.")
