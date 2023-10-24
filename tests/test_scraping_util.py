from src.scraping_util import extract_unique_urls, get_root_url, view_url
from src.webdriver_util import start_driver

def test_extract_unique_urls():
    url = "https://learn.deeplearning.ai/"
    out = extract_unique_urls(url, keyword_list=['course'])
    print(out)  # Expected: []

def test_get_root_url():
    url = 'https://towardsdatascience.com/stable-diffusion-as-an-api-5e381aec1f6'
    root_url = get_root_url(url)
    print(root_url)  # Expected: https://towardsdatascience.com

def test_view_url():
    driver = start_driver()
    # always do this to test. This website needs security clearance
    url = "https://python.langchain.com/docs/modules/data_connection/document_loaders/integrations/web_base"
    out = view_url(url, driver=driver)
    print(out[:500])

# Run the tests
if __name__ == "__main__":
    test_extract_unique_urls()
    test_get_root_url()
    test_view_url()
