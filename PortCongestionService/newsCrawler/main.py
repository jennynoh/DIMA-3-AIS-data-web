
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
import os
import datetime

# ========================================== 뉴스 크롤러 ==========================================

# 원하는 데이터를 추출하는 함수
def extract_data(article):

    # 썸네일 이미지 URL 추출
    thumb = '-'
    find_thumb = article.find('a', class_='thumb')
    if find_thumb:
        thumb = find_thumb.find('img')['src']

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



# ========================================== 해상 스케줄 데이터 불러오기 ==========================================

# 해상 스케줄 csv 파일 읽어오는 함수
def read_shipSchedule_excel(dep, arr) :

    # 당일 날짜 추출
    current_date = datetime.datetime.now().date()
    formatted_date = current_date.strftime("%Y-%m-%d")

    # csv 파일 경로
    excel_path = 'C:/PR/Dima project/PortCongestionService/src/main/resources/static/excel/' + dep + arr + formatted_date +'.csv'
    # print("출발항 : ",dep," / 도착항 : ",arr)
    # print(excel_path)

    # csv 파일을 읽어서 데이터프레임으로 변환
    terminalSchedule = pd.read_csv(excel_path) # 1번째 행을 컬럼명으로 설정

    # 결측치 채우기
    terminalSchedule.fillna("-", inplace=True)

    # 데이터프레임의 각 행을 딕셔너리로 바꿔서 리스트에 담기
    terminalSchedule_list = terminalSchedule.to_dict(orient='records') # orient='records' : 행을 기준으로 변환하라는 뜻

    return terminalSchedule_list



# ========================================== 컨테이너 터미널 스케줄 데이터 불러오기 ==========================================

# 컨테이너 터미널 스케줄 엑셀 파일 읽어오는 함수
def read_terminal_excel() :

    # 엑셀 파일 경로
    excel_path = 'C:/PR/Dima project/PortCongestionService/src/main/resources/static/excel/ContainerTerminalSchedule.xls'

    # 엑셀 파일을 읽어서 데이터프레임으로 변환
    excel_file = pd.read_excel(excel_path, header=1) # 1번째 행을 컬럼명으로 설정

    # 필요한 컬럼만 추출
    # terminalSchedule = excel_file[['Port', 'Terminal', 'Vessel Name', 'Vessel Call', 'Cut-off', 'Arrival', 'Departure', 'Carrier']]
    # 150행까지만 가져옴
    terminalSchedule = excel_file.loc[:149, ['Port', 'Terminal', 'Vessel Name', 'Vessel Call', 'Cut-off', 'Arrival', 'Departure', 'Carrier']]

    # 결측치 채우기
    terminalSchedule.fillna("-", inplace=True)

    # 데이터프레임의 각 행을 딕셔너리로 바꿔서 리스트에 담기
    terminalSchedule_list = terminalSchedule.to_dict(orient='records') # orient='records' : 행을 기준으로 변환하라는 뜻

    return terminalSchedule_list




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
# 출발항, 도착항 정보 받아와서 엑셀 파일 불러오기
@app.post(path="/schedule", status_code=201)
async def mySchedule(port:Port) :
    print("스케줄" , port.depPort , port.arrPort)
    result = read_shipSchedule_excel(port.depPort , port.arrPort)
    print("=========== 크롤링 결과 ===========", result)

    return JSONResponse(result)


# 컨테이너 터미널 스케줄 전송하는 fast api
@app.get(path="/terminal", status_code=201)
async def terminalSchedule() :
    result = read_terminal_excel()
    print("=========== 결과 ===========", result[0])

    return JSONResponse(result)




if __name__ == '__main__' :
    uvicorn.run(app, host="127.0.0.1", port=8000)
