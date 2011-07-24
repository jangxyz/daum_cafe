#!/usr/bin/python
# -*- coding: utf8 -*-

"""

"""
import urllib
import urllib2
import urlparse
import htmlentitydefs
import re

ARTICLE_TIMEOUTS  = [15,30,60]
DOWNLOAD_TIMEOUTS = [30,60,60,120,300]

def urlopen(url, timeouts=None):
    ''' open site and return response '''
    timeouts = timeouts or [300, 300, 300] # default to wait 5 minutes 3 times

    last_exception = None
    for timeout in timeouts:
        try:
            # HERE
            site = urllib2.urlopen(url, timeout=timeout)
            return site
        # timeout occured
        except IOError as e:
            last_exception = e
            continue
        except httplib.HTTPException as e:
            last_exception = e
            continue
    # all retries failed
    else:
        raise last_exception

def urlread(url, timeouts=None):
    ''' open url, read the content and decode from encoding '''
    timeouts = timeouts or [300, 300, 300] # default to wait 5 minutes 3 times

    last_exception = None
    for timeout in timeouts:
        try:
            site = urlopen(url, timeouts=[timeout])
            text = site.read()
            encoding = get_encoding_from_header(site.headers)
            return text.decode(encoding)
        # timeout occured
        except IOError as e:
            last_exception = e
            continue
        except httplib.HTTPException as e:
            last_exception = e
            continue
    # all retries failed
    else:
        raise last_exception


def urlretrieve(url, response, timeouts=None):
    ''' download to temp file. mostly copied from urllib.py '''
    timeouts = timeouts or [300, 300, 300] # default to wait 5 minutes 3 times

    # tmp filename
    import tempfile
    path   = urlparse.urlsplit(url).path
    suffix = os.path.splitext(path)[1]
    (fd, tmp_filename) = tempfile.mkstemp(suffix)

    # write
    headers = response.headers.dict
    tmpfile = os.fdopen(fd, 'wb')
    try:
        block_size = 1024*8
        read       =  0
        size       = -1
        if "content-length" in headers:
            size = int(headers["content-length"])
        while True:
            last_exception = None
            for timeout in timeouts:
                # download block
                try:
                    block = response.read(block_size)
                    break
                # timeout
                except IOError as e:
                    last_exception = e
                    continue
                except httplib.HTTPException as e:
                    last_exception = e
                    continue
            # all retries failed
            else:
                raise last_exception


            if block == "":
                break
            read += len(block)
            tmpfile.write(block)
    finally:
        tmpfile.close()
    if size >= 0 and read < size:
        raise urllib.ContentTooShortError("retrieval incomplete: got only %i out of %i bytes" \
                                           % (read, size), (tmp_filename, headers))

    return tmp_filename



def get_encoding_from_header(header=None, url=None):
    ''' strip encoding of content from header
    
    if header is not given but url is given instead, it will fetch header 
    from url and then proceed
    '''
    if header is None:
        site = urlopen(url, timeouts=ARTICLE_TIMEOUTS)
        header = site.headers
    ct = header.dict['content-type'].strip()
    param = ct.split(';', 1)[1].strip()
    encoding = param.partition('charset=')[2]
    return encoding

def get_filename_from_header(header=None, url=None):
    ''' strip filename from header 

    if header is not given but url is given instead, it will fetch header 
    from url and then proceed
    '''
    if header is None:
        site = urlopen(url, timeouts=ARTICLE_TIMEOUTS)
        header = site.headers
    try:
        cd = header.dict['content-disposition'].strip()
        param = cd.split(';', 1)[1].strip()
        filename = param.partition('filename=')[2].strip('"')
        return filename
    except:
        raise Exception("parse error")


def get_domain(url, path=None):
    ''' read domain part from given url. if path is given, paste it and return 
    the full url

        urlparse:
            <scheme>://<netloc>/<path>;<params>?<query>#<fragment>
    '''
    parse_result = urlparse.urlparse(url)
    domain = '''%(scheme)s://%(netloc)s''' % parse_result._asdict()
    domain = domain.rstrip('/')

    # paste path if any
    if path:
        return domain + "/" + unescape(path).lstrip('/')

    return domain


def unescape(text, repeat=None):
    ''' unescape HTML special characters to normal characters, for instance
    '&gt;' into '>'
    
    from http://effbot.org/zone/re-sub.htm#unescape-html '''
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


# vim: sts=4 et
