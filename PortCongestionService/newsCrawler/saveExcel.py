
# package import
import requests
from bs4 import BeautifulSoup
import json
from fastapi import FastAPI
import uvicorn
from starlette.responses import JSONResponse
import pickle
import numpy as np
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver import ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager
import time
import os
import datetime

# ========================================== 해상 스케줄 크롤러 ==========================================


# 당일 날짜 추출
current_date = datetime.datetime.now().date()
formatted_date = current_date.strftime("%Y-%m-%d")

# 원하는 데이터를 추출하는 함수
def extract_schdeule(schedule):

    # 선사 로고 이미지 url 추출
    logo_img = schedule.find_element(By.CSS_SELECTOR, 'div.col1 img').get_attribute("src")

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
        'logo_img' : logo_img,
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


# url 설정하는 함수
def set_url(dep, arr, date):

    origin = ''
    if dep == '부산':
        origin = '105169'
    elif dep == '인천':
        origin = '105162'

    destination = ''
    if arr == '도쿄':
        destination = '105149'
    elif arr == '오사카':
        destination = '105132'
    elif arr == '싱가포르':
        destination = '105312'
    elif arr == '홍콩':
        destination = '105038'
    elif arr == '상하이':
        destination = '104947'

    print("출발항 : ",dep," - ",origin," / 도착항 : ",arr," - ",destination)

    # 크롤링할 페이지 url
    url = 'https://www.tradlinx.com/ocean-schedule-fcl?org='+origin+'&des='+destination+'&day=' + date

    # ICNtoOSK = 
    result = schedule_crawling(dep, arr, url)
    return result


# 크롤링하는 함수
def schedule_crawling(dep, arr, url) :

    # 크롬 옵션 설정
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless")

    # 속도 향상을 위해 이미지 로딩 차단 (1:이미지 로딩 허용/2:차단)
    prefs = {"profile.managed_default_content_settings.images": 2}
    chrome_options.add_experimental_option("prefs", prefs)

    # 크롬 브라우저를 이용해 웹 브라우저 실행
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.get(url)

    # class가 'one-schedule fcl'인 li들 가져오기
    schedules = driver.find_elements(By.CLASS_NAME, 'one-schedule')
    print("크롤링 완료")

    # 추출한 데이터를 담을 리스트
    schedule_list = []

    # 각 li에서 원하는 데이터 뽑기
    for schedule in schedules:
        result = extract_schdeule(schedule)
        schedule_list.append(result)

    print("데이터 추출 완료")

    # 드라이버 종료
    driver.quit()

    # 엑셀로 저장하는 함수 호출
    save_excel(dep, arr, schedule_list)


# 받은 리스트를 엑셀로 저장하는 함수
def save_excel(dep, arr, list):
    df = pd.DataFrame(list)
    # 파일명 출발항도착항날짜.csv로 저장
    # 경로 각자 알맞게 바꿔줘야 함
    save_path = 'C:/PR/Dima project/PortCongestionService/src/main/resources/static/excel/' + dep + arr + formatted_date +'.csv'
    df.to_csv(save_path, index=False)
    print("저장완료")



# 출발항, 도착항 리스트 만들기
depPort_list = ['부산','인천']
arrPort_list = ['도쿄','오사카','싱가포르','홍콩','상하이']

# 크롤링해서 저장
for d in depPort_list:
    for a in arrPort_list:
        set_url(d, a, formatted_date)


