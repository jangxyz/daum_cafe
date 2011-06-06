#!/usr/bin/python
# -*- coding: utf8 -*-

import sys
import os
import re

import htmlentitydefs
import urllib, urllib2
import cookielib

import getpass
from collections import namedtuple

"""
    다음 카페 클럽앨범 이미지 다운로더

        다음 카페 클럽앨범의 사진을 다운로드 받을 수 있도록 하는 스크립트

"""
__version__ = 0.1

CAFE_START_PAGE = 'http://cafe.daum.net/'
LOGIN_URL = "https://logins.daum.net/accounts/login.do"


opener = None
def urlopen(url):
    site = _open_site(url)
    text = site.read()
    encoding = get_encoding_from_header(site.headers)
    return text.decode(encoding)

def _open_site(url):
    if opener is not None:  site = opener.open(url)
    else:                   site = urllib.urlopen(url)
    return site

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
        return [t for t in board_info_list if t[0].strip() == category.strip()]

    return board_info_list

def parse_cafe_inner_url_from_official(url):
    ''' parse cafe official url and return real url '''
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
    sidebar_url  = get_domain(url, path)
    return sidebar_url


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
    return [(t[0].strip(), t[1], unescape(t[2]), unescape(t[3]), t[4]) 
        for t in result]


def parse_article_album_list(url):
    ''' parse article album list and result list of article information as a tuple:
        (article_num, title, post_date, author, path)
    '''
    _type = namedtuple('BriefArticleInfo', 'article_num title post_date author path'.split())

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
                d['path']
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
        return domain + "/" + path.lstrip('/')

    return domain


def unescape(text):
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
    return re.sub("&#?\w+;", fixup, text)


def list_album(url):
    articles = parse_article_album_list(url)
    # (article_num, title, post_date, author, path)
    print url
    for a in articles:
        print "[%d] %s - by %s, %s" % (a.article_num, a.title, a.author, a.post_date)

def download_images_in_album_view(url):
    article_info = parse_article_album_view(url)
    # (title, post_date, author, url, image_list)
    print article_info.url
    print "%s - by %s, %s" % (article_info.title, article_info.author, article_info.post_date)
    for image_url in article_info.image_list:
        filename = download_image(image_url, article_info.title)
        print ' *', filename

if __name__ == '__main__':
    url = sys.argv[1]

    opener = authorize()
    if not is_logged_in():
        print "cannot login!"
        sys.exit(1)

    #list_album(url)
    download_images_in_album_view(url)


