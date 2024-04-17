# package import
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver import ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel
from starlette.responses import JSONResponse
import pickle
import numpy as np
import pandas as pd

# 원하는 데이터를 추출하는 함수
def extract_data(schedule):

    # 선사명 추출
    company_name = schedule.find_element(By.CSS_SELECTOR, 'div.col-vessel p.port-name').text.strip()

    # 선박명 추출
    vessel_name = schedule.find_element(By.CSS_SELECTOR, 'div.col-vessel div.vessel-name-overcheck').text.strip()

    # 출발항 추출
    origin = schedule.find_element(By.CSS_SELECTOR, 'div.col2 p.port-name').text.strip()

    # 도착항 추출
    destination = schedule.find_element(By.CSS_SELECTOR, 'div.col3 p.port-name').text.strip()

    # 출발일 추출
    dep_time = schedule.find_element(By.CSS_SELECTOR, 'div.col2 p.date').text.strip()

    # 도착일 추출
    arr_time = schedule.find_element(By.CSS_SELECTOR, 'div.col3 p.date').text.strip()

    # 소요시간 추출
    duration = schedule.find_element(By.CSS_SELECTOR, 'div.col5 div.col-box').text.strip()

    # 환적여부 추출
    trans = schedule.find_element(By.CSS_SELECTOR, 'div.col6 span.trans-str').text.strip()

    # 해상 운임비(O/F) 추출
    price = schedule.find_elements(By.CSS_SELECTOR, 'div.currency-box span.price')
    if len(price) > 1:
        of20 = price[0].text.strip()
        of40 = price[1].text.strip()
    else:
        of20, of40 = "", ""


    return {
        'company_name': company_name,
        'vessel_name': vessel_name,
        'origin' : origin,
        'destination' : destination,
        'dep_time' : dep_time,
        'arr_time': arr_time,
        'duration' : duration,
        'trans': trans,
        'of20' : of20,
        'of40' : of40
    }


# 출발항, 도착항 정보 받아오기
dep_port = '부산'
arr_port = '싱가포르'

# 크롤링하는 함수
def my_crawling() : # 나중에 출발항, 도착항을 넣을것

    # 크롤링할 페이지 url
    url = 'https://www.tradlinx.com/schedule'

    # 크롬 브라우저를 이용해 웹 브라우저 실행
    # path = "C:/Program Files/Google/Chrome/Application/chromedriver.exe"
    # driver = webdriver.Chrome(path)
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=ChromeOptions())
    driver.get(url)
    time.sleep(1)

    # 웹 페이지에서 검색 입력 상자 찾기
    search_boxes = driver.find_elements(By.CLASS_NAME, 'sm-input')
    # search_box2 = driver.find_elements(By.CSS_SELECTOR, 'body > application > div > schedule > div > div.ocean-schedule-layer > div > div > div > div > div:nth-child(2) > port-selector > div > input')

    # 첫 번째 검색어(출발항) 입력
    search_boxes[0].send_keys(dep_port)
    search_boxes[0].send_keys(Keys.ENTER)

    # 두 번째 검색어(도착항) 입력
    search_boxes[1].send_keys(arr_port)
    search_boxes[1].send_keys(Keys.ENTER)

    # 검색 버튼을 클릭
    # css 셀렉터로 찾음(f12에서 우클 - copy - copy selector)
    search_button = driver.find_element(By.CSS_SELECTOR, 'body > application > div > schedule > div > div.ocean-schedule-layer > div > div > div > div > div.search-button-box > button')

    search_button.click()
    time.sleep(1)

    # class가 'one-schedule fcl'인 li들 가져오기
    schedules = driver.find_elements(By.CLASS_NAME, 'one-schedule')
    print("크롤링 완료")

    # 추출한 데이터를 담을 리스트
    schedule_list = []

    # 각 li에서 원하는 데이터 뽑기
    for schedule in schedules:
        result = extract_data(schedule)
        schedule_list.append(result)

    print("데이터 추출 완료")

    # 드라이버 종료
    driver.quit()

    return schedule_list
        
crawling_result = my_crawling()
print(crawling_result)
print('='*30)
print(len(crawling_result))
print(crawling_result[0])


# ========================================== fast api로 데이터 전송 ==========================================

# app = FastAPI()

# @app.get(path="/", status_code=201)
# def myiris() :
                                 
#     result = my_crawling()
#     print("=========== 크롤링 결과 ===========", result)

#     return JSONResponse(result)

# if __name__ == '__main__' :
#     uvicorn.run(app, host="127.0.0.1", port=8002)
