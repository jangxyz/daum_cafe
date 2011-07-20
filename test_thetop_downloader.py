#!/usr/bin/python

import unittest

import thetop_downloader

class Mock:
    def __init__(self, *args, **kwargs):
        # keep args and kwargs
        self.__args   = args
        self.__kwargs = kwargs
        #
        for k,v in kwargs.iteritems():
            # self-made type to make it as instance method
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


#class FileAlreadyExistsErrorTestCase(unittest.TestCase):
#    def setUp(self):
#        self.backups = {
#            'urllib'                   : thetop_downloader.urllib,
#            'get_filename_from_header' : thetop_downloader.get_filename_from_header,
#        }
#
#        # stub urlretrieve
#        thetop_downloader.urllib.urlretrieve       = lambda url: ('tmpfile', 'header')
#        thetop_downloader.get_filename_from_header = lambda header: 'filename'
#        thetop_downloader.unescape = lambda filename: filename
#
#    def tearDown(self):
#        #thetop_downloader.urllib = self.backups['urllib']
#        for k,v in self.backups.iteritems():
#            setattr(thetop_downloader, k, v)
#
#    def test_remove_result_file_if_already_exists_only_on_windows(self):
#        # download to temp
#        #thetop_downloader.download(current_page, cached_articles, articles, selected)
#        # move
#
#        raise AssertionError, "Fix name for TestCase and test method, then write some real test code here"

class SafeDirnameTestCase(unittest.TestCase):
    def test_safe_dirname(self):
        ''' \ / : * ? " < > | '''
        dirnames = {
            'space is fine'      : 'space is fine',
            'fix:colon'          : 'fix_colon',
            'fix*asterisk'       : 'fix_asterisk',
            'question?'          : 'question_',
            'double"quotes'      : 'double_quotes',
            '<brackets>are_evil' : '_brackets_are_evil',
            'p|pe'               : 'p_pe',
            'forward/slash'      : 'forward_slash',
            'back\\slash'        : 'back_slash',
        }
        for invalid, valid in dirnames.items():
            assert thetop_downloader.safe_dirname(invalid) == valid, "'%s' != '%s'" % (invalid, valid)


if __name__ == '__main__':
    unittest.main()

