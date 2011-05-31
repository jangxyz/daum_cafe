#!/usr/bin/python
'''
<+ template in $VIMHOME/templates/py_test.tpl. type CTRL-J to advance to next +>
'''

import unittest
from daum_club_album import *

class Mock:
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs

class LoginTestCase(unittest.TestCase):
    def setUp(self):
        self.backups = {
            'urllib2': urllib2
        }

    def tearDown(self):
        urllib2 = self.backups['urllib2']

    def test_login(self):
        readable = Mock()
        readable.read = lambda: open('login_page.html').read()
        urllib2.urlopen = lambda *args, **kwargs: readable

        # 
        if is_logged_in() is not True:
            raise AssertionError, "is_logged_in() should return True, but didn't"

    def test_logout(self):
        readable = Mock()
        readable.read = lambda: open('logout_page.html').read()
        urllib2.urlopen = lambda *args, **kwargs: readable
        
        # 
        if is_logged_in() is not False:
            raise AssertionError, "is_logged_in() should return True, but didn't"


if __name__ == '__main__':
    unittest.main()

