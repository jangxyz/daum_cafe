#!/usr/bin/python
# -*- coding: utf8 -*-

import unittest
import types
import codecs

import daum_club_album
from daum_club_album import *

class Mock:
    def __init__(self, *args, **kwargs):
        self.__args = args
        self.__kwargs = kwargs
        for k,v in kwargs.iteritems():
            if isinstance(v, ins_m):
                _instance = self
                _class = self.__class__
                v = types.MethodType(v.function, _instance, _class)
            #
            setattr(self, k, v)

class ins_m:
    ''' set given function as a instance method, to a Mock class '''
    def __init__(self, function):
        self.function = function

# --

class BackupUrlOpen:
    def setUp(self):
        self.backups = {
            'urlopen': daum_club_album.urlopen
        }

    def tearDown(self):
        daum_club_album.urlopen = self.backups['urlopen']
    

class LoginTestCase(unittest.TestCase, BackupUrlOpen):
    def setUp(self):
        super(self.__class__, self).setUp()

    def tearDown(self):
        super(self.__class__, self).tearDown()

    def test_login(self):
        daum_club_album.urlopen = lambda *args, **kwargs: \
            open('html/login_page.html').read()

        # 
        if is_logged_in() is not True:
            raise AssertionError, "is_logged_in() should return True, but didn't"

    def test_logout(self):
        daum_club_album.urlopen = lambda *args, **kwargs: \
            open('html/logout_page.html').read()
        
        # 
        if is_logged_in() is not False:
            raise AssertionError, "is_logged_in() should return True, but didn't"


class AuthorizeTestCase(unittest.TestCase):
    def setUp(self):
        self.backups = {
            'cookielib': daum_club_album.cookielib,
            'urllib2': daum_club_album.urllib2,
        }

        # stub opener
        daum_club_album.urllib2.build_opener = lambda cookiep: Mock(
            open=lambda *args, **kwargs: None
        )

    def tearDown(self):
        daum_club_album.cookielib = self.backups['cookielib']
        daum_club_album.urllib2   = self.backups['urllib2']

    def test_use_cookielib(self):
        # mock cookielib
        def _counter(self):
            self.cookiejar_count += 1
        daum_club_album.cookielib = Mock(
            cookiejar_count=0,
            CookieJar = ins_m(_counter),
        )

        assert daum_club_album.cookielib.cookiejar_count == 0
        # test
        authorize('username', 'password')

        # validate
        assert daum_club_album.cookielib.cookiejar_count == 1, "cookielib.CookieJar() must be called"


    def test_passing_correct_parameters(self):
        username = 'username'
        password = 'password'

        # mock urllib2

        # validate when open is called
        def assert_parameter(*args, **kwargs):
            # LOGIN URL
            assert args[0] == daum_club_album.LOGIN_URL

            # id=username in param
            id_param = 'id=%s' % username
            assert id_param in kwargs['data'], \
                "cannot find '%s' in '%s'" % (id_param, kwargs['data'])

            # pw=password in param
            pw_param = 'pw=%s' % password
            assert pw_param in kwargs['data'], \
                "cannot find '%s' in '%s'" % (pw_param, kwargs['data'])

        # restub
        daum_club_album.urllib2.build_opener = lambda cookiep: Mock(
            open=assert_parameter
        )

        # test
        authorize(username, password)


class ListCafeFromFavoritesTestCase(unittest.TestCase, BackupUrlOpen):
    def setUp(self):
        super(ListCafeFromFavoritesTestCase, self).setUp()
        #
        daum_club_album.urlopen = lambda *args, **kwargs: \
            open('html/login_page.html').read()

    def tearDown(self):
        super(ListCafeFromFavoritesTestCase, self).tearDown()

    def test_count_cafes_extracted(self):
        result = list_cafe_from_favorites()

        # validate
        assert len(result) == 1
        
    def test_cafe_info_tuple(self):
        result = list_cafe_from_favorites()

        # validate
        cafe_info = result[0]
        assert isinstance(cafe_info, tuple)
        assert cafe_info[0] == "스포츠클라이밍 실내암벽 더탑"
        assert cafe_info[1] == "http://cafe.daum.net/loveclimb?t__nil_cafemy=item"


