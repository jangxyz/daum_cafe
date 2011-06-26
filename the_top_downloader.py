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
    다음 카페 '더탑' 클럽앨범 이미지 다운로더


"""
__program__ = u"더탑 클럽앨범 다운로더"
__version__ = 0.1
__author__ = u"김장환 janghwan@gmail.com"

CAFE_START_PAGE = 'http://cafe.daum.net/'
LOGIN_URL = "https://logins.daum.net/accounts/login.do"

# http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album&page=2&prev_page=1&firstbbsdepth=0014zzzzzzzzzzzzzzzzzzzzzzzzzz&lastbbsdepth=0014kzzzzzzzzzzzzzzzzzzzzzzzzz&albumtype=article&listnum=30
CLUB_ALBUM_URL = 'http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album'
CLUB_ALBUM_URL_TEMPLATE = 'http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album&page=%(page)d&prev_page=%(prev_page)d&listnum=%(listnum)d&firstbbsdepth=%(firstbbsdepth)s&lastbbsdepth=%(lastbbsdepth)s'

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


def parse_cafeapp_ui_info(text):
    ''' parse javascript based info inside text 
    
        <script ...>
        ...
            CAFEAPP.ui = {
                ...
            }
        ...
        </script>
    '''
    cafeapp_ui_dict = {}

    script_start, cafeapp_ui_start = False, False
    for line in text.split("\n"):

        if '<script' in line and '</script>' in line:
            if line.rindex('<script') > line.rindex('</script>'):   script_start = True
            else:                                                   script_start = False
        elif '<script'   in line:     script_start = True
        elif '</script>' in line:   script_start = False

        if script_start:
            if cafeapp_ui_start:
                if '}' in line:
                    cafeapp_ui_start = False
                else:
                    k,v = line.strip().split(':', 1)
                    cafeapp_ui_dict[ k.strip() ] = v.strip().rstrip(',').strip('"')

            if '''CAFEAPP.ui = {''' in line:
                cafeapp_ui_start = True

        else:
            if len(cafeapp_ui_dict) > 0:
                return cafeapp_ui_dict

def parse_article_album_list(url, text=None):
    ''' parse article album list and result list of article information as a tuple:
        (article_num, title, post_date, author, path, url)
    '''
    _type = namedtuple('BriefArticleInfo', 'article_num title post_date author path url'.split())

    ARTICLE_LIST_START_MARK = '''<div class="albumListBox">'''
    ARTICLE_LIST_END_MARK   = '''<!-- end albumListBox -->'''

    # fetch
    if text is None:
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
    _type = namedtuple('DetailArticleInfo', 'article_num title post_date author url image_list'.split())

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

    IMAGE_SRC_PATTERN = re.compile(u'''<img [^>]*src="([^"]*)"[^>]*/?>''')
    image_list = IMAGE_SRC_PATTERN.findall(text)

    # 
    d = article_info
    return _type(
        get_article_num_from_url(d['url']),
        d['title'].strip(), 
        d['post_date'], 
        d['author'].strip(), 
        d['url'],
        image_list
    )


def get_article_num_from_url(url):
    if not is_cafe_article_view_url(url):
        return None

    # http://cafe.daum.net/loveclimb/9uox/318
    if is_cafe_article_view_official_url(url):
        return int(url.rsplit('/', 1)[-1])
    # http://cafe335.daum.net/_c21_/bbs_read?grpid=TweC&mgrpid=&fldid=AtV9&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=00016zzzzzzzzzzzzzzzzzzzzzzzzz&datanum=68&listnum=20
    elif is_cafe_article_view_inner_url(url):
        query = url.rpartition('?')[-1]
        query_dict = dict(kv.split('=') for kv in query.split('&'))
        return int(query_dict['datanum'])


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
# util
#
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

def is_hangul(u):
    return u'가' <= u <= u'힣' or u'ㄱ' <= u <= u'ㅎ'

def count_hangul(u):
    return sum(is_hangul(x) for x in u)



#
# application
#
class Article: pass

def intro():
    print u"%s v%s (만든이 %s)" % (__program__, str(__version__), __author__)

def print_help():
    print '''[도움말]

<페이지 이동>
  다음 페이지를 보고 싶으면 n을, 
  이전 페이지를 보고 싶으면 p를 입력하세요.
  
<선택>
  한번에 다운로드 받고 싶은 번호들을 모두 선택해주세요.
  예)
   “판교외벽 사진을 한번에 받고 싶다” --> '4147-4143'
   “톱쟁이가 올린 사진을 받고 싶다”   --> '4141, 4140, 4151'
   “우중산행?”                        --> '4153'
   “드록바 빼고 전부 다”              --> '4153,4151-4138'
  
  선택된 번호를 보고 싶으면 s를 누르면 됩니다.
  
<다운로드>
  엔터를 입력하면 다운로드가 진행됩니다.
'''
    raw_input("[엔터를 누르세요]")

def list_page(page, current_page, articles, selected=[]):
    print "스포츠클라이밍 실내암벽 더탑 > 클럽앨범 > page %d" % current_page

    def title_length(title):
        return len(title) + count_hangul(title)

    max_title_length = max(title_length(a.title)    for a in articles)
    max_image_count  = max(len(`len(a.image_list)`) for a in articles)

    for a in articles:
        post_date = a.post_date.replace('. ', ' ')
        image_count = len(a.image_list)
        author = a.author.partition('(')[0]
        space = ''.ljust(max_title_length + max_image_count - title_length(a.title) - len(`image_count`))
        if a.url in selected:  selected_str = '*'
        else:                  selected_str = ' '
        print "%s %d) %s | %s [%d] %s- %s" % (selected_str, a.article_num, post_date, a.title, image_count, space, author)
    print

def list_selected_articles(articles, selected):
    '''
    * 4150) 2011.06.19 22:01 | 암벽16기 4차교육_선인봉_2 [19]               - 웅이
    * 4145) 2011.06.18 21:44 | 20110618 판교외벽_3 [17]                     - 웅이
    * 4139) 2011.06.14 01:04 | 20110612 간현암 [8]                          - 웡이
    '''

    if len(selected) == 0:
        print "선택한 게시물이 없습니다."
    else:
        def title_length(title):
            return len(title) + count_hangul(title)
        max_title_length = max(title_length(a.title)    for a in articles)
        max_image_count  = max(len(`len(a.image_list)`) for a in articles)

        for a in articles:
            if a.url not in selected:
                continue
            post_date = a.post_date.replace('. ', ' ')
            image_count = len(a.image_list)
            space = ''.ljust(max_title_length + max_image_count - title_length(a.title) - len(`image_count`))
            print "* %d) %s | %s [%d] %s- %s" % (a.article_num, post_date, a.title, image_count, space, a.author)

    raw_input("[엔터를 누르세요]")

def interpret_selection(selection):
    ''' selection may be in form of 

      * '4153'            => [4153]
      * '4141 4140, 4151' => [4140, 4141, 4151]
      * '4147-4143'       => range(4143, 4147)
      * '4153,4151-4138'  => [4153] + range(4138,4151)
    '''
    if ',' in selection:
        selections = [s.strip() for s in selection.split(",")]
    else:
        selections = [selection]
    #
    minmax = lambda a: (min(a), max(a))
    #
    results = []
    for sel in selections:
        if '-' in sel:
            small, large = minmax(map(int, sel.split('-')))
            results.extend(range(small, large+1))
        elif ' ' in sel:
            results.extend(map(int, sel.split(' ')))
        else:
            results.append(int(sel))
    return set(results)

def is_selection_format(s):
    return re.match("[-0-9 ,]+", s) is not None

def select_articles(selection, current_page, cached_articles, articles, selected):
    for a in articles:
        if a.article_num not in selection:
            continue
        # toggle
        if a.url in selected:   selected.remove(a.url)
        else:                   selected.add(a.url)
        # remove from selection
        selection.remove(a.article_num)

    # still left? search cache
    if len(selection) > 0:
        for page, articles in cached_articles.iteritems():
            if page == current_page:
                continue
            for a in articles:
                if a.article_num not in selection:
                    continue
                # toggle
                if a.url in selected:   selected.remove(a.url)
                else:                   selected.add(a.url)
                # remove from selection
                selection.remove(a.article_num)

    return selected

def save_directory():
    pass

def download(articles, selected):
    pass

def user_input(selected_count):
    print '이전페이지(p), 다음페이지(n), 다시보기(l), 선택된번호(s), 선택(번호), 도움말(h)'
    if selected_count:
        print '현재 선택 %d개. 입력(enter는 다운로드) >' % selected_count,
    else:
        print '입력(enter는 다운로드) >',
    return raw_input()

def get_album_url(new_page=1, articles_in_page=15, current_cafeapp_ui={}):
    # http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album&page=2&prev_page=1&firstbbsdepth=0014zzzzzzzzzzzzzzzzzzzzzzzzzz&lastbbsdepth=0014kzzzzzzzzzzzzzzzzzzzzzzzzz&albumtype=article&listnum=15
    # http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album&page=2&prev_page=1&listnum=15

    # document.location.href="/_c21_/album_list?grpid="+CAFEAPP.GRPID+"&fldid="+CAFEAPP.FLDID+"&page="+page+"&prev_page="+CAFEAPP.ui.PAGER_page+"&firstbbsdepth="+CAFEAPP.ui.FIRSTBBSDEPTH+"&lastbbsdepth="+CAFEAPP.ui.LASTBBSDEPTH+"&albumtype=article&listnum="+listnum;
    # "prev_page="+CAFEAPP.ui.PAGER_page + "&firstbbsdepth="+CAFEAPP.ui.FIRSTBBSDEPTH+"&lastbbsdepth="+CAFEAPP.ui.LASTBBSDEPTH

    #prev_page = max(new_page - 1, 1)
    if 'FIRSTBBSDEPTH' in current_cafeapp_ui and \
       'PAGER_page'    in current_cafeapp_ui and \
       'LASTBBSDEPTH'  in current_cafeapp_ui:
           return CLUB_ALBUM_URL_TEMPLATE % {
               'page'          : new_page,
               'listnum'       : articles_in_page,
               'prev_page'     : int(current_cafeapp_ui['PAGER_page']),
               'firstbbsdepth' : current_cafeapp_ui['FIRSTBBSDEPTH'],
               'lastbbsdepth'  : current_cafeapp_ui['LASTBBSDEPTH'],
           }
    # return first page
    else:
        return CLUB_ALBUM_URL

def fetch_articles(current_page, articles_in_page, current_cafeapp_ui, cached_articles):
    if current_page < 1:
        current_page = 1

    album_url = get_album_url(current_page, articles_in_page, current_cafeapp_ui)
    #print album_url
    text = urlopen(album_url)

    # update cafeapp_ui
    new_cafeapp_ui = parse_cafeapp_ui_info(text)
    if new_cafeapp_ui:
        current_cafeapp_ui.update(new_cafeapp_ui)

    # parse articles
    articles0 = parse_article_album_list(album_url, text)
    articles  = [parse_article_album_view(a.url) for a in articles0]

    # save cache
    cached_articles[current_page] = articles

    return articles

if __name__ == '__main__':
    intro()
    print

    # login
    print "로그인을 해주세요."
    authorize()

    # settings
    current_page = 1
    articles_in_page = 15
    current_cafeapp_ui = {}
    cached_articles = {}

    #
    articles  = fetch_articles(current_page, articles_in_page, current_cafeapp_ui, cached_articles)
    selected  = set()
    context   = (articles, selected)

    while True:
        print
        list_page(1, current_page, *context)
        # 이전페이지(p), 다음페이지(n), 다시보기(l), 선택된번호(s), 선택(번호), 도움말(h)
        # 현재 선택 3개. 입력(enter는 다운로드) >
        resp = user_input(len(selected)).strip().lower()

        if resp == 'h':
            print_help()
        # next / previous
        elif resp in ('p', 'n'):
            if resp == 'p': current_page -= 1
            else:           current_page += 1
            if current_page in cached_articles:
                articles = cached_articles[current_page]
            else:
                articles = fetch_articles(current_page, articles_in_page, current_cafeapp_ui, cached_articles)
        # reload
        elif resp == 'l':
            current_page = 1
            articles  = fetch_articles(current_page, articles_in_page, current_cafeapp_ui, cached_articles)
        # list selected
        elif resp == 's':
            list_selected_articles(*context)
        # add selection
        elif is_selection_format(resp):
            selection = interpret_selection(resp)
            selected = select_articles(selection, current_page, cached_articles, *context)
        # proceed
        elif resp == '':
            # exit on empty selection
            if len(selected) == 0:
                yn = raw_input("선택한 게시물이 없습니다. 종료하겠습니까? (Y/n) ").strip()
                if yn.lower() != 'n':
                    break
            # download
            else:
                download(*context)

        context = (articles, selected)

    #list_album(url)
    #download_images_in_album_view(url)

