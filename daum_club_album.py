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

CAFE_START_PAGE = 'http://cafe.daum.net/'
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
        LOGIN_TEST_URL = CAFE_START_PAGE
        try:
            site = urlopen(LOGIN_TEST_URL)
        except urllib2.URLError, e:
            sys.stderr.write(str(e))
            sys.stderr.write("\n")
            return

    LOGIN_MARK1  = re.compile('''<h3>[^<]*자주가는 카페[^<]*</h3>''')
    LOGIN_MARK2  = re.compile('''<div [^>]*id="loginBox"[^>]*>''')
    LOGOUT_MARK1 = re.compile('''<div [^>]*id="needLogin"[^>]*>''')
    LOGOUT_MARK2 = re.compile('''<form name="loginform" id="loginForm" method="post" action="https://logins.daum.net/accounts/login.do">''')
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


def list_cafe_from_favorites(text=None):
    '''
    return list of tuple (cafe name, cafe url)

    assumes content of http://cafe.daum.net/ page in text
    start, finish: 
        <div id="favorites" class="content">
            ...
        <div id="activities" class="content">
    '''
    cafe_list = []

    if text is None:
        text = urlopen(CAFE_START_PAGE)

    # extract region
    FAVORITES_MARK = re.compile('''
        # get content between div#favorites and div#activities
        <div [^>]*id="favorites"[^>]*>      # start mark
        (.*)
        <div [^>]*id="activities"[^>]*>     # end mark
    ''', re.S | re.X)
    match = FAVORITES_MARK.search(text)
    if not match:
        raise Exception("parse error")

    text = match.group(1).strip()
    if not ('<tbody>' in text and '</tbody>' in text):
        raise Exception("parse error")

    text = text[text.index('<tbody>') : text.index('</tbody>')].strip()

    # split table
    LINK_PATTERN = re.compile('''
        # get src and text node below A tag
        <a [^>]*href="([^"]*)"[^>]*>    # anchor start
        ([^<]*)                         # title
        </a>                            # anchor end
    ''', re.S | re.X)
    for tr in text.split("<tr>")[1:]:
        match = LINK_PATTERN.search(tr)
        if match:
            cafe_list.append((match.group(2).strip(), match.group(1).strip()))

    return cafe_list
        


def list_cafe_from_all():
    pass


def list_album_board(url, category=None):
    # fetch inner url
    inner_url = parse_cafe_inner_url_from_official(url)

    # fetch sidebar url
    sidebar_url = parse_sidebar_menu_url_from_cafe_main(inner_url)

    # fetch board info list
    board_info_list = parse_board_info_from_sidebar(sidebar_url)

    if category:
        return [t for t in board_info_list where t[0].strip() == category.strip()]
    else:
        return board_info_list

def parse_cafe_inner_url_from_official(url):
    ''' parse cafe official url and return real url '''
    CAFE_HOME_PATTERN = re.compile('''
        # get src of frame#down
        <frame [^>]*
            (
                (id="down" [^>]*src="([^"]*)")
                |
                (src="([^"]*)" [^>]*id="down")
            )
        [^>]*>
    ''', re.S | re.X)

    site1 = urlopen(url)
    match = CAFE_HOME_PATTERN.search(site1)
    if not match:
        raise Exception("parse error")
    url = match.group(3) or match.group(5)
    return url


def parse_sidebar_menu_url_from_cafe_main(url):
    ''' parse cafe main source and return url for cafe sidebar menu '''
    CAFE_SIDEBAR_PATTERN = re.compile('''
        # get src of tag iframe#leftmenu
        <iframe 
            [^>]*
            id="leftmenu" 
            [^>]*
            src="([^"]*)"
            [^>]*
        >
    ''', re.S | re.X)

    text = urlopen(url)
    match = CAFE_SIDEBAR_PATTERN.search(text)
    if not match:
        raise Exception("parse error")

    path = match.group(1)
    url = get_domain(url) + "/" + path.lstrip('/')
    return url


