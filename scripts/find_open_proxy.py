import urllib.request
import ftplib
import socket
import concurrent.futures
import sys
import os

FTP_HOST = "191.101.228.66"
FTP_USER = "u851958941.jetleechannel.sg"
FTP_PASS = "Jetleechannel12345&"

FILE1_LOCAL = "/home/ubuntu/.openclaw/workspace/articles/article-bt-q4-launches-2026.html"
FILE1_REMOTE = "articles/article-bt-q4-launches-2026.html"

FILE2_LOCAL = "/home/ubuntu/.openclaw/workspace/articles/index.html"
FILE2_REMOTE = "articles/index.html"

def http_connect(proxy_host, proxy_port, target_host, target_port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(3.5)
    s.connect((proxy_host, proxy_port))
    connect_req = f"CONNECT {target_host}:{target_port} HTTP/1.1\r\nHost: {target_host}:{target_port}\r\n\r\n"
    s.sendall(connect_req.encode("utf-8"))
    res = s.recv(1024).decode("utf-8", errors="ignore")
    if "200" not in res:
        s.close()
        raise Exception(f"Proxy CONNECT to {target_host}:{target_port} failed: {res.splitlines()[0] if res else 'empty'}")
    return s

class ProxyFTP(ftplib.FTP):
    def __init__(self, proxy_host, proxy_port):
        super().__init__()
        self.proxy_host = proxy_host
        self.proxy_port = proxy_port

    def connect(self, host=None, port=21, timeout=4):
        self.sock = http_connect(self.proxy_host, self.proxy_port, host or FTP_HOST, port)
        self.file = self.sock.makefile('r', encoding='utf-8')
        self.welcome = self.getresp()
        return self.welcome

    def makepasv(self):
        host, port = super().makepasv()
        # Open data connection via the SAME proxy
        data_sock = http_connect(self.proxy_host, self.proxy_port, host, port)
        return host, port, lambda: data_sock

def test_proxy(p):
    phost, pport_str = p.split(":")
    pport = int(pport_str)
    if pport not in [80, 443, 8080, 8081, 8888, 3128, 8000, 8443, 8082]:
        return False
    try:
        ftp = ProxyFTP(phost, pport)
        ftp.connect(FTP_HOST, 21)
        ftp.login(FTP_USER, FTP_PASS)

        # Upload file 1
        with open(FILE1_LOCAL, "rb") as f:
            ftp.storbinary(f"STOR {FILE1_REMOTE}", f)
        print(f"✅ UPLOADED {FILE1_REMOTE} VIA {p}")

        # Upload file 2
        with open(FILE2_LOCAL, "rb") as f:
            ftp.storbinary(f"STOR {FILE2_REMOTE}", f)
        print(f"✅ UPLOADED {FILE2_REMOTE} VIA {p}")

        ftp.quit()
        return p
    except Exception as e:
        return False

# Fetch fresh HTTP proxies
urls = [
    "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt",
    "https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=3000&country=all&ssl=all&anonymity=all"
]

all_proxies = set()
for u in urls:
    try:
        req = urllib.request.urlopen(u)
        for l in req.read().decode("utf-8").splitlines():
            if l.strip():
                all_proxies.add(l.strip())
    except:
        pass

proxies = list(all_proxies)
print(f"Testing {len(proxies)} proxies with custom PASV handler...")

with concurrent.futures.ThreadPoolExecutor(max_workers=40) as executor:
    futures = {executor.submit(test_proxy, p): p for p in proxies}
    for future in concurrent.futures.as_completed(futures):
        res = future.result()
        if res:
            print(f"🎉🎉🎉 SUCCESSFUL FULL UPLOAD VIA PROXY {res}!")
            os._exit(0)

print("No proxy succeeded.")
