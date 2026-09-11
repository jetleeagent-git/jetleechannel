import urllib.request
import urllib.parse
import http.cookiejar
import re

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

login_data = {
    "ftpserver": "191.101.228.66",
    "ftpserverport": "21",
    "username": "u851958941.jetleechannel.sg",
    "password": "Jetleechannel87649315$",
    "directory": "/articles",
    "language": "en",
    "state": "login",
    "state2": "main"
}

print("Connecting to net2ftp...")
req = urllib.request.Request("https://www.net2ftp.com/index.php", data=urllib.parse.urlencode(login_data).encode("utf-8"))
res = opener.open(req)
html = res.read().decode("utf-8", errors="ignore")

if "Logout" in html or "Directory" in html or "net2ftp" in html:
    print("Response received from net2ftp.")
    print("Page title/header snippet:")
    for line in html.splitlines():
        if "title" in line.lower() or "heading" in line.lower() or "error" in line.lower() or "successful" in line.lower():
            print("  ", line.strip())

# Check if logged in
inputs = dict(re.findall(r'name=["\']?([^"\' >]+)["\']?\s+value=["\']?([^"\' >]*)["\']?', html))
print(f"Inputs extracted: {list(inputs.keys())[:10]}")
