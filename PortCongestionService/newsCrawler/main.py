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



# 원하는 데이터를 추출하는 함수
def extract_data(article):
    # 이미지 URL 추출
    #thumb = article.find('a', class_='thumb').find('img')

    # url 추출
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


# ========================================== fast api로 데이터 전송 ==========================================

# Model 생성
class Item(BaseModel) :
    petalLength: float
    petalWidth : float
    sepalLength: float
    sepalWidth: float

app = FastAPI()

@app.get(path="/", status_code=201)
def myiris() :
                                 
    result = my_crawling()
    print("=========== 크롤링 결과 ===========", result)

    return JSONResponse(result)

if __name__ == '__main__' :
    uvicorn.run(app, host="127.0.0.1", port=8000)








# ================================================================================================================
# 서버 URL
#server_url = 'http://marineNews.com/send_data'

# 보낼 데이터 JSON 형식으로 변환
#data_json = json.dumps(article_list)

# POST 요청 보내기
#response = requests.post(url, data=data_json, headers={'Content-Type': 'application/json'})

# 응답 확인
#if response.status_code == 200:
#    print('Data sent successfully')
#else:
#    print('Failed to send data. Status code:', response.status_code)