class ListAlbumBoardTestCase(unittest.TestCase, BackupUrlOpen):
    def setUp(self):
        super(self.__class__, self).setUp()


    def tearDown(self):
        super(self.__class__, self).tearDown()


    def test_parse_cafe_inner_url_from_official(self):
        ''' should access official URL and retrieves inner URL '''
        daum_club_album.urlopen = lambda *args, **kwargs: \
            codecs.open('html/cafe1.html', encoding='cp949').read()

        official_url = 'http://cafe.daum.net/loveclimb'
        inner_url = parse_cafe_inner_url_from_official(official_url)

        # validate
        assert inner_url == 'http://cafe986.daum.net/_c21_/home?grpid=ccJT'


    def test_parse_sidebar_menu_url_from_cafe_main(self):
        daum_club_album.urlopen = lambda *args, **kwargs: \
            codecs.open('html/cafe_main.html', encoding='cp949').read()

        main_url = 'http://cafe986.daum.net/_c21_/home?grpid=ccJT'
        sidebar_url = parse_sidebar_menu_url_from_cafe_main(main_url)

        # validate
        assert sidebar_url == 'http://cafe986.daum.net/_c21_/bbs_menu_cube?grpid=ccJT&amp;mgrpid=&amp;bmt=2011060609174720110604000828.9520110604000828.6420110425094836.16'

    def test_parse_board_info_from_sidebar_menu(self):
        daum_club_album.urlopen = lambda *args, **kwargs: \
            codecs.open('html/cafe_sidebar.html', encoding='cp949').read()

        sidebar_url = 'http://cafe986.daum.net/_c21_/bbs_menu_cube?grpid=ccJT&amp;mgrpid=&amp;bmt=2011060609174720110604000828.9520110604000828.6420110425094836.16'
        result = parse_board_info_from_sidebar(sidebar_url)

        # validate
        assert len(result) is 33
        print result[0]
        assert result[0]  == (u'icon_recent', u'fldlink_recent_bbs', u'/_c21_/recent_bbs_list?grpid=ccJT&fldid=_rec', u'최신글 보기', u'최신글 보기')
        assert result[6]  == (u'icon_memo',  u'fldlink__memo_525', u'/_c21_/memo_list?grpid=ccJT&fldid=_memo', u'일상의 순간순간 떠오르는 잡념이나,간단한 메세지를 적어보세요!!', u'한 줄 메모장')
        assert result[14] == (u'icon_phone', u'fldlink__album_624', u'/_c21_/album_list?grpid=ccJT&fldid=_album', u'클럽앨범', u'클럽앨범')



class ParseArticleAlbumTestCase(unittest.TestCase, BackupUrlOpen):
    def setUp(self):
        super(self.__class__, self).setUp()

    def tearDown(self):
        super(self.__class__, self).tearDown()

    def test_parse_article_album_list(self):
        daum_club_album.urlopen = lambda *args, **kwargs: \
            codecs.open('html/article_album_list.html', encoding='cp949').read()

        url = u'http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album'
        result = parse_article_album_list(url)

        # validate
        assert len(result) is 15
        assert result[0]  == (4089, u'암벽교실 1..', u'11.05.31', u'JK(김진)', u'/_c21_/album_read?grpid=ccJT&fldid=_album&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0013xzzzzzzzzzzzzzzzzzzzzzzzzz&datanum=4089&edge=F&listnum=15')
        assert result[-1] == (4075, u'설교벽2', u'11.05.30', u'리투(이재용)', u'/_c21_/album_read?grpid=ccJT&fldid=_album&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0013jzzzzzzzzzzzzzzzzzzzzzzzzz&datanum=4075&edge=L&listnum=15')

    def test_parse_article_album_view(self):
        daum_club_album.urlopen = lambda *args, **kwargs: \
            codecs.open('html/article_album_view.html', encoding='cp949').read()

        url = 'http://cafe986.daum.net/_c21_/album_read?grpid=ccJT&fldid=_album&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0013xzzzzzzzzzzzzzzzzzzzzzzzzz&datanum=4089&edge=F&listnum=15'
        result = parse_article_album_view(url)

        # validate
        assert len(result.image_list) is 16
        assert result.title == u'암벽교실 16기_1주차: 백운대 (4) - 지웅씨가 찍은 사진입니다.'
        assert result.url == u'http://cafe.daum.net/loveclimb/_album/4089'
        assert result.author == u'JK(김진)'
        assert result.post_date == u'2011.05.31. 22:45'


if __name__ == '__main__':
    unittest.main()

