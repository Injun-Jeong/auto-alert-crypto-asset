
# Batch: Shrimp-Keeper

---

고래 싸움에 새우등 터지지 말고 지키자,,

⏱️기간: 2021. 09. 08. ~ 2021. 09. 08.

🏃참여자: @정인준


## Goal

---

고래 싸움에 새우등 터지지 말자,,

- 짧은 순간 고래에 의한 영향을 감지하기 위한 프로그램
- 특정 종목의 정보를 1분 마다 알려주는 프로그램
- 특징
    - `단기 변화율`에 대한 정보를 한 눈에 알아 볼 수 있다.
    - (TODO) **단기 변화율 특이점 발생 시,** `고래 위험 경고` **알람이 별도로 수신**된다.

## 사용법

---

### 0. (Optional) Cloud Server via Vultr

---

- [Vultr 클라우드 서비스](https://www.vultr.com/)를 통해, 새우지킴이 서버를 만든다.
- 가장 저렴한 옵션으로 설정하는 것을 권장한다. ( 약 5천원 / 월 )

    [spec](https://www.notion.so/568b4e20415844289b6c65a1fd94bed0)

```bash
# 발급된 IP주소로 ssh 서버 접속
> ssh root@141.164.42.27

# password 입력
> root@141.164.42.27's password: 
Welcome to Ubuntu 18.04.5 LTS (GNU/Linux 4.15.0-153-generic x86_64)
...

# 아래와 같이 터미널에 나온다면 정상
root@shrimpkeeper:~#
```

### 1. ssh 서버에 node 및 npm 설치

---

```bash
# install Node.js and npm
> curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
> sudo apt-get install -y nodejs

# 정상 설치 버전 확인
> node -v
> npm -v
```

### 2. intall package

---

```bash
> git clone https://github.com/Injun-Jeong/shrimp-keeper.git
> cd shrimp-keeper/
> npm install --save
```

### 3. set the file of key.json

---

새우지킴이를 실행하기 위한, 설정 값을 `key.json` 파일에 세팅한다.

```bash
> cd env/
> vim key.json

{
  "market ticker": "krw-xrp",        // 마켓시장단위-티커(잘못 기입하면 안 됩니다.) 
  "market": "krw",                   // 마켓시장단위
  "ticker": "xrp",                   // 티커
  "telegram chatId": "",             // 텔레그램 채팅 아이디
  "telegram token": "",              // 텔레그램 접근 토큰
  "server ip address": ""            // 새우지킴이 원격 서버 ip:port 주소
}
```

다음과 같이, 자신의 정보에 맞게 값을 세팅한다. 텔레그램과 관련된 정보(아이디, 토큰)는 첨부된 링크를 참고하여 새우지킴이 로봇을 만들고, 자신의 채팅 아이디와 API 접근 토큰을 세팅한다. 포트 번호는 3000으로 한다.

* [텔레그램 정보](https://juntcom.tistory.com/160)

```bash
/* update key.json file */
{
  "market ticker": "krw-xrp",        
  "market": "krw",                   
  "ticker": "xrp",                   
  "telegram chatId": "exampleChatId", 
  "telegram token": "exampleToken",    
  "server ip address": "http://141.164.42.27:3000"   // 포트번호는 3000
}
```

### 4. run program

---

서버를 실행 시킨 후, 텔레그램 앱에 접속하여 `/on` 명령어를 입력한다.

```bash
> cd ../server/

# 백그라운드 실행을 위함
> sudo npm install -g forever
> sudo forever start server.js
```

새우지킴이를 중지하고 싶은 경우, 텔레그램 앱에 접속하여 `/off` 명령어를 입력한다. 도움말이 필요한 경우, 텔래레그램 앱에 접속하여 `/help` 명령어를 입력한다.

서버의 새우지킴이를 내리고 싶을 때, 다음의 명령어를 수행한다.

```bash
> sudo forever stopall
```


