#!/usr/bin/python
# -*- coding: utf8 -*-

from network_util import *
from daum_cafe    import *

"""
    다음 카페 클럽앨범 이미지 다운로더

        다음 카페 클럽앨범의 사진을 다운로드 받을 수 있도록 하는 스크립트

"""
__program__ = u"다음 카페 이미지 다운로더"
__version__ = 0.1
__author__ = u"김장환 janghwan@gmail.com"

import sys
from collections import defaultdict
fs_encoding = sys.getfilesystemencoding()

# globals
logged_in_username = None
current_cafe  = None
current_board = None



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
    try:
        print "로그인을 해주세요:"
        authorize()
    except ValueError:
        print u'도저히 로그인이 안되네요. 다음에 해보시죠.'
        sys.exit(1)
    except (IOError, httplib.HTTPException):
        print
        print u"인터넷 연결이 되지 않습니다. 문제를 해결한 후에 다시 시도해주세요."
        print
        sys.exit(110)


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

# vim: sts=4 et
