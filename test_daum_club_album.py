#!/usr/bin/python
'''
<+ template in $VIMHOME/templates/py_test.tpl. type CTRL-J to advance to next +>
'''

import unittest
import types

import daum_club_album
from daum_club_album import *

class Mock:
    def __init__(self, *args, **kwargs):
        self.__args = args
        self.__kwargs = kwargs
        for k,v in kwargs.iteritems():
            setattr(self, k, v)

class LoginTestCase(unittest.TestCase):
    def setUp(self):
        self.backups = {
            'urlopen': daum_club_album.urlopen
        }

    def tearDown(self):
        daum_club_album.urlopen = self.backups['urlopen']

    def test_login(self):
        daum_club_album.urlopen = lambda *args, **kwargs: \
            open('login_page.html').read()

        # 
        if is_logged_in() is not True:
            raise AssertionError, "is_logged_in() should return True, but didn't"

    def test_logout(self):
        daum_club_album.urlopen = lambda *args, **kwargs: \
            open('logout_page.html').read()
        
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
        c = daum_club_album.cookielib = Mock(cookiejar_count=0)
        def _counter(self):
            self.cookiejar_count += 1
        daum_club_album.cookielib.CookieJar = \
            types.MethodType(_counter, c, Mock)

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



if __name__ == '__main__':
    unittest.main()

