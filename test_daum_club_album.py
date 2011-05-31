#!/usr/bin/python
'''
<+ template in $VIMHOME/templates/py_test.tpl. type CTRL-J to advance to next +>
'''

import unittest
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
            'urllib2.urlopen': urllib2.urlopen
        }

    def tearDown(self):
        urllib2.urlopen = self.backups['urllib2.urlopen']

    def test_login(self):
        urllib2.urlopen = lambda *args, **kwargs: Mock(
            read = lambda: open('login_page.html').read()
        )

        # 
        if is_logged_in() is not True:
            raise AssertionError, "is_logged_in() should return True, but didn't"

    def test_logout(self):
        urllib2.urlopen = lambda *args, **kwargs: Mock(
            read = lambda: open('logout_page.html').read()
        )
        
        # 
        if is_logged_in() is not False:
            raise AssertionError, "is_logged_in() should return True, but didn't"


if __name__ == '__main__':
    unittest.main()

