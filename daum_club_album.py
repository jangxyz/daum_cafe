#!/usr/bin/python
# -*- coding: utf8 -*-

import sys
import re
import urllib2

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

def is_logged_in():

    try:
        site = urllib2.urlopen(LOGIN_TEST_URL).read()
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
        



if __name__ == '__main__':
    pass

