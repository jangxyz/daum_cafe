#!/usr/bin/python
# -*- coding: utf8 -*-

from network_util import *

"""

"""
import sys
import os
import re

import getpass
import cookielib
import urllib, urllib2
from collections import namedtuple

CAFE_START_PAGE = 'http://cafe.daum.net/'
LOGIN_URL = "https://logins.daum.net/accounts/login.do"

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

    urllib2.install_opener(opener)

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

# vim: sts=4 et
