import urllib.request
import urllib.parse
import http.cookiejar
import ssl
import re

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

url = "https://www.net2ftp.com/index.php"

# Step 1: Login
login_data = {
    "ftpserver": "191.101.228.66",
    "ftpserverport": "21",
    "username": "u851958941.jetleechannel.sg",
    "password": "Jetleechannel12345&",
    "directory": "/articles",
    "language": "en",
    "state": "login",
    "state2": "main"
}

print("Logging into net2ftp...")
req = urllib.request.Request(url, data=urllib.parse.urlencode(login_data).encode("utf-8"))
res = opener.open(req)
html = res.read().decode("utf-8", errors="ignore")

# Extract form hidden inputs
inputs = dict(re.findall(r'name=["\']?([^"\' >]+)["\']?\s+value=["\']?([^"\' >]*)["\']?', html))
print(f"Login inputs found: {len(inputs)}")

# Step 2: Upload article
upload_data = {
    "ftpserver": "191.101.228.66",
    "ftpserverport": "21",
    "username": "u851958941.jetleechannel.sg",
    "password": "Jetleechannel12345&",
    "directory": "/articles",
    "language": "en",
    "state": "upload",
    "state2": "addurl",
    "urlfile[1]": "https://duke-librarian-unsigned-mouth.trycloudflare.com/article",
    "urlfilename[1]": "article-bt-q4-launches-2026.html"
}
upload_data.update(inputs)

print("Sending upload command for article...")
req2 = urllib.request.Request(url, data=urllib.parse.urlencode(upload_data).encode("utf-8"))
res2 = opener.open(req2)
html2 = res2.read().decode("utf-8", errors="ignore")

inputs2 = dict(re.findall(r'name=["\']?([^"\' >]+)["\']?\s+value=["\']?([^"\' >]*)["\']?', html2))
print(f"Upload inputs found: {len(inputs2)}")

# Step 3: Upload index
upload_data_index = {
    "ftpserver": "191.101.228.66",
    "ftpserverport": "21",
    "username": "u851958941.jetleechannel.sg",
    "password": "Jetleechannel12345&",
    "directory": "/articles",
    "language": "en",
    "state": "upload",
    "state2": "addurl",
    "urlfile[1]": "https://duke-librarian-unsigned-mouth.trycloudflare.com/index",
    "urlfilename[1]": "index.html"
}
upload_data_index.update(inputs2)

print("Sending upload command for index...")
req3 = urllib.request.Request(url, data=urllib.parse.urlencode(upload_data_index).encode("utf-8"))
res3 = opener.open(req3)
html3 = res3.read().decode("utf-8", errors="ignore")

print("All requests complete!")
