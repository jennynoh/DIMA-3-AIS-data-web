import requests
from bs4 import BeautifulSoup

# 크롤링할 페이지 url
url = 'http://www.maritimepress.co.kr/news/articleList.html?sc_section_code=S1N2&view_type=sm'

# HTTP GET 요청을 보내고 웹페이지의 HTML을 가져옴
response = requests.get(url)

# BeautifulSoup을 사용하여 HTML을 파싱
soup = BeautifulSoup(response.text, 'html.parser')

# 데이터를 추출하는 함수 정의
def extract_data(article):
    # 이미지 URL 추출
    thumb = article.find('a', class_='thumb').find('img')
    

    # url 추출
    link = article.find('h4', class_='titles').find('a')['href']

    # 기사 제목 추출
    title = article.find('h4', class_='titles').text.strip()

    # 기사 내용 추출
    content = article.find('p', class_='lead').text.strip()

    # 기사 날짜 추출
    date = article.find('span', class_='byline').find_all('em')[2].text.strip()

    return {
        'link': link,
        'title': title,
        'content': content,
        'date': date
    }

# 필요한 데이터를 추출하여 출력 또는 저장
articles = soup.find('ul', class_='type2').find_all('li')

#for i in range(len(articles)):
#    print(i,"번째")
#    print(articles[i])
#    print("-"*20)

i=0
for article in articles:
    data = extract_data(article)
    i+=1
    print(i,"번째")
    #print(data['link'])
    print("url : ",data['link'], ", title : ",data['title'],", content : ",data['content'],", date : ",data['date'])
    print("-"*30)