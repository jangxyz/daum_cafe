#!/usr/bin/python
# -*- coding: utf8 -*-

import sys
import re
import urllib, urllib2
import cookielib
import getpass

"""
    다음 카페 클럽앨범 이미지 다운로더

        다음 카페 클럽앨범의 사진을 다운로드 받을 수 있도록 하는 스크립트

"""
__version__ = 0.1
LOGIN_TEST_URL = 'http://cafe.daum.net/'
LOGIN_MARK1 = re.compile('''<h3>[^<]*자주가는 카페[^<]*</h3>''')
LOGIN_MARK2 = re.compile('''<div [^>]*id="loginBox"[^>]*>''')
LOGOUT_MARK1 = re.compile('''<div [^>]*id="needLogin"[^>]*>''')
LOGOUT_MARK2 = re.compile('''<form name="loginform" id="loginForm" method="post" action="https://logins.daum.net/accounts/login.do">''')

LOGIN_URL = "https://logins.daum.net/accounts/login.do"


opener = None
def urlopen(url):
    if opener is not None:
        site = opener.open(url)
    else:
        site = urllib.urlopen(url)
    return site.read()


def is_logged_in(site=None):
    if site is None:
        try:
            site = urlopen(LOGIN_TEST_URL)
        except urllib2.URLError, e:
            sys.stderr.write(str(e))
            sys.stderr.write("\n")
            return
    # login!
    if LOGIN_MARK1.search(site) and LOGIN_MARK2.search(site):
        return True
    # logout!
    if LOGOUT_MARK1.search(site) and LOGOUT_MARK2.search(site):
        return False
    # heh?
    sys.stderr.write("obscure state..")
    return
        

def authorize(username=None, password=None):
    '''
    <form name="loginform" id="loginForm" method="post" action="https://logins.daum.net/accounts/login.do">
        <input type="hidden" name="url" id="url" value="http://cafe.daum.net" />
        <input type="radio" name="securityLevel" id="securityLevel1" value="1" />
        <input type="radio" name="securityLevel" id="securityLevel2" value="2" />
        <input type="radio" name="securityLevel" id="securityLevel3" value="3" />
        <input type="text" name="id" id="id" maxlength="50" class="empty" value="" title="아이디 입력" tabindex="1" />
        <input type="password" name="pw" id="inputPwd" maxlength="32" class="empty" value="" title="비밀번호 입력" tabindex="2" />
        <input type="checkbox" name="saved_id" id="sid" title="아이디 저장" tabindex="3" /><label for="sid">ID 저장</label>
     </form>
    '''
    global opener

    if username is None:
        username = raw_input('Username: ')
    if password is None:
        password = getpass.getpass()

    login_data = {
        "url": "http://cafe.daum.net",
        "securityLevel": "2",
        "id": username,
        "pw": password,
    }
    #   
    cj = cookielib.CookieJar()
    opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
    resp = opener.open(LOGIN_URL, data=urllib.urlencode(login_data))
    del password, login_data
    return opener



if __name__ == '__main__':
    pass