def parse_board_info_from_sidebar(url):
    ''' parse cafe menu source and return list of menu information in tuple:
        (category, id, path, title, content)

    url is cafe sidebar menu url

    some of examples are:
            <li class="icon_movie_all "><a id="fldlink_movie_bbs" href="/_c21_/movie_bbs_list?grpid=ccJT" target="_parent" onclick="parent_().caller(this.href);return false;" title="&#46041;&#50689;&#49345; &#48372;&#44592;">동영상 보기</a></li>
		    <li class="icon_board "><a id="fldlink_9VHG_286" href="/_c21_/bbs_list?grpid=ccJT&amp;fldid=9VHG" target="_parent" onclick="parent_().caller(this.href);return false;" class="" title="&#54616;&#44256;&#49910;&#51008;&#47568; &#47924;&#49832;&#47568;&#51060;&#46304; &#54624; &#49688; &#51080;&#45716; &#44277;&#44036;&#51077;&#45768;&#45796;">이런말 저런말</a></li>
		    <li class="icon_album "><a id="fldlink_6bUe_338" href="/_c21_/album_list?grpid=ccJT&amp;fldid=6bUe" target="_parent" onclick="parent_().caller(this.href);return false;" title="climbing picture &amp; info.">Squamish</a></li>
		    <li class="icon_phone "><a id="fldlink__album_624" href="/_c21_/album_list?grpid=ccJT&amp;fldid=_album" target="_parent" onclick="parent_().caller(this.href);return false;" title="&#53364;&#47101;&#50536;&#48276;">클럽앨범</a></li>
		    <li class="icon_memo "><a id="fldlink__memo_525" href="/_c21_/memo_list?grpid=ccJT&amp;fldid=_memo" target="_parent" onclick="parent_().caller(this.href);return false;" title="&#51068;&#49345;&#51032; &#49692;&#44036;&#49692;&#44036; &#46496;&#50724;&#47476;&#45716; &#51105;&#45392;&#51060;&#45208;,&#44036;&#45800;&#54620; &#47700;&#49464;&#51648;&#47484; &#51201;&#50612;&#48372;&#49464;&#50836;!!">한 줄 메모장</a><img src="http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif" width="10" height="9" alt="new" class="icon_new" /></li> 
    '''
    BOARD_PATTERN = re.compile('''
        <li [^>]*                               # LI
            class="(?P<category>icon_[^"]*)\s*" # class attribute
        >
            \s*
            <a                                  # A
                [^>]*
                id="(?P<id>[^"]*)"              # id attribute
                [^>]*
                href="(?P<path>[^"]*)"          # href attribute
                [^>]*
                title="(?P<title>[^"]*)"        # title attribute
                [^>]*
            >
                (?P<content>[^<]*)              # text node under A
            </a>
            \s*

            (                                   # optional new-post image
                <img[^?]*>
            )?
            \s*
        </li>
    ''', re.X | re.S)

    text = urlopen(url)
    result = BOARD_PATTERN.findall(text)
    return [(t[0].strip(), t[1], t[2], unescape(t[3]), t[4]) for t in result]

            

def get_domain(url):
    '''
        urlparse:
            <scheme>://<netloc>/<path>;<params>?<query>#<fragment>
    '''
    parse_result = urllib2.urlparse.urlparse(url)
    domain = '''%(scheme)s://%(netloc)s''' % parse_result._asdict()
    return domain.rstrip('/')


def unescape(text):
    ''' from http://effbot.org/zone/re-sub.htm#unescape-html '''
    import re, htmlentitydefs
    def fixup(m):
        text = m.group(0)
        if text[:2] == "&#":
            # character reference
            try:
                if text[:3] == "&#x":
                    return unichr(int(text[3:-1], 16))
                else:
                    return unichr(int(text[2:-1]))
            except ValueError:
                pass
        else:
            # named entity
            try:
                text = unichr(htmlentitydefs.name2codepoint[text[1:-1]])
            except KeyError:
                pass
        return text # leave as is
    return re.sub("&#?\w+;", fixup, text)




if __name__ == '__main__':
    pass

