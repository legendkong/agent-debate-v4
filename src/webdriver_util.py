from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service as FirefoxService

geckodriver_path = r"C:\Users\I742564\Downloads\geckodriver-v0.33.0-win64\geckodriver.exe"
firefox_service = FirefoxService(executable_path=geckodriver_path)

def start_driver():
    try:
        driver.quit()
        del driver
        print('Deleting existing driver')
    except Exception as e:
        print('No existing driver to delete')
        
    print('Initializing new driver')
    options = Options()
    options.add_argument("--headless")
    
    # Set the User-Agent
    options.add_argument("user-agent=Mozilla")

    # Set the option to accept all SSL certificates by default
    options.add_argument('--ignore-certificate-errors')

    # initialize a browser
    driver = webdriver.Firefox(service=firefox_service, options=options)
    print('Driver initialized:', driver)
    return driver