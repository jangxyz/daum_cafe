#!/usr/bin/python
# -*- coding: utf8 -*-

import sys
import os
import re

import htmlentitydefs
import urllib, urllib2
import cookielib

import getpass
from collections import namedtuple, defaultdict

"""
    다음 카페 클럽앨범 이미지 다운로더

        다음 카페 클럽앨범의 사진을 다운로드 받을 수 있도록 하는 스크립트

"""
__program__ = u"다음 카페 이미지 다운로더"
__version__ = 0.1
__author__ = u"김장환 janghwan@gmail.com"

CAFE_START_PAGE = 'http://cafe.daum.net/'
LOGIN_URL = "https://logins.daum.net/accounts/login.do"

# globals
opener = None
logged_in_username = None
current_cafe  = None
current_board = None

fs_encoding = sys.getfilesystemencoding()


def _open_site(url):
    if opener is not None:  site = opener.open(url)
    else:                   site = urllib.urlopen(url)
    return site

def urlopen(url):
    site = _open_site(url)
    text = site.read()
    encoding = get_encoding_from_header(site.headers)
    return text.decode(encoding)

def get_encoding_from_header(header=None, url=None):
    if header is None:
        site = _open_site(url)
        header = site.headers
    ct = header.dict['content-type'].strip()
    param = ct.split(';', 1)[1].strip()
    encoding = param.partition('charset=')[2]
    return encoding

def get_filename_from_header(header=None, url=None):
    if header is None:
        site = _open_site(url)
        header = site.headers
    try:
        cd = header.dict['content-disposition'].strip()
        param = cd.split(';', 1)[1].strip()
        filename = param.partition('filename=')[2].strip('"')
        return filename
    except:
        raise Exception("parse error")

def is_logged_in(text=None):
    if text is None:
        LOGIN_TEST_URL = CAFE_START_PAGE
        try:
            text = urlopen(LOGIN_TEST_URL)
        except urllib2.URLError, e:
            sys.stderr.write(str(e))
            sys.stderr.write("\n")
            return

    LOGIN_MARK1  = re.compile(u'''<h3>[^<]*자주가는 카페[^<]*</h3>''')
    LOGIN_MARK2  = re.compile(u'''<div [^>]*id="loginBox"[^>]*>''')
    LOGOUT_MARK1 = re.compile(u'''<div [^>]*id="needLogin"[^>]*>''')
    LOGOUT_MARK2 = re.compile(u'''<form name="loginform" id="loginForm" method="post" action="https://logins.daum.net/accounts/login.do">''')
    # login!
    if LOGIN_MARK1.search(text) and LOGIN_MARK2.search(text):
        return True
    # logout!
    if LOGOUT_MARK1.search(text) and LOGOUT_MARK2.search(text):
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
    global opener, logged_in_username

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

    return username


