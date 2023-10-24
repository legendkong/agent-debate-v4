from selenium import webdriver
from selenium.webdriver.firefox.options import Options

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
    driver = webdriver.Firefox(options=options)
    print('Driver initialized:', driver)
    return driver