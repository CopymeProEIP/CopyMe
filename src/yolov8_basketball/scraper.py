from selenium import webdriver
from selenium.webdriver.common.by import By
import os
import requests
import random
import time
import argparse

class ImageScraper:
    def __init__(self, urls_file, download_path):
        self.urls_file = urls_file
        self.download_path = download_path

    def scrape_images(self):
        # Create download directory if it doesn't exist
        if not os.path.exists(self.download_path):
            os.makedirs(self.download_path)

        with open(self.urls_file, 'r') as file:
            urls = file.readlines()

        for url in urls:
            url = url.strip()
            if url:
                print('Scraping images from:', url)
                self._scrape_images_from_url(url)

    def _scrape_images_from_url(self, url):
        # chrome options
        options = webdriver.ChromeOptions();
        options.add_experimental_option('excludeSwitches', ['enable-logging'])

        try:
            driver = webdriver.Chrome(url, options=options);
            driver.get(url);
            driver.maximize_window();
            # sleep for visibility of change
            time.sleep(2);
            # scroll to the bottom
            driver.execute_script("window.scrollTo(0,document.body.scrollHeight)");
            time.sleep(2);
            images = driver.find_elements(By.TAG_NAME, 'img')

            for i,img in enumerate(images):
                src = img.get_attribute('src')
                if src:
                    time.sleep(random.uniform(1, 4))
                    img_data = requests.get(src).content
                    with open(os.path.join(self.download_path, f'c_{requests.get(src).elapsed}.jpg'), 'wb') as handler:
                        handler.write(img_data)
        finally:
            driver.quit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Scrape images from URLs listed in a file.')
    parser.add_argument('-u', '--urls_file', type=str, default="./urls.txt" ,help='Path to the file containing URLs')
    parser.add_argument('-d', '--download_path', type=str, default="./dataset/", help='Path to the directory where images will be downloaded')

    args = parser.parse_args()

    scraper = ImageScraper(urls_file=args.urls_file, download_path=args.download_path)

    scraper.scrape_images()