def list_cafe_from_favorites(text=None):
    '''
    return list of tuple (cafe_name, cafe_url)

    assumes content of http://cafe.daum.net/ page in text
    start, finish: 
        <div id="favorites" class="content">
            ...
        <div id="activities" class="content">
    '''
    _type = namedtuple('Cafe', 'name url'.split())

    cafe_list = []

    if text is None:
        text = urlopen(CAFE_START_PAGE)

    # extract region
    FAVORITES_MARK = re.compile(u'''
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
    LINK_PATTERN = re.compile(u'''
        # get src and text node below A tag
        <a [^>]*href="([^"]*)"[^>]*>    # anchor start
        ([^<]*)                         # title
        </a>                            # anchor end
    ''', re.S | re.X)
    for tr in text.split("<tr>")[1:]:
        match = LINK_PATTERN.search(tr)
        if match:
            t = (match.group(2).strip(), match.group(1).strip())
            cafe_list.append(_type(*t))

    return cafe_list
        


def list_cafe_from_all():
    pass


def list_album_board(url):
    '''
        (category, id, path, title, content, url)
    '''
    # fetch inner url
    parse_result = urllib2.urlparse.urlparse(url)
    if parse_result.netloc == 'cafe.daum.net':
        inner_url = parse_cafe_inner_url_from_official(url)
    else:
        inner_url = url

    # fetch sidebar url
    sidebar_url = parse_sidebar_menu_url_from_cafe_main(inner_url)

    # fetch board info list
    board_info_list = parse_board_info_from_sidebar(sidebar_url)

    #if category:
    #    return [t for t in board_info_list if t[0].strip() == category.strip()]

    return board_info_list

def parse_cafe_inner_url_from_official(url):
    ''' parse cafe official url and return real url 
    
    '''
    CAFE_HOME_PATTERN = re.compile(u'''
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
    CAFE_SIDEBAR_PATTERN = re.compile(u'''
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
    sidebar_url = get_domain(url, path)
    return sidebar_url


def parse_board_info_from_sidebar(url):
    ''' parse cafe menu source and return list of menu information in tuple:
        (category, id, path, title, content, url)

    url is cafe sidebar menu url

    some of examples are:
            <li class="icon_movie_all "><a id="fldlink_movie_bbs" href="/_c21_/movie_bbs_list?grpid=ccJT" target="_parent" onclick="parent_().caller(this.href);return false;" title="&#46041;&#50689;&#49345; &#48372;&#44592;">동영상 보기</a></li>
		    <li class="icon_board "><a id="fldlink_9VHG_286" href="/_c21_/bbs_list?grpid=ccJT&amp;fldid=9VHG" target="_parent" onclick="parent_().caller(this.href);return false;" class="" title="&#54616;&#44256;&#49910;&#51008;&#47568; &#47924;&#49832;&#47568;&#51060;&#46304; &#54624; &#49688; &#51080;&#45716; &#44277;&#44036;&#51077;&#45768;&#45796;">이런말 저런말</a></li>
		    <li class="icon_album "><a id="fldlink_6bUe_338" href="/_c21_/album_list?grpid=ccJT&amp;fldid=6bUe" target="_parent" onclick="parent_().caller(this.href);return false;" title="climbing picture &amp; info.">Squamish</a></li>
		    <li class="icon_phone "><a id="fldlink__album_624" href="/_c21_/album_list?grpid=ccJT&amp;fldid=_album" target="_parent" onclick="parent_().caller(this.href);return false;" title="&#53364;&#47101;&#50536;&#48276;">클럽앨범</a></li>
		    <li class="icon_memo "><a id="fldlink__memo_525" href="/_c21_/memo_list?grpid=ccJT&amp;fldid=_memo" target="_parent" onclick="parent_().caller(this.href);return false;" title="&#51068;&#49345;&#51032; &#49692;&#44036;&#49692;&#44036; &#46496;&#50724;&#47476;&#45716; &#51105;&#45392;&#51060;&#45208;,&#44036;&#45800;&#54620; &#47700;&#49464;&#51648;&#47484; &#51201;&#50612;&#48372;&#49464;&#50836;!!">한 줄 메모장</a><img src="http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif" width="10" height="9" alt="new" class="icon_new" /></li> 
    '''
    _type = namedtuple('BoardInfo', 'category id path title content url'.split())

    BOARD_PATTERN = re.compile(u'''
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
    return [_type(
            t[0].strip(), 
            t[1], 
            unescape(t[2], repeat=True), 
            unescape(t[3], repeat=True), 
            t[4],
            get_domain(url, t[2]),
        ) for t in result]


def parse_article_album_list(url):
    ''' parse article album list and result list of article information as a tuple:
        (article_num, title, post_date, author, path, url)
    '''
    _type = namedtuple('BriefArticleInfo', 'article_num title post_date author path url'.split())

    ARTICLE_LIST_START_MARK = '''<div class="albumListBox">'''
    ARTICLE_LIST_END_MARK   = '''<!-- end albumListBox -->'''

    text = urlopen(url)
    if not(ARTICLE_LIST_START_MARK in text and ARTICLE_LIST_END_MARK in text):
        raise Exception("parse error")
    text = text[ text.index(ARTICLE_LIST_START_MARK): text.index(ARTICLE_LIST_END_MARK) ]

    ARTICLE_PATTERN = re.compile(u'''
        <li[^>]*>\s*
            <dl>
            .*?
            <dd[ ]class="subject">\s*
                <a[ ][^>]*href="(?P<path>[^"]*)"[^>]*>\s*       # path
                (?P<title>[^<]*)\s*                             # title
                </a>\s*
                .*?
            </dd>\s*
            <dd[ ]class="txt_sub[ ]p11">번호\s*
            <span[ ]class="num">(?P<article_num>[0-9]+)</span>  # article_num
            .*?
            <span[ ]class="num">(?P<post_date>[^<]*)</span>\s*  # post_date
            </dd>
            .*?
            <dd[ ]class="txt_sub[ ]nick[ ]p11">\s*
                <a[^>]*>(?P<author>[^<]*)</a>\s*                # author
            </dd>
            .*?
            </dl>
            .*?
        </li>
    ''', re.X | re.S)

    result = []
    for article in text.split('</li>')[:-1]:
        match = ARTICLE_PATTERN.search(article + '</li>')
        if match:
            # (article_num, title, post_date, author, path)
            d = match.groupdict()
            t = (
                int(d['article_num']), 
                d['title'].strip(), 
                d['post_date'], 
                d['author'].strip(), 
                d['path'],
                get_domain(url, d['path']),
            )
            result.append(_type(*t))

    return result



def parse_article_album_view(url):
    ''' parse article album view and result list of article information as a tuple:
        (title, post_date, author, url, image_list)
    '''
    _type = namedtuple('FullArticleInfo', 'title post_date author url image_list'.split())

    # inner url
    parse_result = urllib2.urlparse.urlparse(url)
    if parse_result.netloc == 'cafe.daum.net':
        url = parse_cafe_inner_url_from_official(url)

    # strip article info
    ARTICLE_PATTERN = re.compile(u'''
        <div[ ]id="primaryContent">
            .*
            <div[ ]class="article_subject[ ]line_sub">\s*
                <div[ ]class="subject">
                    .*
                    <span[ ]class="b">(?P<title>[^<]*)</span>\s*            # title
                    .*
                </div>\s*
            </div><!--[ ]end[ ]article_subject[ ]-->\s*
            .*
            <div[ ]class="article_writer">\s*
                <a[^>]*>(?P<author>[^<]*)</a>                               # author
                .*
                <span[ ]class="p11[ ]ls0">(?P<post_date>[^<]*)</span>\s*    # post_date
                <span[ ]class="txt_sub[ ]url">\s*
                    <a[ ][^>]*href="(?P<url>[^"]*)"[^>]*>                   # url
                    .*
                    </a>
                    .*
                </span>\s*
            </div><!--[ ]end[ ]article_writer[ ]-->
            .*
        </div>
    ''', re.X | re.S)

    text = urlopen(url)
    match = ARTICLE_PATTERN.search(text)
    if not match:
        raise Exception("parse error")
    article_info = match.groupdict()

    # strip image lists from content
    CONTENT_START_MARK = '''<xmp id="template_xmp" name="template_xmp" style="display:none;">'''
    CONTENT_END_MARK = '''</xmp>'''
    if not (CONTENT_START_MARK in text and CONTENT_END_MARK in text):
        raise Exception("parse error")
    text = text[ text.index(CONTENT_START_MARK): text.index(CONTENT_END_MARK) ]

    IMAGE_SRC_PATTERN = re.compile(u'''<img [^>]*src="([^"]*)"[^>]*/>''')
    image_list = IMAGE_SRC_PATTERN.findall(text)

    # 
    d = article_info
    return _type(
        d['title'].strip(), 
        d['post_date'], 
        d['author'].strip(), 
        d['url'],
        image_list
    )


def is_cafe_main_url(url):
    '''
        http://cafe.daum.net/masa2009
        http://cafe.daum.net/nowjang
        http://cafe.daum.net/loveclimb

    # the good
    >>> is_cafe_main_url('http://cafe.daum.net/masa2009')      \
    ... and is_cafe_main_url('http://cafe.daum.net/nowjang')   \
    ... and is_cafe_main_url('http://cafe.daum.net/loveclimb')
    True

    # the bad
    >>> is_cafe_main_url("http://cafe986.daum.net/loveclimb")  \
    ... or is_cafe_main_url("http://cafe.daum.net/loveclimb/bbs_list")
    False
    '''
    parse_result = urllib2.urlparse.urlparse(url)
    if parse_result.netloc != "cafe.daum.net":
        return False

    path_list = parse_result.path.lstrip('/').split('/')
    if len(path_list) != 1:
        return False

    return True


def is_cafe_article_list_url(url):
    '''
        http://cafe986.daum.net/_c21_/bbs_list?grpid=ccJT&fldid=FVuB
        http://cafe335.daum.net/_c21_/bbs_list?grpid=TweC&fldid=AtV9
        http://cafe430.daum.net/_c21_/bbs_list?grpid=1JnO3&fldid=8lAR

    # the good
    >>> is_cafe_article_list_url('http://cafe986.daum.net/_c21_/bbs_list?grpid=ccJT&fldid=FVuB')     \
    ... and is_cafe_article_list_url('http://cafe335.daum.net/_c21_/bbs_list?grpid=TweC&fldid=AtV9') \
    ... and is_cafe_article_list_url('http://cafe430.daum.net/_c21_/bbs_list?grpid=1JnO3&fldid=8lAR')
    True

    # the bad
    >>> is_cafe_article_list_url("http://cafeABC.daum.net/_c21_/bbs_list?grpid=ccJT&fldid=FVuB")          \
    ... or is_cafe_article_list_url("http://cafe986.daum.net/_c00_/bbs_list?grpid=ccJT&fldid=FVuB")       \
    ... or is_cafe_article_list_url("http://cafe986.daum.net/_c21_/bbs_view?grpid=ccJT&fldid=FVuB")       \
    ... or is_cafe_article_list_url("http://cafe986.daum.net/_c21_/_list/bbs_list?grpid=ccJT&fldid=FVuB") \
    ... or is_cafe_article_list_url("http://cafe986.daum.net/_c21_/bbs_list")
    False
    '''
    NETLOC_PATTERN = re.compile("^cafe[0-9]+[.]daum[.]net$")

    parse_result = urllib2.urlparse.urlparse(url)
    if not NETLOC_PATTERN.match(parse_result.netloc):
        return False

    path_list = parse_result.path.lstrip('/').split('/')
    if len(path_list) != 2:
        return False

    if path_list[0] != "_c21_":
        return False

    if not path_list[1].endswith("_list"):
        return False

    params = dict(map(urllib.splitvalue, parse_result.query.split('&')))
    if 'grpid' not in params:
        return False
    
    return True


def is_cafe_article_view_url(url):
    return is_cafe_article_view_official_url(url) \
        or is_cafe_article_view_inner_url(url)

def is_cafe_article_view_official_url(url):
    '''
        http://cafe.daum.net/loveclimb/9uox/318
        http://cafe.daum.net/loveclimb/_album/4089
        http://cafe.daum.net/nowjang/AtV9/72
        http://cafe.daum.net/masa2009/8ktU/276

    # the good
    >>> is_cafe_article_view_official_url('http://cafe.daum.net/loveclimb/9uox/318')        /
    ... and is_cafe_article_view_official_url('http://cafe.daum.net/loveclimb/_album/4089') /
    ... and is_cafe_article_view_official_url('http://cafe.daum.net/nowjang/AtV9/72')       /
    ... and is_cafe_article_view_official_url('http://cafe.daum.net/masa2009/8ktU/276')
    True

    # the bad
    >>> is_cafe_article_view_official_url("http://cafe986.daum.net/loveclimb/abc/123")   /
    ... or is_cafe_article_view_official_url("http://cafe.daum.net/loveclimb/abc/temp/123")
    False
    '''
    parse_result = urllib2.urlparse.urlparse(url)
    if parse_result.netloc != "cafe.daum.net":
        return False

    path_list = parse_result.path.lstrip('/').split('/')
    if len(path_list) != 3:
        return False

    return True


def is_cafe_article_view_inner_url(url):
    '''
        http://cafe335.daum.net/_c21_/bbs_read?grpid=TweC&mgrpid=&fldid=AtV9&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=00016zzzzzzzzzzzzzzzzzzzzzzzzz&datanum=68&listnum=20
        http://cafe430.daum.net/_c21_/bbs_read?grpid=1JnO3&mgrpid=&fldid=8ktU&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0004Ozzzzzzzzzzzzzzzzzzzzzzzzz&datanum=272&listnum=20
        http://cafe986.daum.net/_c21_/movie_bbs_read?grpid=ccJT&fldid=9VHG&page=&prev_page=&firstbbsdepth=&lastbbsdepth=&contentval=000dqzzzzzzzzzzzzzzzzzzzzzzzzz&datanum=2470&edge=&listnum=
        http://cafe986.daum.net/_c21_/album_read?grpid=ccJT&fldid=_album&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0014Azzzzzzzzzzzzzzzzzzzzzzzzz&datanum=4102&edge=&listnum=15

    # the good
    >>> is_cafe_article_view_inner_url('http://cafe335.daum.net/_c21_/bbs_read?grpid=TweC&mgrpid=&fldid=AtV9&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=00016zzzzzzzzzzzzzzzzzzzzzzzzz&datanum=68&listnum=20')         \
    ... and is_cafe_article_view_inner_url('http://cafe430.daum.net/_c21_/bbs_read?grpid=1JnO3&mgrpid=&fldid=8ktU&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0004Ozzzzzzzzzzzzzzzzzzzzzzzzz&datanum=272&listnum=20')   \
    ... and is_cafe_article_view_inner_url('http://cafe986.daum.net/_c21_/movie_bbs_read?grpid=ccJT&fldid=9VHG&page=&prev_page=&firstbbsdepth=&lastbbsdepth=&contentval=000dqzzzzzzzzzzzzzzzzzzzzzzzzz&datanum=2470&edge=&listnum=')                                 \
    ... and is_cafe_article_view_inner_url('http://cafe986.daum.net/_c21_/album_read?grpid=ccJT&fldid=_album&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0014Azzzzzzzzzzzzzzzzzzzzzzzzz&datanum=4102&edge=&listnum=15')
    True

    # the bad
    >>> is_cafe_article_view_inner_url("http://cafeABC.daum.net/_c21_/bbs_read?grpid=ccJT&fldid=FVuB")          \
    ... or is_cafe_article_view_inner_url("http://cafe986.daum.net/_c00_/bbs_read?grpid=ccJT&fldid=FVuB")       \
    ... or is_cafe_article_view_inner_url("http://cafe986.daum.net/_c21_/bbs_list?grpid=ccJT&fldid=FVuB")       \
    ... or is_cafe_article_view_inner_url("http://cafe986.daum.net/_c21_/_read/bbs_read?grpid=ccJT&fldid=FVuB")
    False
    '''
    NETLOC_PATTERN = re.compile("^cafe[0-9]+[.]daum[.]net$")

    parse_result = urllib2.urlparse.urlparse(url)
    if not NETLOC_PATTERN.match(parse_result.netloc):
        return False

    path_list = parse_result.path.lstrip('/').split('/')
    if len(path_list) != 2:
        return False

    if path_list[0] != "_c21_":
        return False

    if not path_list[1].endswith("_read"):
        return False

    params = dict(map(urllib.splitvalue, parse_result.query.split('&')))
    if 'grpid' not in params:
        return False
    
    return True


def get_domain(url, path=None):
    '''
        urlparse:
            <scheme>://<netloc>/<path>;<params>?<query>#<fragment>
    '''
    parse_result = urllib2.urlparse.urlparse(url)
    domain = '''%(scheme)s://%(netloc)s''' % parse_result._asdict()
    domain = domain.rstrip('/')

    # paste path if any
    if path:
        return domain + "/" + unescape(path).lstrip('/')

    return domain


def unescape(text, repeat=None):
    ''' from http://effbot.org/zone/re-sub.htm#unescape-html '''
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
    new_text = re.sub("&#?\w+;", fixup, text)

    # once
    if repeat is None:
        return new_text

    # repeat for specified times, until no change
    repeat_count = 0
    while new_text != text:
        text = new_text
        new_text = re.sub("&#?\w+;", fixup, text)

        repeat_count += 1
        if repeat is True: 
            continue
        elif repeat_count >= repeat:
            break

    return new_text

def download_image(url, dest=None):
    # download to temp
    tmpfile, header = urllib.urlretrieve(url)
    filename = get_filename_from_header(header)

    # create directory
    if dest is None:
        dest = os.curdir
    if not os.path.exists(dest):
        os.makedirs(dest)

    # rename
    result_filename = os.path.join(dest, filename)
    os.rename(tmpfile, result_filename)
    return result_filename


#
# application
#
def intro():
    return u"%s v%s (만든이 %s)" % (__program__, str(__version__), __author__)

def print_breadcrumb():
    login = u"로그인: %s" % logged_in_username if logged_in_username else None
    cafe  = u"카페: %s" % current_cafe if current_cafe is not None else None
    board = current_board if current_board else None
    breadcrumb = " > ".join(filter(None, [login, cafe, board]))
    if breadcrumb:
        print breadcrumb

def download_images_in_album_view(url):
    article_info = parse_article_album_view(url)
    # (title, post_date, author, url, image_list)
    print article_info.url
    print "%s - by %s, %s" % (article_info.title, article_info.author, article_info.post_date)
    for image_url in article_info.image_list:
        filename = download_image(image_url, article_info.title)
        print ' *', filename

def ask_cafe_from_favorites():
    global current_cafe

    cafe_info_list = list_cafe_from_favorites()
    print_breadcrumb()

    # print
    def ask():
        for i,cafe in enumerate(cafe_info_list):
            print u"%d) %s - %s\n" % (i+1, cafe.name, cafe.url)
        return raw_input("> 선택하세요: ").decode(fs_encoding)

    while True:
        answer = ask().strip()

        if answer == u'':
            return

        if answer.isdigit():
            answer_index = int(answer) - 1
            if 0 <= answer_index < len(cafe_info_list):
                current_cafe = cafe_info_list[answer_index].name
                return cafe_info_list[answer_index].url
        else:
            def print_warning_if_no_cafe(cafes):
                if len(cafes) == 0:
                    print u"'%s'에 해당하는 카페는 찾을 수 없네요." % answer

            def print_warning_if_too_many_cafes(cafes):
                if len(cafes) > 1:
                    print u"'%s'에 해당하는 카페가 많아서 어떤 것인지 모르겠습니다:." % answer
                    for cafe in cafes:
                        print u" * %s - %s\n" % (cafe.name, cafe.url)

            cafes = [cafe for cafe in cafe_info_list if cafe.name.strip() == answer or cafe.url.strip() == answer]
            # exact match
            if len(cafes) == 1:
                current_cafe = cafes[0].name
                return cafes[0].url
            else:
                print_warning_if_too_many_cafes(cafes)

            # partial match
            cafes = [cafe for cafe in cafe_info_list if (answer in cafe.name.strip()) or (answer in cafe.url.strip())]
            if len(cafes) == 1:
                current_cafe = cafes[0].name
                return cafes[0].url
            else:
                print_warning_if_no_cafe(cafes)
                print_warning_if_too_many_cafes(cafes)


def ask_bbs_category(boards):
    print_breadcrumb()

    category_dict = defaultdict(list)
    for b in boards:
        cat = b.category.lstrip("icon_")
        category_dict[cat].append(b.content.strip())

    def category_order(x):
        if   x == "album"     : return 1
        elif x == "phone"     : return 2
        elif x == "memo"      : return 3
        elif x == "know"      : return 4
        elif x == "best"      : return 5
        elif x == "recent"    : return 6
        elif x == "movie_all" : return 7
        elif x == "board"     : return 8
        elif x == "etc"       : return 9
        else:                   return 100
    category_key_list = sorted(category_dict.keys(), key=category_order)
    while True:
        for i, cat in enumerate(category_key_list):
            print " %d) %s - %s" % (i+1, cat, ", ".join(category_dict[cat]))
        answer = raw_input("> 게시판 종류를 선택하세요(1~%d): " % len(category_key_list))
        answer = answer.decode(fs_encoding).strip()

        if answer == '':
            return

        if answer.isdigit():
            answer_index = int(answer) - 1
            if 0 <= answer_index < len(category_key_list):
                return "icon_" + category_key_list[answer_index]
        print "1부터 %d 사이의 숫자를 입력해주세요." % len(category_key_list)
        print

def ask_board(boards, category=None):
    global current_board

    print_breadcrumb()
    
    if category:
        if not category.startswith("icon_"):
            category = "icon_" + category
        boards = [b for b in boards if b.category == category]

    if len(boards) == 1:
        answer = raw_input("> '%s' 게시판을 선택하시겠습니까(Y/n)? " % boards[0].content.encode(fs_encoding))
        answer = answer.decode(fs_encoding).strip()
        if answer.lower() != 'n':
            current_board = boards[0].content
            return boards[0].url
        else:
            return

    while True:
        for i, b in enumerate(boards):
            print " %d) %s" % (i+1, b.content)

        answer = raw_input("> 게시판을 선택하세요(1-%d): " % len(boards))
        answer = answer.decode(fs_encoding).strip()
        if answer == '':
            return

        if answer.isdigit():
            answer_index = int(answer) - 1
            if 0 <= answer_index < len(boards):
                current_board = boards[answer_index].content
                return boards[answer_index].url
        print "1부터 %d 사이의 숫자를 입력해주세요." % len(boards)
        print

    

def print_board_list(url):
    boards = list_album_board(url)
    for b in boards:
        #print " * [%(category)s] %(content)s - %(title)s : %(path)s <%(id)s>" % b._asdict()
        print " * %(content)s - %(title)s" % b._asdict()

def print_brief_info_in_album_list(url):
    articles = parse_article_album_list(url)
    # (article_num, title, post_date, author, path)
    for a in articles:
        print "[%d] %s - by %s, %s" % (a.article_num, a.title, a.author, a.post_date)

def print_detail_info_in_album_list(url):
    articles = parse_article_album_list(url)
    #articles = [parse_article_album_view(a.url) for a in articles]
    for a in articles:
        a2 = parse_article_album_view(a.url)
        # (title, post_date, author, url, image_list)
        print "[%d] %s [%d] - by %s, %s" % (a.article_num, a2.title, len(a2.image_list), a2.author, a2.post_date)


if __name__ == '__main__':
    print intro()
    print_breadcrumb()

    # login
    print "로그인을 해주세요:"
    authorize()

    if len(sys.argv) == 1:
        # choose cafe
        url = ask_cafe_from_favorites()
        if url:
            print url
            # cafe

    else:
        url = sys.argv[1]

        if is_cafe_main_url(url):
            #print_board_list(url)
            boards = list_album_board(url)
            category = ask_bbs_category(boards)
            board_url = ask_board(boards, category)

            #print_brief_info_in_album_list(board_url)
            print_detail_info_in_album_list(board_url)

        #list_album(url)
        #download_images_in_album_view(url)


