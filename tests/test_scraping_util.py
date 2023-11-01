from src.scraping_util import extract_unique_urls, get_root_url, view_url
from src.webdriver_util import start_driver

def test_extract_unique_urls():
    url = "https://discovery-center.cloud.sap/serviceCatalog/abap-environment?tab=feature&region=all"
    out = extract_unique_urls(url, keyword_list=[''])
    print(out)  # Expected: []

def test_get_root_url():
    url = 'https://discovery-center.cloud.sap/serviceCatalog/abap-environment?tab=feature&region=all'
    root_url = get_root_url(url)
    print(root_url)  # Expected: 'https://discovery-center.cloud.sap.com'

def test_view_url():
    driver = start_driver()
    # always do this to test. This website needs security clearance
    url = 'https://blogs.sap.com/2023/06/19/driving-productivity-automating-process-order-confirmation-in-s-4hana/'
    out = view_url(url, driver=driver)
    print(out[:10000])

# Run the tests
if __name__ == "__main__":
    # test_extract_unique_urls()
    # test_get_root_url()
    test_view_url()
