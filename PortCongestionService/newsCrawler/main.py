# package import
import requests
from bs4 import BeautifulSoup
import json
from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel
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

# ========================================== 뉴스 크롤러 ==========================================

# 원하는 데이터를 추출하는 함수
def extract_data(article):

    # 썸네일 이미지 URL 추출
    find_thumb = article.find('a', class_='thumb')
    thumb = '-'
    if find_thumb:
        thumb = find_thumb.find('img')['src']

    print(thumb)

    # 기사 url 추출
    link = article.find('h4', class_='titles').find('a')['href']

    # 기사 제목 추출
    title = article.find('h4', class_='titles').text.strip()

    # 기사 내용 추출
    content = article.find('p', class_='lead').text.strip()

    # 기자 이름 추출
    name = article.find('span', class_='byline').find_all('em')[1].text.strip()

    # 기사 날짜 추출
    date = article.find('span', class_='byline').find_all('em')[2].text.strip()

    return {
        'thumb' : thumb,
        'link': link,
        'title': title,
        'content': content,
        'name' : name,
        'date': date
    }

# 크롤링하는 함수
def my_crawling() :

    # 크롤링할 페이지 url
    url = 'http://www.maritimepress.co.kr/news/articleList.html?sc_section_code=S1N2&view_type=sm'

    # HTTP GET 요청을 보내고 웹페이지의 HTML을 가져옴
    response = requests.get(url)

    # BeautifulSoup을 사용하여 HTML을 파싱
    soup = BeautifulSoup(response.text, 'html.parser')
    response = requests.get(url)

    # BeautifulSoup을 사용하여 HTML을 파싱
    soup = BeautifulSoup(response.text, 'html.parser')
    # 필요한 데이터를 추출하여 출력 또는 저장
    articles = soup.find('ul', class_='type2').find_all('li')

    # 리스트에 담기
    article_list = []
    for article in articles:
        data = extract_data(article)
        article_list.append(data)

    return article_list


# ========================================== 해상 스케줄 크롤러 ==========================================

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


# 출발항, 도착항 정보 받아오기
# depPort = '부산'
# arrPort = '싱가포르'

# 크롤링하는 함수
def schedule_crawling(depPort,arrPort) :

    # 크롤링할 페이지 url
    url = 'https://www.tradlinx.com/schedule'

    # 크롬 옵션 설정
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless")

    # 속도 향상을 위해 이미지 로딩 차단 (1:이미지 로딩 허용/2:차단)
    prefs = {"profile.managed_default_content_settings.images": 2}
    chrome_options.add_experimental_option("prefs", prefs)

    # 크롬 브라우저를 이용해 웹 브라우저 실행
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.get(url)

    # 웹 페이지에서 검색 입력 상자 찾기
    search_boxes = driver.find_elements(By.CLASS_NAME, 'sm-input')
    # search_box2 = driver.find_elements(By.CSS_SELECTOR, 'body > application > div > schedule > div > div.ocean-schedule-layer > div > div > div > div > div:nth-child(2) > port-selector > div > input')

    # 첫 번째 검색어(출발항) 입력
    search_boxes[0].send_keys(depPort)
    search_boxes[0].send_keys(Keys.ENTER)

    # 두 번째 검색어(도착항) 입력
    search_boxes[1].send_keys(arrPort)
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
        result = extract_schdeule(schedule)
        schedule_list.append(result)

    print("데이터 추출 완료")

    # 드라이버 종료
    driver.quit()

    return schedule_list


# ========================================== fast api로 데이터 전송 ==========================================

# 스케줄 검색할 항구명을 입력받기 위한 Model 생성
class Port(BaseModel) :
    depPort: str
    arrPort : str

# 무조건 app이 맨 밑에 가게 해야함
app = FastAPI() 

# 뉴스 전송하는 fast api
@app.get(path="/news", status_code=201)
async def myNews() :
                                 
    result = my_crawling()
    print("=========== 크롤링 결과 ===========", result)

    return JSONResponse(result)


# 스케줄 전송하는 fast api

@app.post(path="/schedule", status_code=201)
async def mySchedule(port:Port) :
    print("스케줄" , port.depPort , port.arrPort)
    result = schedule_crawling(port.depPort , port.arrPort)
    print("=========== 크롤링 결과 ===========", result)

    return JSONResponse(result)



if __name__ == '__main__' :
    uvicorn.run(app, host="127.0.0.1", port=8000)
